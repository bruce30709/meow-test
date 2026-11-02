export type Category = 'litter' | 'food';
export type Housing = 'studio' | 'apartment' | 'house';

export type Product = {
  id: string;
  category: Category;
  brand: string;
  name: string;
  litter_type?: string | null;
  pack_weight_kg?: number | null;
  life_stage?: string | null;
  prescription: boolean;
  buy_url?: string | null;
  is_sample?: boolean;
};

export type Stats = {
  product_id: string;
  n_verified: number;
  n_households: number;
  repurchase_rate: number | null;
  median_cat_days: number | null;
  cost_per_cat_day: number | null;
  dust: number | null;
  dust_w: number;
  odor: number | null;
  odor_w: number;
  accept_rate: number | null;
  palatability: number | null;
  stool: number | null;
  soft_switch: number | null;
  vomit: number | null;
  vet_rate: number | null;
  n_tests: number;
};

export type Ranked = Product & Stats & {
  score: number;
  eligible: boolean;
  dust_b: number | null;
  odor_b: number | null;
  repurchase_b: number | null;
};

export type Review = {
  id: string;
  product_id: string;
  display_name: string | null;
  cats: number;
  housing: Housing | null;
  comment: string;
  sponsored: boolean;
  verified: boolean;
  day: number;
  created_at: string;
};

export type Question = {
  id: string;
  product_id: string;
  author_name: string;
  body: string;
  created_at: string;
  answers: { id: string; author_name: string; body: string; created_at: string }[];
};

export const HOUSING_LABEL: Record<Housing, string> = { studio: '套房', apartment: '公寓', house: '透天' };
