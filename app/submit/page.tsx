'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useHousehold, writeLocalState } from '@/components/useHousehold';
import { needsVet, VET_MESSAGE } from '@/lib/guard';
import { SAMPLE_PRODUCTS } from '@/lib/sample';
import { ProductPackThumb } from '@/components/ProductVisual';
import { EditIcon } from '@/components/Icons';
import type { Product, Review } from '@/lib/types';

const SCALE = [1, 2, 3, 4, 5];

const STOOL_LABELS: Record<number, string> = {
  1: '1分：像羊便便一樣乾硬顆粒（太乾／缺水）',
  2: '2分：堅硬長條但表面多裂痕',
  3: '3分：標準完美長條狀，撿起不沾地（最理想）',
  4: '4分：表面濕潤柔軟長條，撿起微留痕跡（正常）',
  5: '5分：軟糊邊緣不規則團塊（偏軟便）',
  6: '6分：蓬鬆糊狀不成形（腹瀉軟便）',
  7: '7分：完全水狀無固體（嚴重水瀉）',
};

export default function SubmitTest() {
  const { db, isLocalMode, household, loading } = useHousehold();
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [productId, setProductId] = useState('royal-in27');
  const [day, setDay] = useState(0);
  const [f, setF] = useState<Record<string, string | boolean>>({
    palatability: true,
    stool_score: '3',
    coat: '5',
    dust: '2',
    clump: '5',
    tracking: '2',
    odor_d3: '5',
    odor_d7: '4',
    accepted: true,
  });
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [msg, setMsg] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('product');
      if (q) setProductId(q);
    }
    if (db) {
      db.from('products').select('*').order('brand').then(({ data }) => {
        if (data?.length) setProducts(data as Product[]);
      });
    }
  }, [db]);

  const product = products.find((p) => p.id === productId);
  const set = (k: string, v: string | boolean) => setF({ ...f, [k]: v });
  const comment = String(f.comment ?? '');
  const pros = String(f.pros ?? '');
  const cons = String(f.cons ?? '');
  const hasEmergency = needsVet(comment) || needsVet(pros) || needsVet(cons);

  if (loading) return <main><p className="muted">載入中…</p></main>;
  if (!household) {
    return (
      <main>
        <section className="card">
          <h1>提交標準實測</h1>
          <p>請先到 <Link href="/me"><b>我的貓窩</b></Link> 一鍵登入並確認家庭情境，即可開始填寫實測並領取 +80 EXP。</p>
          <Link href="/me" className="btn-primary" style={{ alignSelf: 'flex-start' }}>前往登入 →</Link>
        </section>
      </main>
    );
  }

  async function submit() {
    if (!household || !product || hasEmergency) return;
    setBusy(true); setMsg(''); setSubmittedId(null);
    const pts = day === 30 ? 50 : 80;
    const today = new Date().toISOString().slice(0, 10);

    if (isLocalMode || !db) {
      const newReview: Review = {
        id: `local-rev-${Date.now()}`,
        product_id: product.id,
        display_name: household.display_name,
        cats: household.cats,
        housing: household.housing,
        source_tag: '本機實測提交',
        pros: pros.trim() || undefined,
        cons: cons.trim() || undefined,
        comment: comment.trim() || `完成 ${product.brand} ${product.name} 的居家標準實測。`,
        sponsored: false,
        verified: true,
        day,
        created_at: today,
      };
      writeLocalState((prev) => ({
        ...prev,
        reviews: [newReview, ...prev.reviews],
        points: [
          {
            id: `pt-${Date.now()}`,
            delta: pts,
            reason: 'test',
            label: `完成${day === 30 ? '第 30 天追蹤' : '標準實測'}：${product.brand} ${product.name}`,
            created_at: today,
          },
          ...prev.points,
        ],
      }));
      setBusy(false);
      setSubmittedId(product.id);
      setMsg(`實測已成功送出，已為您入帳 +${pts} EXP，您的評論已經同步顯示在商品頁面中。`);
      return;
    }

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
    const bagDays = n('bag_days');
    const { error } = await db.from('tests').insert({
      household_id: household.id, product_id: product.id, day, photo_paths: paths, comment: comment || null,
      bag_days: bagDays && bagDays >= 1 && bagDays <= 365 ? Math.round(bagDays) : null, ...row,
    });
    setBusy(false);
    setMsg(error ? (error.code === '23505' ? '這款商品的這次實測已經送過了。' : error.message) : `已送出，獲得 +${pts} EXP。`);
    if (!error) setSubmittedId(product.id);
  }

  const ScalePills = ({ k, label, hint, low, high }: { k: string; label: string; hint: string; low: string; high: string }) => (
    <div className="scale-field card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <b>{label}</b>
        <span className="tag plain">目前選擇：{String(f[k] ?? '—')} 分</span>
      </div>
      <span className="small muted">{hint}</span>
      <div className="pill-scale">
        {SCALE.map((v) => (
          <button
            type="button"
            key={v}
            className={`scale-btn ${String(f[k]) === String(v) ? 'on' : ''}`}
            onClick={() => set(k, String(v))}
          >
            {v} 分
          </button>
        ))}
      </div>
      <div className="row small muted" style={{ justifyContent: 'space-between' }}>
        <span>1 分：{low}</span>
        <span>5 分：{high}</span>
      </div>
    </div>
  );

  const Check = ({ k, label }: { k: string; label: string }) => (
    <label className="check check-card" htmlFor={k}>
      <input id={k} type="checkbox" checked={Boolean(f[k])} onChange={(e) => set(k, e.target.checked)} />
      <span>{label}</span>
    </label>
  );

  return (
    <main>
      <section className="hero-compact card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h1 className="row" style={{ gap: 8 }}><EditIcon size={20} /> 居家 3 分鐘標準實測</h1>
            <p className="muted" style={{ margin: 0 }}>
              貢獻值（EXP）只看「是否完成填寫」，與你給幾分完全無關。你的家庭標籤（<b>{household.display_name} · {household.cats} 隻貓</b>）將自動帶入。
            </p>
          </div>
          <span className="points-badge" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
            完成獎勵 +{day === 30 ? 50 : 80} EXP
          </span>
        </div>
      </section>

      <div className="card form">
        <div className="grid2">
          <label htmlFor="product">
            1. 選擇要實測的商品
            <select id="product" value={productId} onChange={(e) => { setProductId(e.target.value); setSubmittedId(null); }}>
              <option value="">選擇商品</option>
              <optgroup label="熱門貓飼料">
                {products.filter((p) => p.category === 'food' && !p.prescription).map((p) => (
                  <option key={p.id} value={p.id}>{p.brand}｜{p.name}</option>
                ))}
              </optgroup>
              <optgroup label="熱門貓砂">
                {products.filter((p) => p.category === 'litter' && !p.prescription).map((p) => (
                  <option key={p.id} value={p.id}>{p.brand}｜{p.name}</option>
                ))}
              </optgroup>
            </select>
          </label>

          <label htmlFor="day">
            2. 實測階段
            <select id="day" value={day} onChange={(e) => setDay(Number(e.target.value))}>
              <option value={0}>開箱第一次標準實測（+80 EXP）</option>
              <option value={30}>使用滿第 30 天長期追蹤（+50 EXP）</option>
            </select>
          </label>
        </div>

        {product && (
          <div className="selected-product-bar">
            <ProductPackThumb product={product} size="sm" />
            <div>
              <b>{product.brand} {product.name}</b>
              <div className="small muted">{product.subtitle ?? product.specs}</div>
            </div>
          </div>
        )}

        {product?.category === 'litter' && (
          <>
            <h3>貓砂標準實測項目</h3>
            <div className="grid2">
              <ScalePills k="dust" label="01. 黑紙側光粉塵測試" hint="在黑色卡紙倒一杯砂，手機手電筒貼平側照" low="幾乎零粉塵" high="煙霧迷漫" />
              <ScalePills k="clump" label="02. 20ml 滴水結團硬度" hint="倒入 20ml 常溫水，靜置 60 秒後用貓砂鏟夾起" low="一夾就散" high="硬如石頭" />
              <ScalePills k="tracking" label="03. 帶砂沙漠化程度" hint="使用一週後，砂盆外落砂墊與地板的顆粒量" low="幾乎不帶砂" high="滿地沙漠" />
              <ScalePills k="odor_d7" label="04. 第 7 天除臭表現" hint="站在距離砂盆 1 公尺處的自然氣味感受" low="尿騷味濃" high="完全無異味" />
            </div>
            <Check k="accepted" label="貓咪願意正常進盆使用，沒有在砂盆外憋尿或亂尿" />
          </>
        )}

        {product?.category === 'food' && (
          <>
            <h3>貓飼料飼主觀察項目（非醫療診斷）</h3>
            <div className="grid2">
              <Check k="palatability" label="適口性佳（放飯後願意主動吃完，不需額外拌罐頭誘食）" />
              <Check k="soft_stool_on_switch" label="換糧第一週內曾出現軟便或拉肚子" />
              <Check k="vomit_weekly" label="每週發生嘔吐（含吐飼料或毛球）1 次以上" />
              <Check k="vet_suggested" label="這款飼料是獸醫師曾建議我購買的" />
            </div>

            <div className="grid2">
              <label htmlFor="stool_score">
                便便布里斯托評分（1–7 分，3–4 分最理想）
                <select id="stool_score" value={String(f.stool_score ?? '3')} onChange={(e) => set('stool_score', e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7].map((v) => <option key={v} value={v}>{STOOL_LABELS[v]}</option>)}
                </select>
              </label>
              <ScalePills k="coat" label="毛髮光澤與柔順度觀察" hint="連續食用 2–4 週後梳毛時的觸感" low="乾澀易掉屑" high="柔順發亮" />
            </div>
          </>
        )}

        {product && (
          <>
            <h3>實測優缺點與心得分享</h3>
            <div className="grid2">
              <label htmlFor="pros">
                最滿意的優點（選填）
                <input id="pros" value={pros} onChange={(e) => set('pros', e.target.value)} placeholder="例如：適口性超好、便臭味明顯變淡" />
              </label>
              <label htmlFor="cons">
                需要注意的缺點（選填）
                <input id="cons" value={cons} onChange={(e) => set('cons', e.target.value)} placeholder="例如：蛋白質較高換糧要慢、夾鏈袋不好封" />
              </label>
            </div>

            <div className="grid2">
              <label htmlFor="bag_days">
                全家一包大約{product.category === 'litter' ? '用' : '吃'}幾天（選填，你家目前 {household.cats} 隻貓）
                <input id="bag_days" type="number" min={1} max={365} value={String(f.bag_days ?? '')} onChange={(e) => set('bag_days', e.target.value)} placeholder="例如：28" />
              </label>
              <label htmlFor="photos">
                附上實測照片（黑紙粉塵／結團／顆粒照，選填）
                <input id="photos" type="file" accept="image/*" multiple onChange={(e) => setPhotos(e.target.files)} />
              </label>
            </div>

            <label htmlFor="comment">
              完整實測心得（公開顯示於商品頁；試試輸入「尿不出來」可測試急症攔截）
              <textarea
                id="comment"
                rows={3}
                value={comment}
                onChange={(e) => set('comment', e.target.value)}
                placeholder="分享你家貓咪的真實反應、換糧過程或混砂比例…"
              />
            </label>

            {hasEmergency && <p className="alert">{VET_MESSAGE}</p>}

            <div className="row" style={{ gap: 12 }}>
              <button onClick={submit} disabled={busy || hasEmergency}>
                {busy ? '送出中…' : `送出實測，立即領取 +${day === 30 ? 50 : 80} EXP`}
              </button>
              {submittedId && (
                <Link href={`/products/${submittedId}`} className="btn-secondary">
                  前往「{product.brand}」商品頁查看你的評論 →
                </Link>
              )}
            </div>
          </>
        )}
        {msg && <p className="notice">{msg}</p>}
      </div>
    </main>
  );
}
