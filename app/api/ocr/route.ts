import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

const PROMPT = `你會看到一張台灣的訂單截圖或發票照片。只擷取「貓砂、貓飼料、貓罐頭」類商品，其他品項一律忽略。
只回傳 JSON：{"date":"YYYY-MM-DD 或 null","channel":"通路名稱或 null","items":[{"name":"商品名稱","quantity":數量,"total_price":該品項總金額}]}。
看不清楚的欄位填 null，不要猜。`;

export async function POST(req: Request) {
  const db = admin();
  const key = process.env.GEMINI_API_KEY;
  if (!db || !key) return NextResponse.json({ error: '伺服器尚未設定 Supabase 或 Gemini 金鑰' }, { status: 500 });

  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: '請先登入' }, { status: 401 });

  const { path } = (await req.json()) as { path?: string };
  if (!path?.startsWith(`${auth.user.id}/`)) return NextResponse.json({ error: '檔案路徑不正確' }, { status: 403 });

  const { data: file, error } = await db.storage.from('proofs').download(path);
  if (error || !file) return NextResponse.json({ error: '找不到上傳的檔案' }, { status: 404 });
  const base64 = Buffer.from(await file.arrayBuffer()).toString('base64');

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: '辨識服務暫時無法使用' }, { status: 502 });
  const out = await res.json();
  try {
    const text = out.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    return NextResponse.json(JSON.parse(text));
  } catch {
    return NextResponse.json({ error: '辨識結果無法解析' }, { status: 502 });
  }
}
