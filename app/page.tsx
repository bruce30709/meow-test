'use client';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { daysForHousehold, MIN_VERIFIED, rank, type SortKey } from '@/lib/scoring';
import { LITTER_TYPE_LABEL, SAMPLE_PRODUCTS, sampleStatsFor } from '@/lib/sample';
import { HOUSING_LABEL, type Housing, type Product, type Ranked } from '@/lib/types';
import { browser } from '@/lib/supabase';
import Disclaimer from '@/components/Disclaimer';
import LitterRecommender from '@/components/LitterRecommender';
import { ProductPackThumb } from '@/components/ProductVisual';
import { CalcIcon, EditIcon, VerifiedIcon, ArrowUpRightIcon } from '@/components/Icons';

const LITTER_SORTS: [SortKey, string][] = [
  ['score', '綜合評分'],
  ['repurchase', '真實回購'],
  ['cost', '成本最低'],
  ['dust', '低粉塵'],
];

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<main><p className="muted">載入實測數據中…</p></main>}>
      <LeaderboardContent />
    </Suspense>
  );
}

function LeaderboardContent() {
  const sp = useSearchParams();
  const rawSort = sp.get('sort') ?? 'score';
  const sort = (LITTER_SORTS.find(([k]) => k === rawSort)?.[0] ?? 'score') as SortKey;
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
        setProducts((data as Product[]).map((p) => ({ ...p, ...sampleMap.get(p.id) })));
      }
    });
  }, []);

  const filtered = cats != null || housing != null;
  const stats = sampleStatsFor(cats, housing);
  const overall = filtered ? sampleStatsFor() : undefined;

  // 100% 專注貓砂，排除飼料
  const allRows = rank(products, stats, 'litter', sort, overall);
  const rows = sub ? allRows.filter((r) => r.litter_type === sub) : allRows;
  const ranked = rows.filter((r) => r.eligible);
  const pending = rows.filter((r) => !r.eligible);
  const displayCats = cats ?? 1;

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const next: Record<string, string | undefined> = {
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
      {/* ================= 精緻簡潔 Hero ================= */}
      <section className="hero">
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-pulse-dot" />
              <span>第三方客觀實測資料庫</span>
            </div>

            <h1 className="hero-title">
              哪款貓砂不臭、不揚塵？<br />
              <span className="hero-highlight">30 秒挑出你家的命定砂</span>
            </h1>

            <p className="hero-desc">
              居家實測數據 · 100% 訂單驗證 · 0 業配
            </p>

            <div className="hero-trust-bar">
              <div className="hero-trust-item">
                <b>6 款</b>
                <span>大數據熱門</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <b>4.1 萬+</b>
                <span>社群真實大數據</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <b>0 廠商</b>
                <span>付費業配</span>
              </div>
              <div className="hero-trust-divider" />
              <div className="hero-trust-item">
                <b>30 秒</b>
                <span>智慧配對</span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFF9F6',
                border: '1px solid #F4DDD5',
                padding: '6px 14px',
                borderRadius: 99,
                fontSize: '0.78rem',
                color: '#8A5A52',
                marginTop: 6,
              }}
            >
              <span>待第三方實驗室認證前，本站暫不評比飼料；專注於無醫療爭議之貓砂實測。</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-art-card">
              <img
                src="/hero-cat-art.jpg"
                alt="喵實測生活風格插畫"
                className="hero-art-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= 30 秒貓砂推薦精靈 ================= */}
      <LitterRecommender litters={allRows} />

      {/* ================= 篩選面板 ================= */}
      <section className="filter-panel card">
        <div className="filter-row">
          <span className="filter-label">材質</span>
          <div className="row seg">
            <Link href={href({ sub: undefined })} className={!sub ? 'on' : ''}>
              全部材質
            </Link>
            {Object.entries(LITTER_TYPE_LABEL).map(([k, label]) => (
              <Link key={k} href={href({ sub: k })} className={sub === k ? 'on' : ''}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">情境</span>
          <div className="row seg">
            {[undefined, 1, 2, 3].map((n) => (
              <Link key={n ?? 'all'} href={href({ cats: n ? String(n) : undefined })} className={cats === n ? 'on' : ''}>
                {n ? `${n === 3 ? '3+ 貓' : `${n} 貓`}` : '全部貓數'}
              </Link>
            ))}
            <span className="filter-divider" />
            <Link href={href({ housing: undefined })} className={!housing ? 'on' : ''}>
              全部房型
            </Link>
            {(Object.keys(HOUSING_LABEL) as Housing[]).map((h) => (
              <Link key={h} href={href({ housing: h })} className={housing === h ? 'on' : ''}>
                {HOUSING_LABEL[h]}
              </Link>
            ))}
          </div>
        </div>

        <div className="filter-row">
          <span className="filter-label">排序</span>
          <div className="row seg">
            {LITTER_SORTS.map(([k, label]) => (
              <Link key={k} href={href({ sort: k })} className={sort === k ? 'on' : ''}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {filtered && (
        <div className="context-banner">
          <span>已套用情境：{cats ? `${cats} 貓` : ''}{housing ? ` · ${HOUSING_LABEL[housing]}` : ''}（優先比對相似家庭數據）</span>
        </div>
      )}

      {/* ================= 排行榜清單 ================= */}
      <div className="rank-list">
        {ranked.map((r, i) => (
          <ProductRankCard
            key={r.id}
            r={r}
            rankNum={i + 1}
            filtered={filtered}
            cats={displayCats}
          />
        ))}
      </div>

      {pending.length > 0 && (
        <section className="pending-section">
          <h3>數據累積中（未滿 {MIN_VERIFIED} 筆購買驗證）</h3>
          <div className="rank-list">
            {pending.map((r) => (
              <ProductRankCard key={r.id} r={r} filtered={filtered} cats={displayCats} />
            ))}
          </div>
        </section>
      )}

      {/* ================= 底部行動卡片 ================= */}
      <div className="cta-grid">
        <Link href="/calc" className="cta-card">
          <span className="cta-icon">
            <CalcIcon size={22} />
          </span>
          <div>
            <b>每貓每天成本計算機</b>
            <p className="small muted">輸入價格與天數，快速算出真實日開銷</p>
          </div>
        </Link>
        <Link href="/submit" className="cta-card">
          <span className="cta-icon">
            <EditIcon size={22} />
          </span>
          <div>
            <b>提交居家標準實測</b>
            <p className="small muted">記錄除臭、粉塵與結塊力，累積信譽權重</p>
          </div>
        </Link>
      </div>

      <Disclaimer food={false} />
    </main>
  );
}

function ProductRankCard({
  r,
  rankNum,
  filtered,
  cats,
}: {
  r: Ranked;
  rankNum?: number;
  filtered: boolean;
  cats: number;
}) {
  const approx = r.cost_fallback ? '≈' : '';
  const score100 = Math.round(r.score * 100);
  const estDays = daysForHousehold(r.median_cat_days, cats);

  const medalLabel =
    rankNum === 1 ? 'TOP 1' :
    rankNum === 2 ? 'TOP 2' :
    rankNum === 3 ? 'TOP 3' :
    rankNum ? `#0${rankNum}` : 'TEST';

  const medalStyleClass =
    rankNum === 1 ? 'medal-gold' :
    rankNum === 2 ? 'medal-silver' :
    rankNum === 3 ? 'medal-bronze' : 'medal-standard';

  return (
    <Link href={`/products/${r.id}`} className="rank-card">
      <div className="rank-card-left">
        <div className={`rank-medal-badge ${medalStyleClass}`}>
          {medalLabel}
        </div>
        <ProductPackThumb product={r} size="md" />
      </div>

      <div className="rank-card-body">
        <div className="rank-header-row">
          <span className="brand-pill">{r.brand}</span>
          {r.pack_weight_kg && (
            <span className="tag plain">
              {r.pack_weight_kg}kg
            </span>
          )}
          {r.litter_type && <span className="tag plain">{LITTER_TYPE_LABEL[r.litter_type] ?? r.litter_type}</span>}
        </div>

        <h2 className="rank-title">{r.name}</h2>

        <div className="cute-highlights">
          <span className="cute-pill pill-repurchase">
            回購率 <b className="num">{pct(r.repurchase_b)}</b>
          </span>
          <span className="cute-pill pill-odor">
            除臭 <b className="num">{r.odor_b?.toFixed(1) ?? '—'}</b>
          </span>
          <span className="cute-pill pill-dust">
            低粉塵 <b className="num">{r.dust_b != null ? (6 - r.dust_b).toFixed(1) : '—'}</b>
          </span>
          {estDays != null && (
            <span className="cute-pill pill-days">
              可用約 <b className="num">{estDays} 天</b>
            </span>
          )}
        </div>

        {r.source_links && r.source_links.length > 0 && (
          <div className="rank-sources-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '4px 0 2px' }}>
            <span className="small muted" style={{ fontSize: '0.73rem' }}>出處來源：</span>
            {r.source_links.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={(e) => e.stopPropagation()}
                className="tag plain"
                style={{ fontSize: '0.71rem', padding: '1px 8px', color: '#554444', textDecoration: 'none' }}
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        )}

        <div className="rank-meta-foot">
          <span className="row" style={{ gap: 4 }}>
            <VerifiedIcon size={13} /> {filtered ? `${r.n_verified.toLocaleString()} 筆社群分析（全站 ${r.n_verified_all.toLocaleString()}）` : `${r.n_verified.toLocaleString()} 筆社群分析`}
          </span>
          <span>· {r.n_tests.toLocaleString()} 戶盲測數據</span>
          <span className="view-more">
            查看評價 <ArrowUpRightIcon size={12} />
          </span>
        </div>
      </div>

      <div className="rank-card-right">
        <div className="score-box">
          <div className="score-num">{score100}</div>
          <div className="score-label">SCORE</div>
        </div>
        <div className="price-tag-cute">
          每日 <b>{r.cost_per_cat_day != null ? `NT$${approx}${r.cost_per_cat_day.toFixed(1)}` : '—'}</b>
        </div>
      </div>
    </Link>
  );
}
