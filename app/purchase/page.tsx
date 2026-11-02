'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHousehold } from '@/components/useHousehold';
import type { Product } from '@/lib/types';

type Item = { name: string; quantity?: number | null; total_price?: number | null; product_id?: string | null };
type Parsed = { date?: string | null; channel?: string | null; items?: Item[] };

const today = () => new Date().toISOString().slice(0, 10);

export default function Purchase() {
  const { db, session, household, loading } = useHousehold();
  const [products, setProducts] = useState<Product[]>([]);
  const [proofPath, setProofPath] = useState<string | null>(null);
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [form, setForm] = useState({ product_id: '', purchased_at: today(), quantity: 1, price_twd: '', channel: '', full_replace: false });
  const [msg, setMsg] = useState('');
  const [hint, setHint] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db?.from('products').select('*').order('brand').then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [db]);

  if (!db) return <main><h1>上傳訂單</h1><p className="notice">示意模式不能上傳，請先設定 Supabase。可以先試試 <Link href="/calc">成本計算機</Link>（不用登入）。</p></main>;
  if (loading) return <main><p className="muted">載入中…</p></main>;
  if (!household || !session) return <main><h1>上傳訂單</h1><p>請先到 <Link href="/me">我的家</Link> 登入並填寫家庭情境。</p></main>;

  function pick(i: number, p: Parsed = parsed ?? {}) {
    const it = p.items?.[i];
    if (!it) return;
    setPicked(i);
    setForm((f) => ({
      ...f,
      purchased_at: p.date ?? f.purchased_at,
      channel: p.channel ?? f.channel,
      quantity: it.quantity && it.quantity > 0 ? it.quantity : 1,
      price_twd: it.total_price != null && it.total_price > 0 ? String(it.total_price) : '',
      product_id: it.product_id ?? '',
    }));
  }

  async function upload(file: File) {
    if (!db || !session) return;
    setBusy(true); setMsg('辨識中…'); setHint(''); setParsed(null); setPicked(null); setDone([]); setProofPath(null);
    const path = `${session.user.id}/${Date.now()}-${file.name}`;
    const { error } = await db.storage.from('proofs').upload(path, file);
    if (error) { setBusy(false); return setMsg(error.message); }
    const res = await fetch('/api/ocr', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ path }) });
    const json = await res.json();
    setBusy(false);
    // 辨識失敗或沒有寵物商品：這張圖不能當證明，只能手動記錄（無點數）
    if (!res.ok) return setMsg(`${json.error ?? '辨識失敗'}。這張圖不能當購買證明，你仍可以手動記錄（沒有點數）。`);
    const p = json as Parsed;
    setProofPath(path);
    setParsed(p);
    pick(0, p);
    setMsg(p.items && p.items.length > 1 ? `辨識到 ${p.items.length} 個寵物商品，一筆一筆確認就好。` : '請確認辨識結果。');
  }

  async function save() {
    if (!db || !session || !household || !form.product_id) return;
    const price = form.price_twd ? Number(form.price_twd) : null;
    if (price != null && !(price > 0)) return setMsg('金額要大於 0，或留白。');
    setBusy(true); setHint('');
    const row = { ...form, price_twd: price };
    let error: string | null = null;
    if (proofPath) {
      const res = await fetch('/api/purchases', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ ...row, proof_path: proofPath }) });
      if (!res.ok) error = (await res.json()).error;
    } else {
      const r = await db.from('purchases').insert({ ...row, household_id: household.id });
      error = r.error?.message ?? null;
    }
    setBusy(false);
    if (error) return setMsg(error);

    // 同一款只記過一次 → 提醒補上一張舊訂單，就能算出一包用幾天
    const { count } = await db.from('purchases').select('id', { count: 'exact', head: true }).eq('product_id', form.product_id);
    if ((count ?? 0) < 2) setHint('再上傳一張「之前買同一款」的訂單，就能算出你家一包用幾天（兩張都有證明再 +20 點）。');

    if (proofPath && parsed?.items && picked != null) {
      const nextDone = [...done, picked];
      setDone(nextDone);
      const next = parsed.items.findIndex((_, i) => !nextDone.includes(i));
      if (next >= 0) { pick(next); return setMsg(`已記錄，獲得 30 點。還有 ${parsed.items.length - nextDone.length} 個品項可以記。`); }
    }
    setMsg(proofPath ? '已記錄，獲得 30 點。' : '已記錄。手動回報沒有點數，在排行中的權重也較低。');
    setProofPath(null); setParsed(null); setPicked(null); setDone([]);
  }

  const set = (k: string, v: string | number | boolean) => setForm({ ...form, [k]: v });
  const nameOf = (id?: string | null) => products.find((p) => p.id === id);

  return (
    <main>
      <h1>上傳訂單</h1>
      <p className="muted">上傳訂單截圖或發票照片，系統只辨識寵物商品，其他品項不會儲存。兩次購買同一款，就能自動算出一包用幾天。</p>
      <div className="notice small">小技巧：手邊有「之前買同一款」的舊訂單，一起傳上來，馬上就能算出你家一包用幾天。</div>
      <div className="form">
        <label htmlFor="proof">訂單截圖或發票照片
          <input id="proof" type="file" accept="image/*" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </label>
        {parsed?.items && parsed.items.length > 0 && (
          <div className="card small">
            <b>辨識到的寵物商品</b>
            {parsed.items.map((it, i) => {
              const p = nameOf(it.product_id);
              return (
                <div key={i} className="row">
                  <span style={{ flex: 1 }}>
                    {it.name} ×{it.quantity ?? 1}　NT${it.total_price ?? '?'}
                    <br /><span className="muted">{p ? `對應：${p.brand} ${p.name}` : '目錄裡沒有對到，請手動選商品'}</span>
                  </span>
                  {done.includes(i) ? <span className="tag">已記錄</span>
                    : <button className="ghost" disabled={picked === i} onClick={() => pick(i)}>{picked === i ? '確認中' : '記這筆'}</button>}
                </div>
              );
            })}
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
          <label htmlFor="price">總金額（NT$）<input id="price" type="number" min={1} value={form.price_twd} onChange={(e) => set('price_twd', e.target.value)} /></label>
          <label htmlFor="channel">通路<input id="channel" value={form.channel} onChange={(e) => set('channel', e.target.value)} placeholder="momo、蝦皮、寵物店…" /></label>
        </div>
        <label className="check" htmlFor="full"><input id="full" type="checkbox" checked={form.full_replace} onChange={(e) => set('full_replace', e.target.checked)} />這次是整盆全換（不是補砂）</label>
        <button onClick={save} disabled={busy || !form.product_id}>{proofPath ? '確認，領 30 點' : '手動記錄（無點數）'}</button>
        {msg && <p className="notice">{msg}</p>}
        {hint && <p className="notice">{hint}</p>}
      </div>
    </main>
  );
}
