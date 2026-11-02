import Link from 'next/link';
import { getProducts, getStats } from '@/lib/data';
import { daysForHousehold, MIN_VERIFIED, rank, type SortKey } from '@/lib/scoring';
import { LITTER_TYPE_LABEL } from '@/lib/sample';
import { HOUSING_LABEL, type Category, type Housing, type Ranked } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';
import DemoNotice from '@/components/DemoNotice';
import { ProductPackThumb } from '@/components/ProductVisual';

export const dynamic = 'force-dynamic';

type SP = { cat?: string; sort?: string; cats?: string; housing?: string; sub?: string };

const SORTS: Record<Category, [SortKey, string][]> = {
  food: [['score', '🏆 綜合實測分'], ['repurchase', '🔄 真實回購率'], ['cost', '💰 每貓每天最省']],
  litter: [['score', '🏆 綜合實測分'], ['repurchase', '🔄 真實回購率'], ['cost', '💰 每貓每天最省'], ['dust', '✨ 極致低粉塵']],
};

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default async function Leaderboard({ searchParams }: { searchParams: SP }) {
  // 預設先展示飼料或貓砂皆可切換，若網址沒帶參數預設顯示「貓飼料」方便直接看到皇家／歐睿健／紐頓，也可一鍵切貓砂
  const category: Category = searchParams.cat === 'litter' ? 'litter' : 'food';
  const sort = (SORTS[category].find(([k]) => k === searchParams.sort)?.[0] ?? 'score') as SortKey;
  const cats = searchParams.cats ? Number(searchParams.cats) : undefined;
  const housing = searchParams.housing as Housing | undefined;
  const sub = searchParams.sub || undefined;

  const filtered = cats != null || housing != null;
  const [products, stats, overall] = await Promise.all([
    getProducts(), getStats(cats, housing), filtered ? getStats() : Promise.resolve(undefined),
  ]);
  const allRows = rank(products, stats, category, sort, overall);
  const rows = sub && category === 'litter' ? allRows.filter((r) => r.litter_type === sub) : allRows;
  const ranked = rows.filter((r) => r.eligible);
  const pending = rows.filter((r) => !r.eligible);
  const displayCats = cats ?? 1;

  const href = (patch: Partial<SP>) => {
    const q = new URLSearchParams();
    const next = { cat: category, sort, cats: searchParams.cats, housing: searchParams.housing, sub: searchParams.sub, ...patch };
    Object.entries(next).forEach(([k, v]) => v && q.set(k, String(v)));
    return `/?${q}`;
  };

  return (
    <main>
      <section className="hero">
        <div className="hero-top">
          <span className="hero-pill">🛡️ 拒絕業配洗版・真實訂單回購加權</span>
          <span className="hero-pill">📊 貝氏平均防小樣本刷榜</span>
          <span className="hero-pill">🏠 依套房／多貓情境實測</span>
        </div>
        <h1>台灣貓飼料 ＆ 貓砂實測排行榜</h1>
        <p className="hero-desc">
          整合飼主真實購買發票週期、居家 3 分鐘標準化盲測（黑紙側光測粉塵、20ml 滴水測結塊、布里斯托便便評分）與 Dcard／社群真實優缺點對照。
        </p>

        <div className="cat-tabs">
          <Link href={href({ cat: 'food', sort: 'score', sub: undefined })} className={`cat-tab ${category === 'food' ? 'on' : ''}`}>
            <span className="cat-tab-icon">🍖</span>
            <div>
              <b>貓飼料排行榜</b>
              <small>法國皇家 IN27・歐睿健（渴望）・紐頓 T22・愛肯拿・法米納</small>
            </div>
          </Link>
          <Link href={href({ cat: 'litter', sort: 'score', sub: undefined })} className={`cat-tab ${category === 'litter' ? 'on' : ''}`}>
            <span className="cat-tab-icon">🪣</span>
            <div>
              <b>貓砂排行榜</b>
              <small>藍鑽 Ever Clean・鐵鎚・pidan 混合砂・臭味滾・汪喵木薯砂</small>
            </div>
          </Link>
        </div>
      </section>

      <DemoNotice />

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
          <span className="filter-label">家庭貓數</span>
          <div className="row seg">
            {[undefined, 1, 2, 3].map((n) => (
              <Link key={n ?? 'all'} href={href({ cats: n ? String(n) : undefined })} className={cats === n ? 'on' : ''}>
                {n ? `${n === 3 ? '3+ 隻貓（多貓）' : `${n} 隻貓`}` : '不限貓數'}
              </Link>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">居住空間</span>
          <div className="row seg">
            <Link href={href({ housing: undefined })} className={!housing ? 'on' : ''}>不限住宅</Link>
            {(Object.keys(HOUSING_LABEL) as Housing[]).map((h) => (
              <Link key={h} href={href({ housing: h })} className={housing === h ? 'on' : ''}>{HOUSING_LABEL[h]}</Link>
            ))}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">排序指標</span>
          <div className="row seg">
            {SORTS[category].map(([k, label]) => (
              <Link key={k} href={href({ sort: k })} className={sort === k ? 'on' : ''}>{label}</Link>
            ))}
          </div>
        </div>
      </section>

      {filtered && (
        <div className="context-banner">
          <span>🎯 <b>已套用情境篩選：</b>分數優先採用「與您相似家庭」的實測數據；進榜門檻仍看全站購買驗證數（≥{MIN_VERIFIED} 筆），確保細分情境不會空榜。</span>
        </div>
      )}

      <div className="rank-list">
        {ranked.map((r, i) => (
          <ProductRankCard key={r.id} r={r} rankNum={i + 1} category={category} filtered={filtered} cats={displayCats} />
        ))}
      </div>

      {pending.length > 0 && (
        <section className="pending-section">
          <h3>⏳ 資料累積中（未滿 {MIN_VERIFIED} 筆購買驗證暫不排名）</h3>
          <div className="rank-list">
            {pending.map((r) => (
              <ProductRankCard key={r.id} r={r} category={category} filtered={filtered} cats={displayCats} />
            ))}
          </div>
        </section>
      )}

      <div className="cta-grid">
        <Link href="/calc" className="cta-card">
          <span className="cta-icon">🧮</span>
          <div>
            <b>每貓每天真實成本計算機（免登入）</b>
            <p className="small muted">輸入一包多少錢、用幾天，30 秒算出你家有沒有買貴，跟全站中位數比一比 →</p>
          </div>
        </Link>
        <Link href="/iot" className="cta-card">
          <span className="cta-icon">📡</span>
          <div>
            <b>第二階段預覽：加裝式「貓砂盆＆飲水」智慧貼片</b>
            <p className="small muted">不用換砂盆！一貼記錄如廁與喝水、公貓尿閉 LINE 即時警報，數據自動回傳排行榜 →</p>
          </div>
        </Link>
      </div>

      <p className="small muted">註：處方飼料（如皇家 LP34、希爾思 c/d、k/d）屬獸醫指示用糧，不列入一般商業排行亦不提供導購連結。</p>
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
    <Link href={`/products/${r.id}${cats > 1 ? `?cats=${cats}` : ''}`} className="rank-card">
      <div className="rank-card-left">
        <div className={`rank-medal ${medalClass}`}>
          {rankNum ? `#${rankNum}` : '待榜'}
        </div>
        <ProductPackThumb product={r} size="md" />
      </div>

      <div className="rank-card-body">
        <div className="rank-header-row">
          <span className="brand-pill">{r.brand}</span>
          {r.litter_type && <span className="tag">{LITTER_TYPE_LABEL[r.litter_type] ?? r.litter_type}</span>}
          {r.origin && <span className="tag plain">{r.origin}</span>}
          {r.pack_weight_kg && <span className="tag plain">{r.pack_weight_kg}kg{r.ref_price_twd ? ` · 參考價 NT$${r.ref_price_twd}` : ''}</span>}
        </div>

        <h2 className="rank-title">{r.name}</h2>
        {r.subtitle && <p className="rank-subtitle">{r.subtitle}</p>}

        {r.tags && r.tags.length > 0 && (
          <div className="row" style={{ gap: 6 }}>
            {r.tags.map((t) => (
              <span key={t} className="feature-chip">✦ {t}</span>
            ))}
          </div>
        )}

        <div className="mini-bars">
          <div className="mini-bar">
            <div className="mini-bar-top">
              <span>真實回購率</span>
              <b className="num">{pct(r.repurchase_b)}</b>
            </div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((r.repurchase_b ?? 0) * 100)}%` }} /></div>
          </div>

          {category === 'food' ? (
            <>
              <div className="mini-bar">
                <div className="mini-bar-top">
                  <span>適口性（空碗率）</span>
                  <b className="num">{pct(r.palatability)}</b>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((r.palatability ?? 0) * 100)}%` }} /></div>
              </div>
              <div className="mini-bar">
                <div className="mini-bar-top">
                  <span>換糧腸胃穩定（不軟便）</span>
                  <b className="num">{r.soft_switch != null ? `${Math.round((1 - r.soft_switch) * 100)}%` : '—'}</b>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round((1 - (r.soft_switch ?? 0.2)) * 100)}%` }} /></div>
              </div>
            </>
          ) : (
            <>
              <div className="mini-bar">
                <div className="mini-bar-top">
                  <span>第 7 天除臭力</span>
                  <b className="num">{r.odor_b?.toFixed(1) ?? '—'} / 5</b>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(((r.odor_b ?? 3) / 5) * 100)}%` }} /></div>
              </div>
              <div className="mini-bar">
                <div className="mini-bar-top">
                  <span>低粉塵表現（越低越無塵）</span>
                  <b className="num">{r.dust_b?.toFixed(1) ?? '—'} / 5</b>
                </div>
                <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.round(((5.5 - (r.dust_b ?? 3)) / 4.5) * 100)}%` }} /></div>
              </div>
            </>
          )}
        </div>

        <div className="rank-meta-foot">
          <span>✓ 已驗證訂單 <b>{filtered ? `${r.n_verified} 筆（全站 ${r.n_verified_all} 筆）` : `${r.n_verified} 筆`}</b></span>
          <span>· 實測家庭 <b>{r.n_tests} 戶</b></span>
          <span className="view-more">查看真實評論與實測圖 →</span>
        </div>
      </div>

      <div className="rank-card-right">
        <div className="score-box">
          <div className="score-num">{score100}</div>
          <div className="score-label">綜合評分</div>
        </div>
        <div className="price-box">
          <div className="price-val">
            {r.cost_per_cat_day != null ? `NT$${approx}${r.cost_per_cat_day.toFixed(1)}` : '—'}
          </div>
          <div className="price-sub">每貓每天成本</div>
          {estDays != null && (
            <div className="days-pill">
              {cats} 貓一包約 {estDays} 天
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
