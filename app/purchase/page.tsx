'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHousehold } from '@/components/useHousehold';
import type { Product } from '@/lib/types';

type Parsed = { date?: string; channel?: string; items?: { name: string; quantity?: number; total_price?: number }[] };

export default function Purchase() {
  const { db, session, household, loading } = useHousehold();
  const [products, setProducts] = useState<Product[]>([]);
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [form, setForm] = useState({ product_id: '', purchased_at: new Date().toISOString().slice(0, 10), quantity: 1, price_twd: '', channel: '', full_replace: false });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db?.from('products').select('*').order('brand').then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [db]);

  if (!db) return <main><h1>上傳訂單</h1><p className="notice">示意模式不能上傳，請先設定 Supabase。</p></main>;
  if (loading) return <main><p className="muted">載入中…</p></main>;
  if (!household || !session) return <main><h1>上傳訂單</h1><p>請先到 <Link href="/me">我的家</Link> 登入並填寫家庭情境。</p></main>;

  async function upload(file: File) {
    if (!db || !session) return;
    setBusy(true); setMsg('辨識中…');
    const path = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error } = await db.storage.from('proofs').upload(path, file);
    if (error) { setBusy(false); return setMsg(error.message); }
    setProofPath(path);
    const res = await fetch('/api/ocr', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ path }) });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) return setMsg(`${json.error ?? '辨識失敗'}，請手動填寫。`);
    const p = json as Parsed;
    setParsed(p);
    const first = p.items?.[0];
    const guess = first && products.find((x) => first.name.includes(x.brand.replace(' 牌', '')) || first.name.includes(x.name));
    setForm((f) => ({
      ...f,
      purchased_at: p.date ?? f.purchased_at,
      channel: p.channel ?? f.channel,
      quantity: first?.quantity ?? f.quantity,
      price_twd: first?.total_price != null ? String(first.total_price) : f.price_twd,
      product_id: guess?.id ?? f.product_id,
    }));
    setMsg('請確認辨識結果。');
  }

  async function save() {
    if (!db || !session || !household || !form.product_id) return;
    setBusy(true);
    const row = { ...form, price_twd: form.price_twd ? Number(form.price_twd) : null };
    let error: string | null = null;
    if (proofPath) {
      const res = await fetch('/api/purchases', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ ...row, proof_path: proofPath }) });
      if (!res.ok) error = (await res.json()).error;
    } else {
      const r = await db.from('purchases').insert({ ...row, household_id: household.id });
      error = r.error?.message ?? null;
    }
    setBusy(false);
    setMsg(error ?? (proofPath ? '已記錄，獲得 30 點。' : '已記錄。手動回報沒有點數，在排行中的權重也較低。'));
    if (!error) { setProofPath(null); setParsed(null); }
  }

  const set = (k: string, v: string | number | boolean) => setForm({ ...form, [k]: v });

  return (
    <main>
      <h1>上傳訂單</h1>
      <p className="muted">上傳訂單截圖或發票照片，系統只辨識寵物商品，其他品項不會儲存。兩次購買同一款，就能自動算出一包用幾天。</p>
      <div className="form">
        <label htmlFor="proof">訂單截圖或發票照片
          <input id="proof" type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {parsed?.items && parsed.items.length > 0 && (
          <div className="card small">
            <b>辨識到的寵物商品</b>
            {parsed.items.map((it, i) => <span key={i}>{it.name} ×{it.quantity ?? 1}　NT${it.total_price ?? '?'}</span>)}
          </div>
        )}
        <label htmlFor="pid">商品
          <select id="pid" value={form.product_id} onChange={(e) => set('product_id', e.target.value)}>
            <option value="">選擇商品</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.brand} {p.name}</option>)}
          </select>
        </label>
        <div className="grid2">
          <label htmlFor="date">購買日期<input id="date" type="date" value={form.purchased_at} onChange={(e) => set('purchased_at', e.target.value)} /></label>
          <label htmlFor="qty">數量（包）<input id="qty" type="number" min={1} value={form.quantity} onChange={(e) => set('quantity', Number(e.target.value))} /></label>
          <label htmlFor="price">總金額（NT$）<input id="price" type="number" min={0} value={form.price_twd} onChange={(e) => set('price_twd', e.target.value)} /></label>
          <label htmlFor="channel">通路<input id="channel" value={form.channel} onChange={(e) => set('channel', e.target.value)} placeholder="momo、蝦皮、寵物店…" /></label>
        </div>
        <label className="check" htmlFor="full"><input id="full" type="checkbox" checked={form.full_replace} onChange={(e) => set('full_replace', e.target.checked)} />這次是整盆全換（不是補砂）</label>
        <button onClick={save} disabled={busy || !form.product_id}>{proofPath ? '確認，領 30 點' : '手動記錄（無點數）'}</button>
        {msg && <p className="notice">{msg}</p>}
      </div>
    </main>
  );
}
