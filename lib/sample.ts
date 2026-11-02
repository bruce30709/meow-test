// 示意資料：沒有設定 Supabase 時使用，品牌與數字皆為虛構（刻意不用真實品牌，避免虛構數字被當成真實評價）
import type { Product, Question, Review, Stats } from './types';

export const SAMPLE_PRODUCTS: Product[] = [
  { id: 'a', category: 'litter', brand: 'A 牌', name: '原味豆腐砂 6L', litter_type: 'tofu', pack_weight_kg: 2.4, prescription: false, is_sample: true },
  { id: 'b', category: 'litter', brand: 'B 牌', name: '礦砂 10kg', litter_type: 'bentonite', pack_weight_kg: 10, prescription: false, is_sample: true },
  { id: 'c', category: 'litter', brand: 'C 牌', name: '木薯砂 7L', litter_type: 'cassava', pack_weight_kg: 3, prescription: false, is_sample: true },
  { id: 'd', category: 'litter', brand: 'D 牌', name: '混合砂 6L', litter_type: 'mixed', pack_weight_kg: 2.6, prescription: false, is_sample: true },
  { id: 'e', category: 'litter', brand: 'E 牌', name: '松木砂 10kg', litter_type: 'pine', pack_weight_kg: 10, prescription: false, is_sample: true },
  { id: 'f', category: 'food', brand: 'F 牌', name: '成貓雞肉乾糧', life_stage: 'adult', pack_weight_kg: 2, prescription: false, is_sample: true },
  { id: 'g', category: 'food', brand: 'G 牌', name: '幼貓鮭魚乾糧', life_stage: 'kitten', pack_weight_kg: 1.5, prescription: false, is_sample: true },
  { id: 'h', category: 'food', brand: 'H 牌', name: '熟齡貓火雞乾糧', life_stage: 'mature', pack_weight_kg: 2, prescription: false, is_sample: true },
  { id: 'p', category: 'food', brand: 'P 牌', name: '泌尿道處方乾糧', life_stage: 'adult', pack_weight_kg: 2, prescription: true, is_sample: true },
];

const s = (o: Partial<Stats> & { product_id: string }): Stats => ({
  n_verified: 0, n_households: 0, repurchase_rate: null, median_cat_days: null, cost_per_cat_day: null, days_source: null,
  dust: null, dust_w: 0, odor: null, odor_w: 0, accept_rate: null, palatability: null, stool: null,
  soft_switch: null, vomit: null, vet_rate: null, n_tests: 0, ...o,
});

export const SAMPLE_STATS: Stats[] = [
  s({ product_id: 'a', n_verified: 142, n_households: 120, repurchase_rate: 0.64, median_cat_days: 18, cost_per_cat_day: 13.8, days_source: 'purchase', dust: 1.6, dust_w: 90, odor: 4.0, odor_w: 90, accept_rate: 0.95, n_tests: 96 }),
  s({ product_id: 'b', n_verified: 97, n_households: 85, repurchase_rate: 0.48, median_cat_days: 40, cost_per_cat_day: 10.0, days_source: 'purchase', dust: 3.8, dust_w: 60, odor: 3.6, odor_w: 60, accept_rate: 0.97, n_tests: 64 }),
  s({ product_id: 'c', n_verified: 86, n_households: 70, repurchase_rate: 0.71, median_cat_days: 24, cost_per_cat_day: 12.5, days_source: 'purchase', dust: 1.9, dust_w: 55, odor: 4.1, odor_w: 55, accept_rate: 0.96, n_tests: 58 }),
  s({ product_id: 'd', n_verified: 51, n_households: 44, repurchase_rate: 0.55, median_cat_days: 22, cost_per_cat_day: 12.2, days_source: 'purchase', dust: 2.2, dust_w: 35, odor: 3.8, odor_w: 35, accept_rate: 0.93, n_tests: 37 }),
  s({ product_id: 'e', n_verified: 33, n_households: 30, repurchase_rate: 0.39, median_cat_days: 50, cost_per_cat_day: 7.0, days_source: 'self', dust: 1.2, dust_w: 22, odor: 3.2, odor_w: 22, accept_rate: 0.78, n_tests: 24 }),
  s({ product_id: 'f', n_verified: 64, n_households: 58, repurchase_rate: 0.58, median_cat_days: 30, cost_per_cat_day: 21.5, days_source: 'purchase', palatability: 0.87, stool: 2.5, soft_switch: 0.12, vomit: 0.09, vet_rate: 0.31, n_tests: 41 }),
  s({ product_id: 'g', n_verified: 38, n_households: 35, repurchase_rate: 0.66, median_cat_days: 26, cost_per_cat_day: 24.0, days_source: 'purchase', palatability: 0.91, stool: 3, soft_switch: 0.18, vomit: 0.05, vet_rate: 0.22, n_tests: 27 }),
  s({ product_id: 'h', n_verified: 12, n_households: 11, repurchase_rate: 0.45, median_cat_days: 32, cost_per_cat_day: 19.0, days_source: 'self', palatability: 0.8, stool: 2, soft_switch: 0.1, vomit: 0.12, vet_rate: 0.4, n_tests: 9 }),
];

// 示意模式下切換「幾隻貓／住宅」時，模擬細分情境的樣本數與除臭差異，方便在本機預覽篩選效果
export function sampleStatsFor(cats?: number, housing?: string): Stats[] {
  if (cats == null && !housing) return SAMPLE_STATS;
  const ratio = (cats === 1 ? 0.45 : cats === 2 ? 0.35 : cats === 3 ? 0.2 : 1)
    * (housing === 'studio' ? 0.35 : housing === 'apartment' ? 0.45 : housing === 'house' ? 0.2 : 1);
  return SAMPLE_STATS.map((row) => {
    const n_verified = Math.max(1, Math.round(row.n_verified * ratio));
    const n_households = Math.max(1, Math.round(row.n_households * ratio));
    // 套房對除臭與粉塵更敏感；3 貓家庭偶爾遇到細分樣本太少而觸發全站成本備援（≈）
    const odorShift = housing === 'studio' && row.product_id === 'a' ? -0.5 : housing === 'studio' && row.product_id === 'c' ? 0.2 : 0;
    const dropCost = cats === 3 && housing === 'house' && row.product_id === 'e';
    return {
      ...row,
      n_verified,
      n_households,
      dust_w: Math.max(1, Math.round(row.dust_w * ratio)),
      odor: row.odor != null ? Math.min(5, Math.max(1, Number((row.odor + odorShift).toFixed(1)))) : null,
      odor_w: Math.max(1, Math.round(row.odor_w * ratio)),
      cost_per_cat_day: dropCost ? null : row.cost_per_cat_day,
    };
  });
}

export const SAMPLE_REVIEWS: Review[] = [
  { id: 'r1', product_id: 'c', display_name: '小米媽', cats: 2, housing: 'studio', comment: '結團很硬、好鏟，第三週開始有一點粉。', sponsored: false, verified: true, day: 30, created_at: '2026-10-20' },
  { id: 'r2', product_id: 'c', display_name: '三貓阿哲', cats: 3, housing: 'house', comment: '除臭比豆腐砂好，價格中間。', sponsored: true, verified: false, day: 0, created_at: '2026-10-18' },
  { id: 'r3', product_id: 'a', display_name: '套房喵', cats: 1, housing: 'studio', comment: '幾乎沒粉塵，但兩週後味道會出來。', sponsored: false, verified: true, day: 0, created_at: '2026-10-15' },
];

export const SAMPLE_QUESTIONS: Question[] = [
  { id: 'q1', product_id: 'c', author_name: '新手貓奴', body: '上掀式砂盆會不會很容易卡在蓋子？', created_at: '2026-10-21', answers: [
    { id: 'q1a', author_name: '小米媽', body: '不太會，顆粒比豆腐砂小一點，但比礦砂大。', created_at: '2026-10-21' },
  ] },
];
