'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HOUSING_LABEL, type Review } from '@/lib/types';
import { useHousehold } from '@/components/useHousehold';
import { ReviewPhotoCard } from '@/components/ProductVisual';
import { VerifiedIcon, PlusCircleIcon, InfoCircleIcon } from '@/components/Icons';

export default function ReviewsSection({ productId, initial }: { productId: string; initial: Review[] }) {
  const { db, local } = useHousehold();
  const [liveReviews, setLiveReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!db) return;
    db.from('public_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data && data.length > 0) setLiveReviews(data as Review[]);
      });
  }, [db, productId]);

  const userReviews = local.reviews.filter((r) => r.product_id === productId);
  const seenKey = new Set<string>();
  const allReviews = [...liveReviews, ...userReviews, ...initial].filter((r) => {
    const key = `${r.display_name || ''}:${(r.comment || '').slice(0, 30)}`;
    if (seenKey.has(key)) return false;
    seenKey.add(key);
    return true;
  });

  const allPhotos = allReviews.flatMap((r) => r.photos ?? []);

  return (
    <>
      {allPhotos.length > 0 && (
        <section className="section-block">
          <h2>標準化實測對照圖（粉塵 · 結團 · 顆粒比例尺）</h2>
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
          {allReviews.map((rv) => {
            const name = rv.display_name || '匿名飼主';
            const housingLabel = rv.housing ? HOUSING_LABEL[rv.housing] : '一般住宅';
            return (
              <div className="review-card card" key={rv.id}>
                <div className="review-top">
                  <div className="reviewer-avatar">{name.slice(0, 1)}</div>
                  <div>
                    <div className="row" style={{ gap: 6 }}>
                      <b>{name}</b>
                      <span className="tag plain">{rv.cats} 隻貓 · {housingLabel}</span>
                      {rv.verified && (
                        <span className="tag row" style={{ gap: 4 }}>
                          <VerifiedIcon size={12} /> 社群真實反饋
                        </span>
                      )}
                      {rv.sponsored && <span className="tag amber">試用揭露</span>}
                      {rv.source_tag && <span className="tag plain">{rv.source_tag}</span>}
                    </div>
                    <div className="small muted">{String(rv.created_at).slice(0, 10)} · {rv.day === 30 ? '第 30 天長期追蹤' : '開箱標準實測'}</div>
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

                <p className="review-body">{rv.comment}</p>

                {rv.ratings && (
                  <div className="row small muted" style={{ gap: 8 }}>
                    {rv.ratings.dust != null && <span className="tag plain">黑紙粉塵 {rv.ratings.dust}/5</span>}
                    {rv.ratings.clump != null && <span className="tag plain">結團硬度 {rv.ratings.clump}/5</span>}
                    {rv.ratings.odor != null && <span className="tag plain">第7天除臭 {rv.ratings.odor}/5</span>}
                    {rv.ratings.palatability != null && <span className="tag plain">適口性：{rv.ratings.palatability ? '願意把碗吃光' : '挑食'}</span>}
                    {rv.ratings.stool != null && <span className="tag plain">便便成形 {rv.ratings.stool} 分（布里斯托）</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
