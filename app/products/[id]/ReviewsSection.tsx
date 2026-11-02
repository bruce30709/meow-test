'use client';
import Link from 'next/link';
import { HOUSING_LABEL, type Review } from '@/lib/types';
import { useHousehold } from '@/components/useHousehold';
import { ReviewPhotoCard } from '@/components/ProductVisual';
import { VerifiedIcon, PlusCircleIcon, InfoCircleIcon } from '@/components/Icons';

export default function ReviewsSection({ productId, initial }: { productId: string; initial: Review[] }) {
  const { local, isLocalMode } = useHousehold();
  const userReviews = isLocalMode ? local.reviews.filter((r) => r.product_id === productId) : [];
  const allReviews = [...userReviews, ...initial];

  const allPhotos = allReviews.flatMap((r) => r.photos ?? []);

  return (
    <>
      {allPhotos.length > 0 && (
        <section className="section-block">
          <h2>標準化實測對照圖（粉塵・結團・顆粒比例尺）</h2>
          <div className="rev-photos-row">
            {allPhotos.map((ph, i) => (
              <ReviewPhotoCard key={i} photo={ph} />
            ))}
          </div>
        </section>
      )}

      <section className="section-block">
        <div className="section-head">
          <h2>飼主實測評論與社群真實回饋（{allReviews.length} 則）</h2>
          <Link href={`/submit?product=${productId}`} className="btn-link">＋ 撰寫此款實測</Link>
        </div>

        <div className="review-list">
          {allReviews.map((rv) => (
            <div className="review-card card" key={rv.id}>
              <div className="review-top">
                <div className="reviewer-avatar">{rv.display_name.slice(0, 1)}</div>
                <div>
                  <div className="row" style={{ gap: 6 }}>
                    <b>{rv.display_name}</b>
                    <span className="tag plain">{rv.cats} 隻貓 · {HOUSING_LABEL[rv.housing] ?? rv.housing}</span>
                    {rv.verified_purchase && (
                      <span className="tag row" style={{ gap: 4 }}>
                        <VerifiedIcon size={12} /> 已驗證購買
                      </span>
                    )}
                    {rv.is_sample && <span className="tag amber">試用包揭露</span>}
                    {rv.source_tag && <span className="tag plain">{rv.source_tag}</span>}
                  </div>
                  <div className="small muted">{String(rv.created_at).slice(0, 10)}</div>
                </div>
              </div>

              {(rv.pros || rv.cons) && (
                <div className="pros-cons-grid">
                  {rv.pros && (
                    <div className="pros-box">
                      <b className="row" style={{ gap: 5 }}><PlusCircleIcon size={14} /> 實測優點</b>
                      <span>{rv.pros}</span>
                    </div>
                  )}
                  {rv.cons && (
                    <div className="cons-box">
                      <b className="row" style={{ gap: 5 }}><InfoCircleIcon size={14} /> 注意事項 / 缺點</b>
                      <span>{rv.cons}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="review-body">{rv.note}</p>

              <div className="row small muted" style={{ gap: 8 }}>
                {rv.dust_score && <span className="tag plain">黑紙粉塵 {rv.dust_score}/5</span>}
                {rv.clump_score && <span className="tag plain">結團硬度 {rv.clump_score}/5</span>}
                {rv.odor_day7 && <span className="tag plain">第7天除臭 {rv.odor_day7}/5</span>}
                {rv.accepted === false && <span className="tag warn">貓咪曾拒用</span>}
                {rv.palatability && <span className="tag plain">適口性 {rv.palatability}/5</span>}
                {rv.stool_score && <span className="tag plain">便便成形 {rv.stool_score} 分（布里斯托）</span>}
                {rv.soft_stool_on_switch && <span className="tag warn">換糧首週曾軟便</span>}
                {rv.bag_days && <span className="tag plain">一包約用 {rv.bag_days} 天</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
