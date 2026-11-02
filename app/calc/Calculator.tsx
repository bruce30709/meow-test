'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Category } from '@/lib/types';

export type CalcProduct = {
  id: string; category: Category; label: string;
  cost: number | null; catDays: number | null; source: 'purchase' | 'self' | null;
};

const DAY = 86_400_000;
const nt = (v: number, d = 0) => `NT$${v.toLocaleString('zh-TW', { minimumFractionDigits: d, maximumFractionDigits: d })}`;

export default function Calculator({ products, medians }: { products: CalcProduct[]; medians: Record<Category, number | null> }) {
  const [category, setCategory] = useState<Category>('litter');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  const [mode, setMode] = useState<'days' | 'dates'>('days');
  const [days, setDays] = useState('');
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const [cats, setCats] = useState('1');
  const [copied, setCopied] = useState(false);

  const options = products.filter((p) => p.category === category);
  const product = options.find((p) => p.id === productId);
  const noun = category === 'litter' ? '貓砂' : '飼料';
  const verb = category === 'litter' ? '用' : '吃';

  const r = useMemo(() => {
    const total = Number(price), q = Math.max(1, Math.floor(Number(qty)) || 1), n = Math.max(1, Math.floor(Number(cats)) || 1);
    if (!(total > 0)) return { error: '先填這次花了多少錢。' };
    let perBag: number;
    if (mode === 'days') {
      perBag = Number(days);
      if (!(perBag > 0)) return { error: `再填全家一包大約${verb}幾天。` };
    } else {
      if (!d1 || !d2) return { error: '填上次和這次購買的日期。' };
      const gap = (new Date(d2).getTime() - new Date(d1).getTime()) / DAY;
      if (!(gap > 0)) return { error: '這次的日期要比上次晚。' };
      perBag = gap / q; // 上次買的量用到這次補貨
    }
    const bagPrice = total / q;
    const cost = bagPrice / (perBag * n);
    const median = medians[category];
    const ranked = options.filter((p) => p.cost != null && p.cost > 0);
    const cheaperThan = ranked.filter((p) => p.cost! > cost).length;
    return {
      cost, perBag, n, bagPrice,
      month: cost * n * 30, year: cost * n * 365,
      vsMedian: median ? (cost - median) / median : null, median,
      cheaperThan, rankedCount: ranked.length,
    };
  }, [price, qty, cats, mode, days, d1, d2, category, medians, options, verb]);

  async function share() {
    if ('error' in r) return;
    const text = `我家 ${r.n} 貓的${noun}${product ? `（${product.label}）` : ''}每貓每天 ${nt(r.cost!, 1)}，一年大約 ${nt(r.year!)}。你家呢？ ${location.origin}/calc`;
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* 瀏覽器不給剪貼簿就算了 */ }
  }

  return (
    <div className="form">
      <div className="row seg">
        {(['litter', 'food'] as Category[]).map((c) => (
          <a key={c} href="#" className={category === c ? 'on' : ''} onClick={(e) => { e.preventDefault(); setCategory(c); setProductId(''); }}>
            {c === 'litter' ? '貓砂' : '飼料'}
          </a>
        ))}
      </div>

      <label htmlFor="c-product">你用的是哪一款（選填）
        <select id="c-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">不在清單上／不想說</option>
          {options.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </label>

      <div className="grid2">
        <label htmlFor="c-price">這次花了多少錢（NT$）<input id="c-price" type="number" min={1} inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="例如 599" /></label>
        <label htmlFor="c-qty">買了幾包<input id="c-qty" type="number" min={1} inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
        <label htmlFor="c-cats">家裡幾隻貓<input id="c-cats" type="number" min={1} max={20} inputMode="numeric" value={cats} onChange={(e) => setCats(e.target.value)} /></label>
      </div>

      <div className="row seg">
        <span className="small muted">一包能{verb}多久</span>
        <a href="#" className={mode === 'days' ? 'on' : ''} onClick={(e) => { e.preventDefault(); setMode('days'); }}>我大概知道幾天</a>
        <a href="#" className={mode === 'dates' ? 'on' : ''} onClick={(e) => { e.preventDefault(); setMode('dates'); }}>我記得上次哪天買</a>
      </div>
      {mode === 'days' ? (
        <label htmlFor="c-days">全家一包大約{verb}幾天<input id="c-days" type="number" min={1} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} placeholder="例如 21" /></label>
      ) : (
        <div className="grid2">
          <label htmlFor="c-d1">上次買的日期<input id="c-d1" type="date" value={d1} onChange={(e) => setD1(e.target.value)} /></label>
          <label htmlFor="c-d2">這次買的日期<input id="c-d2" type="date" value={d2} onChange={(e) => setD2(e.target.value)} /></label>
          <p className="small muted" style={{ gridColumn: '1 / -1', margin: 0 }}>會假設上次買的包數（上面的「買了幾包」）剛好用到這次補貨。</p>
        </div>
      )}

      {'error' in r ? (
        <p className="muted small">{r.error}</p>
      ) : (
        <div className="card">
          <div className="metrics">
            <div className="metric"><div className="v">{nt(r.cost!, 1)}</div><div className="k">每貓每天</div></div>
            <div className="metric"><div className="v">{nt(r.month!)}</div><div className="k">全家每月（30 天）</div></div>
            <div className="metric"><div className="v">{nt(r.year!)}</div><div className="k">全家每年</div></div>
            <div className="metric"><div className="v">{Math.round(r.perBag!)} 天</div><div className="k">一包{verb}幾天（{r.n} 貓）</div></div>
          </div>

          {r.median != null ? (
            <p style={{ margin: 0 }}>
              全站{noun}每貓每天中位數 <b className="num">{nt(r.median, 1)}</b>，你家
              {Math.abs(r.vsMedian!) < 0.05 ? <b> 差不多</b>
                : r.vsMedian! > 0 ? <b style={{ color: 'var(--warn)' }}> 貴了 {Math.round(r.vsMedian! * 100)}%</b>
                : <b style={{ color: 'var(--accent)' }}> 省了 {Math.round(-r.vsMedian! * 100)}%</b>}
              {r.rankedCount! > 0 && <span className="small muted">（比 {r.cheaperThan}／{r.rankedCount} 款有資料的商品便宜）</span>}
            </p>
          ) : (
            <p className="small muted" style={{ margin: 0 }}>全站{noun}資料還不夠，暫時沒有中位數可以比。</p>
          )}

          {product && (
            product.cost != null && product.catDays != null ? (
              <p className="small" style={{ margin: 0 }}>
                這款在別人家：每貓每天 <b className="num">{nt(product.cost, 1)}</b>，
                換算成你家 {r.n} 貓一包約 <b className="num">{Math.round(product.catDays / r.n!)}</b> 天
                {product.source === 'self' && <span className="muted">（飼主自填估計）</span>}。
                {r.perBag! < (product.catDays / r.n!) * 0.75 && <span className="muted"> 你家用得比較快，可能是砂盆比較大或常整盆換。</span>}
              </p>
            ) : <p className="small muted" style={{ margin: 0 }}>這款還沒有其他家庭的成本資料，你上傳訂單就會是第一筆。</p>
          )}

          <div className="row">
            <button onClick={share}>{copied ? '已複製！' : '複製結果，分享到社群'}</button>
            <Link href="/purchase" className="small">上傳這張訂單，讓排行更準（+30 點）→</Link>
          </div>
        </div>
      )}
      <p className="small muted">計算方式：每貓每天 = 一包價格 ÷（一包{verb}幾天 × 貓數）。這頁的數字不會被儲存。</p>
    </div>
  );
}
