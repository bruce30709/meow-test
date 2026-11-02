'use client';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { browser } from '@/lib/supabase';

export type Household = { id: string; display_name: string; cats: number; housing: string | null; box_type: string | null; allergy: boolean };

export function useHousehold() {
  const db = browser();
  const [session, setSession] = useState<Session | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(Boolean(db));

  async function reload() {
    if (!db) return;
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
    if (!db) return;
    reload();
    const { data } = db.auth.onAuthStateChange(() => { reload(); });
    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { db, session, household, loading, reload };
}
