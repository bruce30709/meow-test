import Link from 'next/link';
import { getProducts, getStats } from '@/lib/data';
import { MIN_VERIFIED, rank, type SortKey } from '@/lib/scoring';
import { HOUSING_LABEL, type Category, type Housing, type Ranked } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';
import DemoNotice from '@/components/DemoNotice';

export const dynamic = 'force-dynamic';

type SP = { cat?: string; sort?: string; cats?: string; housing?: string };

const SORTS: Record<Category, [SortKey, string][]> = {
  litter: [['score', '綜合'], ['cost', '最省錢'], ['repurchase', '回購率'], ['dust', '低粉塵']],
  food: [['score', '綜合'], ['repurchase', '回購率']],
};

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default async function Leaderboard({ searchParams }: { searchParams: SP }) {
  const category: Category = searchParams.cat === 'food' ? 'food' : 'litter';
  const sort = (SORTS[category].find(([k]) => k === searchParams.sort)?.[0] ?? 'score') as SortKey;
  const cats = searchParams.cats ? Number(searchParams.cats) : undefined;
  const housing = searchParams.housing as Housing | undefined;

  const [products, stats] = await Promise.all([getProducts(), getStats(cats, housing)]);
  const rows = rank(products, stats, category, sort);
  const ranked = rows.filter((r) => r.eligible);
  const pending = rows.filter((r) => !r.eligible);

  const href = (patch: Partial<SP>) => {
    const q = new URLSearchParams();
    const next = { cat: category, sort, cats: searchParams.cats, housing: searchParams.housing, ...patch };
    Object.entries(next).forEach(([k, v]) => v && q.set(k, String(v)));
    return `/?${q}`;
  };

  return (
    <main>
      <h1>{category === 'litter' ? '貓砂' : '飼料'}排行榜</h1>
      <DemoNotice />
      <div className="row seg">
        <Link href={href({ cat: 'litter', sort: 'score' })} className={category === 'litter' ? 'on' : ''}>貓砂</Link>
        <Link href={href({ cat: 'food', sort: 'score' })} className={category === 'food' ? 'on' : ''}>飼料</Link>
      </div>
      <div className="row seg">
        <span className="small muted">幾隻貓</span>
        {[undefined, 1, 2, 3].map((n) => (
          <Link key={n ?? 'all'} href={href({ cats: n ? String(n) : undefined })} className={cats === n ? 'on' : ''}>{n ? `${n} 貓` : '不限'}</Link>
        ))}
      </div>
      <div className="row seg">
        <span className="small muted">住宅</span>
        <Link href={href({ housing: undefined })} className={!housing ? 'on' : ''}>不限</Link>
        {(Object.keys(HOUSING_LABEL) as Housing[]).map((h) => (
          <Link key={h} href={href({ housing: h })} className={housing === h ? 'on' : ''}>{HOUSING_LABEL[h]}</Link>
        ))}
      </div>
      <div className="row seg">
        {SORTS[category].map(([k, label]) => (
          <Link key={k} href={href({ sort: k })} className={sort === k ? 'on' : ''}>{label}</Link>
        ))}
      </div>

      {ranked.length === 0 && <p className="muted">這個情境還沒有商品達到進榜門檻（{MIN_VERIFIED} 筆購買驗證）。</p>}
      {ranked.map((r, i) => <Row key={r.id} r={r} i={i + 1} category={category} />)}

      {pending.length > 0 && (
        <>
          <h3>資料累積中</h3>
          <p className="small muted">購買驗證未滿 {MIN_VERIFIED} 筆，暫不排名。上傳訂單可以幫忙累積。</p>
          {pending.map((r) => <Row key={r.id} r={r} category={category} />)}
        </>
      )}
      <p className="small muted">處方飼料不列入排行。</p>
      <Disclaimer food={category === 'food'} />
    </main>
  );
}

function Row({ r, i, category }: { r: Ranked; i?: number; category: Category }) {
  return (
    <Link href={`/products/${r.id}`} className="card rank" style={{ color: 'inherit' }}>
      <span className="r">{i ?? '·'}</span>
      <div>
        <div style={{ fontWeight: 700 }}>{r.brand} {r.name}</div>
        <div className="small muted">
          回購 {pct(r.repurchase_b)}
          {category === 'litter' ? ` · 粉塵 ${r.dust_b?.toFixed(1) ?? '—'}` : ` · 適口性 ${pct(r.palatability)}`}
          {` · n=${r.n_verified}`}
        </div>
      </div>
      {category === 'litter' ? (
        <div className="big">{r.cost_per_cat_day?.toFixed(1) ?? '—'}<small>元/貓/天</small></div>
      ) : (
        <div className="big">{pct(r.vet_rate)}<small>獸醫建議*</small></div>
      )}
    </Link>
  );
}
