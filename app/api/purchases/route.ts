import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

// 有購買證明的紀錄由伺服器寫入並標為已驗證；用戶端只能寫未驗證的手動紀錄
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

  const { data: dup } = await db.from('purchases').select('id').eq('proof_path', body.proof_path).maybeSingle();
  if (dup) return NextResponse.json({ error: '這張證明已經上傳過了' }, { status: 409 });

  const { error } = await db.from('purchases').insert({
    household_id: household.id,
    product_id: body.product_id,
    purchased_at: body.purchased_at,
    quantity: Math.max(1, Number(body.quantity) || 1),
    price_twd: body.price_twd == null ? null : Number(body.price_twd),
    channel: body.channel || null,
    full_replace: Boolean(body.full_replace),
    proof_path: body.proof_path,
    verified: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
