import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

type Item = { name: string; quantity?: number | null; total_price?: number | null; product_id?: string | null };
type Parsed = { date?: string | null; channel?: string | null; items?: Item[] };

const prompt = (catalog: string) => `你會看到一張台灣的訂單截圖或發票照片。只擷取「貓砂、貓飼料、貓罐頭」類商品，其他品項一律忽略。
賣場標題常常很亂（例如「【免運現貨】某某牌 消臭豆腐砂 6L×3」），請對照下面的商品目錄，把每個品項對到最相符的 product_id；
品牌或品名對不上、或你不確定時，product_id 填 null，不要硬配。

商品目錄（product_id｜類別｜品牌 品名）：
${catalog}

只回傳 JSON：{"date":"YYYY-MM-DD 或 null","channel":"通路名稱或 null","items":[{"name":"訂單上的商品名稱","quantity":數量,"total_price":該品項總金額,"product_id":"目錄中的 id 或 null"}]}。
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
  const bytes = Buffer.from(await file.arrayBuffer());
  const sha = createHash('sha256').update(bytes).digest('hex');

  // 同一張圖換個檔名再傳一次：只要之前那份已經被拿去記過購買，就擋下
  const { data: same } = await db.from('ocr_results').select('proof_path').eq('image_sha256', sha).neq('proof_path', path);
  if (same?.length) {
    const { count } = await db.from('purchases').select('id', { count: 'exact', head: true }).in('proof_path', same.map((r) => r.proof_path));
    if (count) return NextResponse.json({ error: '這張證明已經上傳過了' }, { status: 409 });
  }

  const { data: products } = await db.from('products').select('id, category, brand, name');
  const ids = new Set((products ?? []).map((p) => p.id as string));
  const catalog = (products ?? [])
    .map((p) => `${p.id}｜${p.category === 'litter' ? '貓砂' : '飼料'}｜${p.brand} ${p.name}`)
    .join('\n');

  const model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(catalog) }, { inline_data: { mime_type: file.type || 'image/jpeg', data: bytes.toString('base64') } }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    }),
  });
  if (!res.ok) return NextResponse.json({ error: '辨識服務暫時無法使用' }, { status: 502 });
  const out = await res.json();

  let parsed: Parsed;
  try {
    parsed = JSON.parse(out.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}');
  } catch {
    return NextResponse.json({ error: '辨識結果無法解析' }, { status: 502 });
  }

  // 模型回傳的 id 不在目錄裡就當作沒對到
  const items = (Array.isArray(parsed.items) ? parsed.items : [])
    .filter((it) => it && typeof it.name === 'string' && it.name.trim())
    .map((it) => ({ ...it, product_id: it.product_id && ids.has(it.product_id) ? it.product_id : null }));
  const date = typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null;

  // 記下辨識結果；/api/purchases 只認這裡有辨識到寵物商品的證明
  const { error: saveErr } = await db.from('ocr_results').upsert({
    proof_path: path, user_id: auth.user.id, image_sha256: sha, items, purchased_on: date,
  });
  if (saveErr) return NextResponse.json({ error: saveErr.message }, { status: 500 });

  if (!items.length) return NextResponse.json({ error: '沒有在這張圖裡找到貓砂或飼料' }, { status: 422 });
  return NextResponse.json({ date, channel: parsed.channel ?? null, items });
}
