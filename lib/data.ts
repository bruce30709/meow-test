import { server } from './supabase';
import { SAMPLE_PRODUCTS, SAMPLE_QUESTIONS, SAMPLE_REVIEWS, SAMPLE_STATS } from './sample';
import type { Product, Question, Review, Stats } from './types';

const num = (v: unknown) => (v == null ? null : Number(v));

export async function getProducts(): Promise<Product[]> {
  const db = server();
  if (!db) return SAMPLE_PRODUCTS;
  const { data, error } = await db.from('products').select('*').order('brand');
  if (error) throw error;
  return data as Product[];
}

export async function getProduct(id: string): Promise<Product | null> {
  return (await getProducts()).find((p) => p.id === id) ?? null;
}

export async function getStats(cats?: number, housing?: string): Promise<Stats[]> {
  const db = server();
  if (!db) return SAMPLE_STATS;
  const { data, error } = await db.rpc('product_stats', { p_cats: cats ?? null, p_housing: housing ?? null });
  if (error) throw error;
  return (data as Record<string, unknown>[]).map((r) => ({
    product_id: String(r.product_id),
    n_verified: Number(r.n_verified),
    n_households: Number(r.n_households),
    repurchase_rate: num(r.repurchase_rate),
    median_cat_days: num(r.median_cat_days),
    cost_per_cat_day: num(r.cost_per_cat_day),
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
    n_tests: Number(r.n_tests),
  }));
}

export async function getReviews(productId: string): Promise<Review[]> {
  const db = server();
  if (!db) return SAMPLE_REVIEWS.filter((r) => r.product_id === productId);
  const { data, error } = await db.from('public_reviews').select('*').eq('product_id', productId).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data as Review[];
}

export async function getQuestions(productId: string): Promise<Question[]> {
  const db = server();
  if (!db) return SAMPLE_QUESTIONS.filter((q) => q.product_id === productId);
  const { data, error } = await db
    .from('questions')
    .select('id, product_id, author_name, body, created_at, answers(id, author_name, body, created_at)')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) throw error;
  return data as Question[];
}
