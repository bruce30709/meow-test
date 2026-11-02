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

export function emptyStats(product_id: string): Stats {
  return {
    product_id, n_verified: 0, n_households: 0, repurchase_rate: null, median_cat_days: null,
    cost_per_cat_day: null, dust: null, dust_w: 0, odor: null, odor_w: 0, accept_rate: null,
    palatability: null, stool: null, soft_switch: null, vomit: null, vet_rate: null, n_tests: 0,
  };
}

// 處方飼料不進排行
export function rank(products: Product[], stats: Stats[], category: Category, sort: SortKey = 'score'): Ranked[] {
  const byId = new Map(stats.map((s) => [s.product_id, s]));
  const rows = products
    .filter((p) => p.category === category && !p.prescription)
    .map((p) => ({ ...p, ...(byId.get(p.id) ?? emptyStats(p.id)) }));

  const dustPrior = mean(rows.map((r) => r.dust)) ?? 3;
  const odorPrior = mean(rows.map((r) => r.odor)) ?? 3;
  const repPrior = mean(rows.map((r) => r.repurchase_rate)) ?? 0.5;
  const minCost = Math.min(...rows.map((r) => r.cost_per_cat_day ?? Infinity));

  const ranked: Ranked[] = rows.map((r) => {
    const dust_b = bayes(r.dust, r.dust_w, dustPrior);
    const odor_b = bayes(r.odor, r.odor_w, odorPrior);
    const repurchase_b = bayes(r.repurchase_rate, r.n_households, repPrior);
    let score: number;
    if (category === 'litter') {
      const cost = r.cost_per_cat_day && Number.isFinite(minCost) ? minCost / r.cost_per_cat_day : 0;
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
    return { ...r, score, dust_b, odor_b, repurchase_b, eligible: r.n_verified >= MIN_VERIFIED };
  });

  const key: Record<SortKey, (r: Ranked) => number> = {
    score: (r) => -r.score,
    cost: (r) => r.cost_per_cat_day ?? Infinity,
    repurchase: (r) => -(r.repurchase_b ?? -1),
    dust: (r) => r.dust_b ?? Infinity,
  };
  return ranked.sort((a, b) => Number(b.eligible) - Number(a.eligible) || key[sort](a) - key[sort](b));
}

// 一包在某個家庭能用幾天
export const daysForHousehold = (catDays: number | null, cats: number) =>
  catDays == null ? null : Math.round(catDays / Math.max(cats, 1));
