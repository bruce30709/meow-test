import type { Category, Product, Ranked, Stats } from './types';

export const MIN_VERIFIED = Number(process.env.NEXT_PUBLIC_MIN_VERIFIED ?? 15);
const C = 10; // 貝氏平均的先驗權重

export type SortKey = 'score' | 'cost' | 'repurchase' | 'dust';

export function bayes(avg: number | null, w: number, prior: number): number | null {
  if (avg == null || w <= 0) return null;
  return (C * prior + avg * w) / (C + w);
}

function mean(xs: (number | null)[]): number | null {
  const v = xs.filter((x): x is number => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

const positive = (x: number | null | undefined): x is number => x != null && Number.isFinite(x) && x > 0;

export function emptyStats(product_id: string): Stats {
  return {
    product_id, n_verified: 0, n_households: 0, repurchase_rate: null, median_cat_days: null,
    cost_per_cat_day: null, days_source: null, dust: null, dust_w: 0, odor: null, odor_w: 0, accept_rate: null,
    palatability: null, stool: null, soft_switch: null, vomit: null, vet_rate: null, n_tests: 0,
  };
}

/**
 * 處方飼料不進排行。
 * @param stats   目前情境（可能已依貓數／住宅篩選）的統計
 * @param overall 全站統計；有給的話，進榜門檻看全站購買驗證數，情境沒有成本資料時也用全站數字補上。
 *                這樣點了「2 貓・套房」不會因為細分後每款都不滿 15 筆而整個排行榜變空白。
 */
export function rank(
  products: Product[], stats: Stats[], category: Category, sort: SortKey = 'score', overall?: Stats[],
): Ranked[] {
  const byId = new Map(stats.map((s) => [s.product_id, s]));
  const allById = new Map((overall ?? stats).map((s) => [s.product_id, s]));
  const rows = products
    .filter((p) => p.category === category && !p.prescription)
    .map((p) => {
      const s = byId.get(p.id) ?? emptyStats(p.id);
      const all = allById.get(p.id) ?? s;
      const cost_fallback = !positive(s.cost_per_cat_day) && positive(all.cost_per_cat_day);
      return {
        ...p,
        ...s,
        ...(cost_fallback
          ? { cost_per_cat_day: all.cost_per_cat_day, median_cat_days: all.median_cat_days, days_source: all.days_source }
          : {}),
        cost_fallback,
        n_verified_all: Math.max(all.n_verified, s.n_verified),
      };
    });

  const dustPrior = mean(rows.map((r) => r.dust)) ?? 3;
  const odorPrior = mean(rows.map((r) => r.odor)) ?? 3;
  const repPrior = mean(rows.map((r) => r.repurchase_rate)) ?? 0.5;
  const costs = rows.map((r) => r.cost_per_cat_day).filter(positive);
  const minCost = costs.length ? Math.min(...costs) : null;

  const ranked: Ranked[] = rows.map((r) => {
    const dust_b = bayes(r.dust, r.dust_w, dustPrior);
    const odor_b = bayes(r.odor, r.odor_w, odorPrior);
    const repurchase_b = bayes(r.repurchase_rate, r.n_households, repPrior);
    let score: number;
    if (category === 'litter') {
      const cost = minCost != null && positive(r.cost_per_cat_day) ? minCost / r.cost_per_cat_day : 0;
      score =
        0.3 * (repurchase_b ?? 0) +
        0.25 * cost +
        0.2 * (dust_b == null ? 0 : (5 - dust_b) / 4) +
        0.15 * (odor_b == null ? 0 : (odor_b - 1) / 4) +
        0.1 * (r.accept_rate ?? 0);
    } else {
      score =
        0.4 * (repurchase_b ?? 0) +
        0.35 * (r.palatability ?? 0) +
        0.15 * (1 - (r.soft_switch ?? 1)) +
        0.1 * (1 - (r.vomit ?? 1));
    }
    return { ...r, score, dust_b, odor_b, repurchase_b, eligible: r.n_verified_all >= MIN_VERIFIED };
  });

  const key: Record<SortKey, (r: Ranked) => number> = {
    score: (r) => -r.score,
    cost: (r) => (positive(r.cost_per_cat_day) ? r.cost_per_cat_day : Infinity),
    repurchase: (r) => -(r.repurchase_b ?? -1),
    dust: (r) => r.dust_b ?? Infinity,
  };
  // Infinity - Infinity = NaN 會讓排序不穩定，所以先比再減
  const cmp = (a: number, b: number) => (a === b ? 0 : a < b ? -1 : 1);
  return ranked.sort((a, b) => Number(b.eligible) - Number(a.eligible) || cmp(key[sort](a), key[sort](b)));
}

// 一包在某個家庭能用幾天
export const daysForHousehold = (catDays: number | null, cats: number) =>
  catDays == null ? null : Math.round(catDays / Math.max(cats, 1));

// 中位數（計算機用來跟全站比較）
export function median(xs: number[]): number | null {
  const v = xs.filter(positive).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
