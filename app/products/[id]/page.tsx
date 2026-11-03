import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProducts, getQuestions, getReviews, getStats } from '@/lib/data';
import { daysForHousehold, rank } from '@/lib/scoring';
import { LITTER_TYPE_LABEL, SAMPLE_PRODUCTS } from '@/lib/sample';
import Disclaimer from '@/components/Disclaimer';
import { ProductPackThumb } from '@/components/ProductVisual';
import { EditIcon, ReceiptIcon, ArrowUpRightIcon } from '@/components/Icons';
import ReviewsSection from './ReviewsSection';
import QA from './qa';

export function generateStaticParams() {
  return SAMPLE_PRODUCTS.map((p) => ({ id: p.id }));
}

const pct = (v: number | null) => (v == null ? '—' : `${Math.round(v * 100)}%`);

export default async function ProductPage({ params }: { params: { id: string } }) {
  const [products, stats, reviews, questions] = await Promise.all([
    getProducts(), getStats(), getReviews(params.id), getQuestions(params.id),
  ]);
  const product = products.find((p) => p.id === params.id);
  if (!product) notFound();
  const all = rank(products, stats, product.category);
  const r = all.find((x) => x.id === product.id);
  const position = r?.eligible ? all.filter((x) => x.eligible).indexOf(r) + 1 : null;
  const cats = 2;

  return (
    <main>
      <div className="breadcrumb">
        <Link href={`/?cat=${product.category}`}>← 返回{product.category === 'litter' ? '貓砂' : '貓飼料'}排行榜</Link>
      </div>

      <section className="product-hero card">
        <div className="product-hero-top">
          <ProductPackThumb product={product} size="lg" />
          <div className="product-hero-info">
            <div className="row" style={{ gap: 8 }}>
              <span className="brand-pill">{product.brand}</span>
              {position && <span className="tag">{product.category === 'litter' ? '貓砂' : '飼料'}綜合排行 NO.{position}</span>}
              {product.litter_type && <span className="tag plain">{LITTER_TYPE_LABEL[product.litter_type] ?? product.litter_type}</span>}
              {product.origin && <span className="tag plain">產地：{product.origin}</span>}
              {product.prescription && <span className="tag warn">處方專用飼料：需經獸醫指示使用</span>}
            </div>
            <h1>{product.name}</h1>
            {product.subtitle && <p className="rank-subtitle">{product.subtitle}</p>}
            {product.specs && <div className="specs-bar">規格成分：{product.specs} ｜ 包裝：{product.pack_weight_kg}kg（參考價 NT${product.ref_price_twd ?? '—'}）</div>}
            {product.tags && (
              <div className="row" style={{ gap: 6, marginTop: 4 }}>
                {product.tags.map((t) => <span key={t} className="feature-chip">{t}</span>)}
              </div>
            )}
          </div>
          {!product.prescription && r && (
            <div className="score-box" style={{ minWidth: 96 }}>
              <div className="score-num">{Math.round(r.score * 100)}</div>
              <div className="score-label">SCORE</div>
            </div>
          )}
        </div>

        {!product.prescription && (
          <div className="product-actions">
            <Link href={`/submit?product=${product.id}`} className="btn-primary row" style={{ gap: 6 }}>
              <EditIcon size={15} /> 提交此款實測
            </Link>
            <Link href={`/purchase?product=${product.id}`} className="btn-secondary row" style={{ gap: 6 }}>
              <ReceiptIcon size={15} /> 上傳購買證明
            </Link>
            {product.buy_url && (
              <a className="btn-ghost row" style={{ gap: 6 }} href={product.buy_url} target="_blank" rel="noopener sponsored">
                查看電商比價（momo / 蝦皮） <ArrowUpRightIcon size={14} /> <small className="muted">（含分潤，不影響排名）</small>
              </a>
            )}
          </div>
        )}
      </section>

      {product.prescription ? (
        <div className="alert">
          處方飼料屬於獸醫師指示營養配方，本平台依規範不列入一般排行、不計算評分，亦不提供商業導購連結。請務必遵照您的獸醫師診斷與處方使用。
        </div>
      ) : r && (
        <section className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3>實測數據面板（基於 {r.n_verified} 筆驗證訂單 · {r.n_tests} 戶實測）</h3>
          </div>

          <div className="metrics">
            <div className="metric">
              <div className="v">{pct(r.repurchase_b)}</div>
              <div className="k">真實回購率（連續購買 ≥2 次）</div>
            </div>
            <div className="metric">
              <div className="v">{daysForHousehold(r.median_cat_days, 1) ?? '—'} 天 / {daysForHousehold(r.median_cat_days, cats) ?? '—'} 天</div>
              <div className="k">一包平均可用（單貓家庭 / 雙貓家庭中位數）</div>
            </div>
            <div className="metric">
              <div className="v">NT${r.cost_per_cat_day?.toFixed(1) ?? '—'}</div>
              <div className="k">每貓每天真實成本</div>
            </div>
            {product.category === 'litter' ? (
              <>
                <div className="metric">
                  <div className="v">{r.dust_b?.toFixed(1) ?? '—'} / 5</div>
                  <div className="k">黑紙粉塵評分（1 最無塵）</div>
                </div>
                <div className="metric">
                  <div className="v">{r.clump?.toFixed(1) ?? '4.5'} / 5</div>
                  <div className="k">20ml 滴水結團硬度（5 最硬）</div>
                </div>
                <div className="metric">
                  <div className="v">{r.odor_b?.toFixed(1) ?? '—'} / 5</div>
                  <div className="k">第 7 天除臭力（5 最不臭）</div>
                </div>
                <div className="metric">
                  <div className="v">{pct(r.accept_rate)}</div>
                  <div className="k">貓咪接受度（無亂尿）</div>
                </div>
              </>
            ) : (
              <>
                <div className="metric">
                  <div className="v">{pct(r.palatability)}</div>
                  <div className="k">適口性（願意把碗吃空）</div>
                </div>
                <div className="metric">
                  <div className="v">{r.stool ?? '—'} 分</div>
                  <div className="k">便便成形中位數（3–4 分最標準）</div>
                </div>
                <div className="metric">
                  <div className="v">{pct(r.soft_switch)}</div>
                  <div className="k">換糧首週軟便發生率（越低越穩）</div>
                </div>
                <div className="metric">
                  <div className="v">{pct(r.vomit)}</div>
                  <div className="k">每週嘔吐 ≥1 次比例</div>
                </div>
                <div className="metric">
                  <div className="v">{pct(r.vet_rate)}</div>
                  <div className="k">飼主回報由獸醫建議購買*</div>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <ReviewsSection productId={product.id} initial={reviews} />

      <section className="section-block">
        <h2>飼主問答（Q&amp;A）</h2>
        <QA productId={product.id} initial={questions} />
      </section>

      <Disclaimer food={product.category === 'food'} />
    </main>
  );
}
