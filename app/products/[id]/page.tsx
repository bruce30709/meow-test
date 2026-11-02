import { notFound } from 'next/navigation';
import { getProducts, getQuestions, getReviews, getStats } from '@/lib/data';
import { daysForHousehold, rank } from '@/lib/scoring';
import { HOUSING_LABEL } from '@/lib/types';
import Disclaimer from '@/components/Disclaimer';
import DemoNotice from '@/components/DemoNotice';
import QA from './qa';

export const dynamic = 'force-dynamic';

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default async function ProductPage({ params, searchParams }: { params: { id: string }; searchParams: { cats?: string } }) {
  const [products, stats, reviews, questions] = await Promise.all([
    getProducts(), getStats(), getReviews(params.id), getQuestions(params.id),
  ]);
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();
  const all = rank(products, stats, product.category);
  const r = all.find((x) => x.id === product.id);
  const position = r?.eligible ? all.filter((x) => x.eligible).indexOf(r) + 1 : null;
  const cats = Number(searchParams.cats ?? 2);

  return (
    <main>
      <div className="row">
        <h1>{product.brand} {product.name}</h1>
        {position && <span className="tag">#{position} 綜合</span>}
        {product.prescription && <span className="tag warn">處方飼料：需經獸醫指示使用</span>}
      </div>
      <DemoNotice />

      {product.prescription ? (
        <p className="notice">處方飼料不列入排行，也不提供購買連結。請依獸醫指示使用。</p>
      ) : r && (
        <div className="metrics">
          <div className="metric"><div className="v">{pct(r.repurchase_b)}</div><div className="k">回購率（n={r.n_verified} 購買驗證）</div></div>
          {product.category === 'litter' ? (
            <>
              <div className="metric"><div className="v">{daysForHousehold(r.median_cat_days, cats) ?? '—'} 天</div><div className="k">一包用幾天（{cats} 貓，中位數{r.days_source === 'self' ? '・飼主自填估計' : ''}）</div></div>
              <div className="metric"><div className="v">NT${r.cost_per_cat_day?.toFixed(1) ?? '—'}</div><div className="k">每貓每天{r.days_source === 'self' ? '（自填估計）' : ''}</div></div>
              <div className="metric"><div className="v">{r.dust_b?.toFixed(1) ?? '—'} / 5</div><div className="k">粉塵（1 最少）</div></div>
              <div className="metric"><div className="v">{r.odor_b?.toFixed(1) ?? '—'} / 5</div><div className="k">除臭（第 7 天）</div></div>
              <div className="metric"><div className="v">{pct(r.accept_rate)}</div><div className="k">貓願意用</div></div>
            </>
          ) : (
            <>
              <div className="metric"><div className="v">{pct(r.palatability)}</div><div className="k">適口性（會吃完）</div></div>
              <div className="metric"><div className="v">{daysForHousehold(r.median_cat_days, cats) ?? '—'} 天</div><div className="k">一包吃幾天（{cats} 貓，中位數{r.days_source === 'self' ? '・飼主自填估計' : ''}）</div></div>
              <div className="metric"><div className="v">NT${r.cost_per_cat_day?.toFixed(1) ?? '—'}</div><div className="k">每貓每天</div></div>
              <div className="metric"><div className="v">{pct(r.soft_switch)}</div><div className="k">換糧一週內軟便</div></div>
              <div className="metric"><div className="v">{r.stool ?? '—'}</div><div className="k">便便評分中位數（1 硬–7 水狀）</div></div>
              <div className="metric"><div className="v">{pct(r.vomit)}</div><div className="k">每週嘔吐 ≥1 次</div></div>
              <div className="metric"><div className="v">{pct(r.vet_rate)}</div><div className="k">飼主表示是獸醫建議的</div></div>
            </>
          )}
        </div>
      )}

      {!product.prescription && product.buy_url && (
        <a className="card" href={product.buy_url} target="_blank" rel="noopener sponsored">查看購買管道 →<span className="small muted">含導購分潤，不影響排名</span></a>
      )}

      <h2>評論</h2>
      {reviews.length === 0 && <p className="muted">還沒有評論，做一次實測就能留下第一則。</p>}
      {reviews.map((v) => (
        <div key={v.id} className="card">
          <div className="row">
            <b>{v.display_name ?? '匿名'}</b>
            <span className="tag plain">{v.cats} 貓{v.housing ? `・${HOUSING_LABEL[v.housing]}` : ''}</span>
            {v.verified && <span className="tag">購買驗證</span>}
            {v.sponsored && <span className="tag amber">試用</span>}
            {v.day === 30 && <span className="tag plain">30 天追蹤</span>}
          </div>
          <span>{v.comment}</span>
        </div>
      ))}

      <h2>問用過的人</h2>
      <QA productId={product.id} initial={questions} />
      <Disclaimer food={product.category === 'food'} />
    </main>
  );
}
