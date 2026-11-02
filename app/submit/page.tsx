'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHousehold } from '@/components/useHousehold';
import { needsVet, VET_MESSAGE } from '@/lib/guard';
import type { Product } from '@/lib/types';

const SCALE = [1, 2, 3, 4, 5];

export default function SubmitTest() {
  const { db, household, loading } = useHousehold();
  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState('');
  const [day, setDay] = useState(0);
  const [f, setF] = useState<Record<string, string | boolean>>({});
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    db?.from('products').select('*').order('brand').then(({ data }) => setProducts((data ?? []) as Product[]));
  }, [db]);

  const product = products.find((p) => p.id === productId);
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v });
  const comment = String(f.comment ?? '');

  if (!db) return <main><h1>標準實測</h1><p className="notice">示意模式不能送出實測，請先設定 Supabase。</p></main>;
  if (loading) return <main><p className="muted">載入中…</p></main>;
  if (!household) return <main><h1>標準實測</h1><p>請先到 <Link href="/me">我的家</Link> 登入並填寫家庭情境。</p></main>;

  async function submit() {
    if (!db || !household || !product || needsVet(comment)) return;
    setBusy(true); setMsg('');
    const { data: u } = await db.auth.getUser();
    const paths: string[] = [];
    for (const file of Array.from(photos ?? [])) {
      const path = `${u.user!.id}/${Date.now()}-${file.name}`;
      const { error } = await db.storage.from('tests').upload(path, file);
      if (!error) paths.push(path);
    }
    const n = (k: string) => (f[k] ? Number(f[k]) : null);
    const b = (k: string) => (k in f ? Boolean(f[k]) : null);
    const row = product.category === 'litter'
      ? { dust: n('dust'), clump: n('clump'), tracking: n('tracking'), odor_d3: n('odor_d3'), odor_d7: n('odor_d7'), accepted: b('accepted') }
      : { palatability: b('palatability'), stool_score: n('stool_score'), soft_stool_on_switch: b('soft_stool_on_switch'), vomit_weekly: b('vomit_weekly'), coat: n('coat'), vet_suggested: b('vet_suggested') };
    const { error } = await db.from('tests').insert({
      household_id: household.id, product_id: product.id, day, photo_paths: paths, comment: comment || null, ...row,
    });
    setBusy(false);
    setMsg(error ? (error.code === '23505' ? '這款商品的這次實測已經送過了。' : error.message) : `已送出，獲得 ${day === 30 ? 50 : 80} 點。`);
  }

  const Scale = ({ k, label, hint }: { k: string; label: string; hint: string }) => (
    <label htmlFor={k}>{label}<span className="small muted">{hint}</span>
      <select id={k} value={String(f[k] ?? '')} onChange={(e) => set(k, e.target.value)}>
        <option value="">—</option>{SCALE.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
    </label>
  );
  const Check = ({ k, label }: { k: string; label: string }) => (
    <label className="check" htmlFor={k}><input id={k} type="checkbox" checked={Boolean(f[k])} onChange={(e) => set(k, e.target.checked)} />{label}</label>
  );

  return (
    <main>
      <h1>標準實測</h1>
      <p className="muted">約 3 分鐘。點數只看有沒有完成，跟你給幾分無關。</p>
      <div className="form">
        <label htmlFor="product">商品
          <select id="product" value={productId} onChange={(e) => { setProductId(e.target.value); setF({}); }}>
            <option value="">選擇商品</option>
            {products.filter((p) => !p.prescription).map((p) => <option key={p.id} value={p.id}>{p.category === 'litter' ? '貓砂' : '飼料'}｜{p.brand} {p.name}</option>)}
          </select>
        </label>
        <label htmlFor="day">這次是
          <select id="day" value={day} onChange={(e) => setDay(Number(e.target.value))}>
            <option value={0}>第一次實測（+80 點）</option>
            <option value={30}>第 30 天追蹤（+50 點）</option>
          </select>
        </label>

        {product?.category === 'litter' && (
          <div className="grid2">
            <Scale k="dust" label="粉塵" hint="黑紙上倒一杯砂，手電筒側光拍照。1 最少、5 最多" />
            <Scale k="clump" label="結團" hint="滴 20 ml 水等 1 分鐘夾起。1 散掉、5 很硬" />
            <Scale k="tracking" label="帶砂" hint="一週後砂盆外的砂量。1 最少、5 最多" />
            <Scale k="odor_d3" label="除臭（第 3 天）" hint="1 很臭、5 幾乎沒味道" />
            <Scale k="odor_d7" label="除臭（第 7 天）" hint="1 很臭、5 幾乎沒味道" />
            <Check k="accepted" label="貓願意用，沒有在砂盆外上廁所" />
          </div>
        )}
        {product?.category === 'food' && (
          <div className="grid2">
            <Check k="palatability" label="通常會吃完" />
            <label htmlFor="stool_score">便便評分<span className="small muted">對照市售 1–7 分圖：1 很硬、7 水狀</span>
              <select id="stool_score" value={String(f.stool_score ?? '')} onChange={(e) => set('stool_score', e.target.value)}>
                <option value="">—</option>{[1, 2, 3, 4, 5, 6, 7].map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <Check k="soft_stool_on_switch" label="換糧一週內有軟便" />
            <Check k="vomit_weekly" label="每週嘔吐 1 次以上" />
            <Scale k="coat" label="毛髮" hint="1 乾澀、5 很亮" />
            <Check k="vet_suggested" label="這款是獸醫建議我買的" />
          </div>
        )}

        {product && (
          <>
            <label htmlFor="photos">實測照片（選填）<input id="photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} /></label>
            <label htmlFor="comment">心得（公開）<textarea id="comment" rows={3} value={comment} onChange={(e) => set('comment', e.target.value)} /></label>
            {needsVet(comment) && <p className="alert">{VET_MESSAGE}</p>}
            <button onClick={submit} disabled={busy || needsVet(comment)}>{busy ? '送出中…' : '送出實測'}</button>
          </>
        )}
        {msg && <p className="notice">{msg}</p>}
      </div>
    </main>
  );
}
