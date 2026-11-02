'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browser } from '@/lib/supabase';
import type { Housing, Question, Review } from '@/lib/types';

export type Household = {
  id: string;
  email?: string;
  display_name: string;
  cats: number;
  housing: Housing | null;
  box_type: string | null;
  allergy: boolean;
};

export type CatProfile = {
  id: string;
  name: string;
  birth_date: string | null;
  long_hair: boolean;
  neutered: boolean;
  vet_tags: string[];
};

export type PointEntry = {
  id: string;
  delta: number;
  reason: string;
  label: string;
  created_at: string;
};

export type LocalPurchase = {
  id: string;
  product_id: string;
  purchased_at: string;
  quantity: number;
  price_twd: number | null;
  channel: string;
  verified: boolean;
  full_replace: boolean;
};

type LocalState = {
  loggedIn: boolean;
  household: Household;
  cats: CatProfile[];
  points: PointEntry[];
  purchases: LocalPurchase[];
  reviews: Review[];
  questions: Question[];
};

const STORAGE_KEY = 'meow_test_local_v2';
const EVENT_NAME = 'meow-local-update';

const DEFAULT_STATE: LocalState = {
  loggedIn: true,
  household: {
    id: 'local-hh-1',
    email: 'bruce30709@gmail.com',
    display_name: '雙喵實測家 Bruce',
    cats: 2,
    housing: 'apartment',
    box_type: '開放式大砂盆',
    allergy: true,
  },
  cats: [
    { id: 'c1', name: '橘子', birth_date: '2022-05-12', long_hair: false, neutered: true, vet_tags: ['體重控制'] },
    { id: 'c2', name: '麻糬', birth_date: '2024-02-18', long_hair: true, neutered: true, vet_tags: ['腸胃敏感'] },
  ],
  points: [
    { id: 'p1', delta: 80, reason: 'test', label: '完成標準實測：法國皇家 IN27 室內成貓', created_at: '2026-10-20' },
    { id: 'p2', delta: 30, reason: 'purchase', label: '上傳購買證明：藍鑽 Ever Clean 雙重活性碳礦砂', created_at: '2026-10-24' },
    { id: 'p3', delta: 50, reason: 'test', label: '完成第 30 天追蹤：藍鑽 Ever Clean 雙重活性碳礦砂', created_at: '2026-10-30' },
  ],
  purchases: [
    { id: 'pu1', product_id: 'everclean-blue', purchased_at: '2026-09-15', quantity: 1, price_twd: 650, channel: '好市多線上', verified: true, full_replace: true },
    { id: 'pu2', product_id: 'royal-in27', purchased_at: '2026-10-10', quantity: 1, price_twd: 780, channel: 'momo 購物網', verified: true, full_replace: false },
  ],
  reviews: [],
  questions: [],
};

export function readLocalState(): LocalState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function writeLocalState(updater: (prev: LocalState) => LocalState) {
  if (typeof window === 'undefined') return;
  const next = updater(readLocalState());
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function useHousehold() {
  const db = browser();
  const [session, setSession] = useState<Session | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [local, setLocal] = useState<LocalState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);

  async function reload() {
    if (!db) {
      const st = readLocalState();
      setLocal(st);
      setHousehold(st.loggedIn ? st.household : null);
      setLoading(false);
      return;
    }
    const { data } = await db.auth.getSession();
    setSession(data.session);
    if (data.session) {
      const { data: h } = await db.from('households').select('*').maybeSingle();
      setHousehold(h as Household | null);
    } else {
      setHousehold(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    reload();
    if (!db) {
      const onUpdate = () => reload();
      window.addEventListener(EVENT_NAME, onUpdate);
      window.addEventListener('storage', onUpdate);
      return () => {
        window.removeEventListener(EVENT_NAME, onUpdate);
        window.removeEventListener('storage', onUpdate);
      };
    }
    const { data } = db.auth.onAuthStateChange(() => { reload(); });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPoints = local.points.reduce((sum, p) => sum + p.delta, 0);

  return {
    db,
    isLocalMode: !db,
    session,
    household,
    local,
    totalPoints,
    loading,
    reload,
  };
}
