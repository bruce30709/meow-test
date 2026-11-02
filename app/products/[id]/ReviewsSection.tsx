'use client';
import Link from 'next/link';
import { useHousehold } from '@/components/useHousehold';
import { ReviewPhotoCard } from '@/components/ProductVisual';
import { HOUSING_LABEL, type Review } from '@/lib/types';

export default function ReviewsSection({ productId, initial }: { productId: string; initial: Review[] }) {
  const { local } = useHousehold();
  const localForProduct = local.reviews.filter((r) => r.product_id === productId);
  const allReviews = [...localForProduct, ...initial];

  return (
    <section className="section-block">
      <div className="section-head">
        <div>
          <h2>💬 飼主真實實測與 Dcard／社群口碑彙整（{allReviews.length} 則）</h2>
          <p className="small muted">包含完成居家標準盲測、附帶訂單驗證與第 30 天長期追蹤的真實回饋。</p>
        </div>
        <Link href={`/submit?product=${productId}`} className="btn-link">
          ✍️ 我也要寫這款實測 (+80點)
        </Link>
      </div>

      {allReviews.length === 0 && (
        <p className="muted">這款商品還沒有評論，成為第一個完成標準實測的貓奴即可獲得 +80 點！</p>
      )}

      <div className="review-list">
        {allReviews.map((v) => (
          <article key={v.id} className="review-card card">
            <div className="review-top">
              <div className="reviewer-avatar">{(v.display_name ?? '匿').slice(0, 1)}</div>
              <div className="reviewer-info">
                <div className="row" style={{ gap: 6 }}>
                  <b>{v.display_name ?? '匿名貓奴'}</b>
                  <span className="tag plain">
                    {v.cats} 隻貓{v.housing ? `・${HOUSING_LABEL[v.housing]}` : ''}
                  </span>
                  {v.verified && <span className="tag">✓ 購買驗證</span>}
                  {v.sponsored && <span className="tag amber">品牌試用包體驗</span>}
                  {v.day === 30 && <span className="tag">📅 滿 30 天長期追蹤</span>}
                </div>
                {v.source_tag && <div className="small muted">來源憑證：{v.source_tag}</div>}
              </div>
              <span className="small muted" style={{ marginLeft: 'auto' }}>{v.created_at}</span>
            </div>

            {(v.pros || v.cons) && (
              <div className="pros-cons-grid">
                {v.pros && (
                  <div className="pros-box">
                    <b>👍 實測優點</b>
                    <span>{v.pros}</span>
                  </div>
                )}
                {v.cons && (
                  <div className="cons-box">
                    <b>⚠️ 實測注意／缺點</b>
                    <span>{v.cons}</span>
                  </div>
                )}
              </div>
            )}

            <p className="review-body">{v.comment}</p>

            {v.photos && v.photos.length > 0 && (
              <div className="rev-photos-row">
                {v.photos.map((ph, idx) => (
                  <ReviewPhotoCard key={idx} photo={ph} />
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
