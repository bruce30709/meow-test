export type Category = 'litter' | 'food';
export type Housing = 'studio' | 'apartment' | 'house';

export type Product = {
  id: string;
  category: Category;
  brand: string;
  name: string;
  subtitle?: string;
  origin?: string;
  specs?: string;
  tags?: string[];
  accent_color?: string;
  image_svg?: 'royal' | 'orijen' | 'nutram' | 'acana' | 'farmina' | 'everclean' | 'armhammer' | 'pidan' | 'odout' | 'dogcatstar' | 'ladyn';
  litter_type?: string | null;
  pack_weight_kg?: number | null;
  ref_price_twd?: number | null;
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
  // 'purchase'：連續兩次購買推算；'self'：飼主自填「一包用幾天」的備援估計
  days_source: 'purchase' | 'self' | null;
  dust: number | null;
  dust_w: number;
  clump?: number | null;
  tracking?: number | null;
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
  n_verified_all: number;
  cost_fallback: boolean;
  dust_b: number | null;
  odor_b: number | null;
  repurchase_b: number | null;
};

export type ReviewPhoto = {
  label: string;
  kind: 'dust' | 'clump' | 'kibble' | 'pack';
  caption: string;
};

export type Review = {
  id: string;
  product_id: string;
  display_name: string | null;
  cats: number;
  housing: Housing | null;
  comment: string;
  pros?: string;
  cons?: string;
  source_tag?: string;
  ratings?: {
    dust?: number;
    clump?: number;
    odor?: number;
    palatability?: boolean;
    stool?: number;
  };
  photos?: ReviewPhoto[];
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

export const HOUSING_LABEL: Record<Housing, string> = {
  studio: '套房（<10坪）',
  apartment: '公寓／大樓',
  house: '透天厝',
};
