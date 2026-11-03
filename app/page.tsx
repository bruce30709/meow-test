'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { daysForHousehold, MIN_VERIFIED, rank, type SortKey } from '@/lib/scoring';
import { LITTER_TYPE_LABEL, SAMPLE_PRODUCTS, sampleStatsFor } from '@/lib/sample';
import { HOUSING_LABEL, type Category, type Housing, type Product, type Ranked } from '@/lib/types';
import { browser } from '@/lib/supabase';
import Disclaimer from '@/components/Disclaimer';
import { ProductPackThumb } from '@/components/ProductVisual';
import { BowlIcon, LitterIcon, CalcIcon, SensorIcon, VerifiedIcon, ArrowUpRightIcon } from '@/components/Icons';

const SORTS: Record<Category, [SortKey, string][]> = {
  food: [['score', '綜合評分'], ['repurchase', '真實回購率'], ['cost', '每日成本最低']],
  litter: [['score', '綜合評分'], ['repurchase', '真實回購率'], ['cost', '每日成本最低'], ['dust', '低粉塵表現']],
};

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<main><p className="muted">載入排行榜中…</p></main>}>
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardContent() {
  const sp = useSearchParams();
  const category: Category = sp.get('cat') === 'litter' ? 'litter' : 'food';
  const rawSort = sp.get('sort') ?? 'score';
  const sort = (SORTS[category].find(([k]) => k === rawSort)?.[0] ?? 'score') as SortKey;
  const catsParam = sp.get('cats');
  const cats = catsParam ? Number(catsParam) : undefined;
  const housing = (sp.get('housing') as Housing | null) ?? undefined;
  const sub = sp.get('sub') || undefined;

  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);

  useEffect(() => {
    const db = browser();
    if (!db) return;
    db.from('products').select('*').order('brand').then(({ data }) => {
      if (data && data.length > 0) {
        const sampleMap = new Map(SAMPLE_PRODUCTS.map((p) => [p.id, p]));
        setProducts((data as Product[]).map((p) => ({ ...sampleMap.get(p.id), ...p })));
      }
    });
  }, []);

  const filtered = cats != null || housing != null;
  const stats = sampleStatsFor(cats, housing);
  const overall = filtered ? sampleStatsFor() : undefined;

  const allRows = rank(products, stats, category, sort, overall);
  const rows = sub && category === 'litter' ? allRows.filter((r) => r.litter_type === sub) : allRows;
  const ranked = rows.filter((r) => r.eligible);
  const pending = rows.filter((r) => !r.eligible);
  const displayCats = cats ?? 1;

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const next: Record<string, string | undefined> = {
      cat: category,
      sort,
      cats: catsParam ?? undefined,
      housing,
      sub,
      ...patch,
    };
    Object.entries(next).forEach(([k, v]) => v && q.set(k, String(v)));
    return `/?${q}`;
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-badge">INDEPENDENT CAT PRODUCT INDEX · 台灣獨立貓用品實測資料庫</div>
        <h1>吃哪款不軟便？用哪款砂最除臭？</h1>
        <p className="hero-desc">
          不收品牌業配。以飼主真實購買訂單週期、居家標準化實測與長期追蹤數據，整理最誠實的貓糧與貓砂排行。
        </p>

        <div className="cat-tabs">
          <Link href={href({ cat: 'food', sort: 'score', sub: undefined })} className={`cat-tab ${category === 'food' ? 'on' : ''}`}>
            <span className="cat-tab-icon"><BowlIcon size={22} /></span>
            <div>
              <b>貓飼料排行</b>
              <small>法國皇家 IN27 · 歐睿健 · 紐頓 T22 · 愛肯拿 · 法米納</small>
            </div>
          </Link>
          <Link href={href({ cat: 'litter', sort: 'score', sub: undefined })} className={`cat-tab ${category === 'litter' ? 'on' : ''}`}>
            <span className="cat-tab-icon"><LitterIcon size={22} /></span>
            <div>
              <b>貓砂排行</b>
              <small>藍鑽 Ever Clean · 鐵鎚 · pidan · 臭味滾 · 汪喵星球</small>
            </div>
          </Link>
        </div>
      </section>

      <section className="filter-panel card">
        {category === 'litter' && (
          <div className="filter-row">
            <span className="filter-label">材質分類</span>
            <div className="row seg">
              <Link href={href({ sub: undefined })} className={!sub ? 'on' : ''}>全部材質</Link>
              {Object.entries(LITTER_TYPE_LABEL).map(([k, label]) => (
                <Link key={k} href={href({ sub: k })} className={sub === k ? 'on' : ''}>{label}</Link>
              ))}
            </div>
          </div>
        )}
        <div className="filter-row">
          <span className="filter-label">家庭情境</span>
          <div className="row seg">
            {[undefined, 1, 2, 3].map((n) => (
              <Link key={n ?? 'all'} href={href({ cats: n ? String(n) : undefined })} className={cats === n ? 'on' : ''}>
                {n ? `${n === 3 ? '3+ 隻貓（多貓）' : `${n} 隻貓`}` : '全部貓數'}
              </Link>
            ))}
            <span className="filter-divider" />
            <Link href={href({ housing: undefined })} className={!housing ? 'on' : ''}>全部房型</Link>
            {(Object.keys(HOUSING_LABEL) as Housing[]).map((h) => (
              <Link key={h} href={href({ housing: h })} className={housing === h ? 'on' : ''}>{HOUSING_LABEL[h]}</Link>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">排序方式</span>
          <div className="row seg">
            {SORTS[category].map(([k, label]) => (
              <Link key={k} href={href({ sort: k })} className={sort === k ? 'on' : ''}>{label}</Link>
            ))}
          </div>
        </div>
      </section>

      {filtered && (
        <div className="context-banner">
          <span>已套用情境篩選：優先顯示與您相似家庭的實測表現；進榜門檻採全站驗證數（≥{MIN_VERIFIED} 筆）。</span>
        </div>
      )}

      <div className="rank-list">
        {ranked.map((r, i) => (
          <ProductRankCard key={r.id} r={r} rankNum={i + 1} category={category} filtered={filtered} cats={displayCats} />
        ))}
      </div>

      {pending.length > 0 && (
        <section className="pending-section">
          <h3>資料累積中（未滿 {MIN_VERIFIED} 筆購買驗證暫不列入正式排名）</h3>
          <div className="rank-list">
            {pending.map((r) => (
              <ProductRankCard key={r.id} r={r} category={category} filtered={filtered} cats={displayCats} />
            ))}
          </div>
        </section>
      )}

      <div className="cta-grid">
        <Link href="/calc" className="cta-card">
          <span className="cta-icon"><CalcIcon size={22} /></span>
          <div>
            <b>每貓每天真實成本計算機（免登入）</b>
            <p className="small muted">輸入包裝價格與使用天數，30 秒算出每日真實開銷並與全站中位數對比</p>
          </div>
        </Link>
        <Link href="/iot" className="cta-card">
          <span className="cta-icon"><SensorIcon size={22} /></span>
          <div>
            <b>第二階段預覽：加裝式「砂盆＆飲水」感測貼片</b>
            <p className="small muted">免換砂盆一貼即用，公貓尿閉 LINE 即時推播，硬體客觀數據自動回傳排行榜</p>
          </div>
        </Link>
      </div>

      <Disclaimer food={category === 'food'} />
    </main>
  );
}

function ProductRankCard({
  r, rankNum, category, filtered, cats,
}: {
  r: Ranked; rankNum?: number; category: Category; filtered: boolean; cats: number;
}) {
  const approx = r.cost_fallback ? '≈' : '';
  const score100 = Math.round(r.score * 100);
  const estDays = daysForHousehold(r.median_cat_days, cats);
  const medalClass = rankNum === 1 ? 'medal-1' : rankNum === 2 ? 'medal-2' : rankNum === 3 ? 'medal-3' : 'medal-n';

  return (
    <Link href={`/products/${r.id}`} className="rank-card">
      <div className="rank-card-left">
        <div className={`rank-medal ${medalClass}`}>
          {rankNum ? `NO.${rankNum}` : 'PENDING'}
        </div>
        <ProductPackThumb product={r} size="md" />
      </div>

      <div className="rank-card-body">
        <div className="rank-header-row">
          <span className="brand-pill">{r.brand}</span>
          {r.litter_type && <span className="tag plain">{LITTER_TYPE_LABEL[r.litter_type] ?? r.litter_type}</span>}
          {r.origin && <span className="tag plain">{r.origin}</span>}
          {r.pack_weight_kg && <span className="tag plain">{r.pack_weight_kg}kg{r.ref_price_twd ? ` · NT$${r.ref_price_twd}` : ''}</span>}
        </div>

        <h2 className="rank-title">{r.name}</h2>
        {r.subtitle && <p className="rank-subtitle">{r.subtitle}</p>}

        <div className="cute-highlights">
          <span className="cute-pill">
            回購率 <b className="num">{pct(r.repurchase_b)}</b>
          </span>
          {category === 'food' ? (
            <>
              <span className="cute-pill">
                適口性 <b className="num">{pct(r.palatability)}</b>
              </span>
              <span className="cute-pill">
                換糧穩定度 <b className="num">{r.soft_switch != null ? `${Math.round((1 - r.soft_switch) * 100)}%` : '—'}</b>
              </span>
            </>
          ) : (
            <>
              <span className="cute-pill">
                第7天除臭 <b className="num">{r.odor_b?.toFixed(1) ?? '—'} / 5</b>
              </span>
              <span className="cute-pill">
                低粉塵評分 <b className="num">{r.dust_b?.toFixed(1) ?? '—'} / 5</b>
              </span>
            </>
          )}
          {estDays != null && (
            <span className="cute-pill">
              {cats} 貓可用約 <b className="num">{estDays} 天</b>
            </span>
          )}
        </div>

        <div className="rank-meta-foot">
          <span className="row" style={{ gap: 4 }}>
            <VerifiedIcon size={14} /> 已驗證訂單 <b>{filtered ? `${r.n_verified} 筆（全站 ${r.n_verified_all} 筆）` : `${r.n_verified} 筆`}</b>
          </span>
          <span>· 實測家庭 <b>{r.n_tests} 戶</b></span>
          <span className="view-more">查看實測細節與評論 <ArrowUpRightIcon size={13} /></span>
        </div>
      </div>

      <div className="rank-card-right">
        <div className="score-box">
          <div className="score-num">{score100}</div>
          <div className="score-label">SCORE</div>
        </div>
        <div className="price-tag-cute">
          每日 <b>{r.cost_per_cat_day != null ? `NT$${approx}${r.cost_per_cat_day.toFixed(1)}` : '—'}</b> / 貓
        </div>
      </div>
    </Link>
  );
}
