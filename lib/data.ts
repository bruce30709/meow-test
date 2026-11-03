import { server } from './supabase';
import { SAMPLE_PRODUCTS, SAMPLE_QUESTIONS, SAMPLE_REVIEWS, sampleStatsFor } from './sample';
import type { Product, Question, Review, Stats } from './types';

const num = (v: unknown) => (v == null ? null : Number(v));

export async function getProducts(): Promise<Product[]> {
  const db = server();
  if (!db) return SAMPLE_PRODUCTS;
  const { data, error } = await db.from('products').select('*').order('brand');
  if (error || !data || data.length === 0) return SAMPLE_PRODUCTS;
  // 將雲端資料庫商品與本地豐富視覺欄位相容合併
  const sampleMap = new Map(SAMPLE_PRODUCTS.map((p) => [p.id, p]));
  return (data as Product[]).map((p) => ({
    ...sampleMap.get(p.id),
    ...p,
  }));
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

export async function getStats(cats?: number, housing?: string): Promise<Stats[]> {
  const db = server();
  const baseStats = sampleStatsFor(cats, housing);
  if (!db) return baseStats;
  const { data, error } = await db.rpc('product_stats', { p_cats: cats ?? null, p_housing: housing ?? null });
  if (error || !data) return baseStats;

  const baseMap = new Map(baseStats.map((s) => [s.product_id, s]));
  return (data as Record<string, unknown>[]).map((r) => {
    const pid = String(r.product_id);
    const liveVerified = Number(r.n_verified);
    const liveTests = Number(r.n_tests);
    const base = baseMap.get(pid);
    // 若雲端剛起步尚無滿額實測，融合社群基準實測數據並累加真實新增筆數
    if (base && liveVerified < 15) {
      return {
        ...base,
        n_verified: base.n_verified + liveVerified,
        n_households: base.n_households + Number(r.n_households),
        n_tests: base.n_tests + liveTests,
      };
    }
    return {
      product_id: pid,
      n_verified: liveVerified,
      n_households: Number(r.n_households),
      repurchase_rate: num(r.repurchase_rate),
      median_cat_days: num(r.median_cat_days),
      cost_per_cat_day: num(r.cost_per_cat_day),
      days_source: r.days_source === 'purchase' || r.days_source === 'self' ? r.days_source : null,
      dust: num(r.dust),
      dust_w: Number(r.dust_w),
      odor: num(r.odor),
      odor_w: Number(r.odor_w),
      accept_rate: num(r.accept_rate),
      palatability: num(r.palatability),
      stool: num(r.stool),
      soft_switch: num(r.soft_switch),
      vomit: num(r.vomit),
      vet_rate: num(r.vet_rate),
      n_tests: liveTests,
    };
  });
}

export async function getReviews(productId: string): Promise<Review[]> {
  const db = server();
  const base = SAMPLE_REVIEWS.filter((r) => r.product_id === productId);
  if (!db) return base;
  const { data, error } = await db
    .from('public_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error || !data) return base;
  return [...(data as Review[]), ...base];
}

export async function getQuestions(productId: string): Promise<Question[]> {
  const db = server();
  const base = SAMPLE_QUESTIONS.filter((q) => q.product_id === productId);
  if (!db) return base;
  const { data, error } = await db
    .from('questions')
    .select('id, product_id, author_name, body, created_at, answers(id, author_name, body, created_at)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error || !data) return base;
  return [...(data as Question[]), ...base];
}
