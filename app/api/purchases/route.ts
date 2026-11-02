import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

// 有購買證明的紀錄由伺服器寫入並標為已驗證；用戶端只能寫未驗證的手動紀錄。
// 只有 /api/ocr 確實辨識出寵物商品的證明，才能拿來記「已驗證」購買。
export async function POST(req: Request) {
  const db = admin();
  if (!db) return NextResponse.json({ error: '伺服器尚未設定 Supabase' }, { status: 500 });

  const token = req.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  const { data: auth } = await db.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: '請先登入' }, { status: 401 });

  const body = await req.json();
  if (typeof body.proof_path !== 'string' || !body.proof_path.startsWith(`${auth.user.id}/`)) {
    return NextResponse.json({ error: '缺少購買證明' }, { status: 400 });
  }
  const { data: household } = await db.from('households').select('id').eq('user_id', auth.user.id).single();
  if (!household) return NextResponse.json({ error: '請先填寫家庭情境' }, { status: 400 });

  const { data: ocr } = await db.from('ocr_results').select('items, image_sha256')
    .eq('proof_path', body.proof_path).eq('user_id', auth.user.id).maybeSingle();
  const items = Array.isArray(ocr?.items) ? ocr.items : [];
  if (!ocr || items.length === 0) {
    return NextResponse.json({ error: '這張圖沒有辨識出寵物商品，不能當購買證明；可以改用手動記錄' }, { status: 400 });
  }

  // 同一張圖換檔名重傳
  const { data: same } = await db.from('ocr_results').select('proof_path')
    .eq('image_sha256', ocr.image_sha256).neq('proof_path', body.proof_path);
  if (same?.length) {
    const { count } = await db.from('purchases').select('id', { count: 'exact', head: true }).in('proof_path', same.map((r) => r.proof_path));
    if (count) return NextResponse.json({ error: '這張證明已經上傳過了' }, { status: 409 });
  }

  // 一張訂單可以記多個品項，但不能超過辨識到的品項數
  const { count: used } = await db.from('purchases').select('id', { count: 'exact', head: true }).eq('proof_path', body.proof_path);
  if ((used ?? 0) >= items.length) return NextResponse.json({ error: '這張證明上的品項都已經記錄過了' }, { status: 409 });

  const price = body.price_twd == null || body.price_twd === '' ? null : Number(body.price_twd);
  if (price != null && !(price > 0)) return NextResponse.json({ error: '金額要大於 0，或留白' }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.purchased_at))) return NextResponse.json({ error: '購買日期格式不正確' }, { status: 400 });

  const { error } = await db.from('purchases').insert({
    household_id: household.id,
    product_id: body.product_id,
    purchased_at: body.purchased_at,
    quantity: Math.max(1, Math.floor(Number(body.quantity)) || 1),
    price_twd: price,
    channel: body.channel || null,
    full_replace: Boolean(body.full_replace),
    proof_path: body.proof_path,
    verified: true,
  });
  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: '這張證明的這款商品已經記錄過了' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
