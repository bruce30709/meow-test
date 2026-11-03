import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rjzibqtfdwvsqqxixlvq.supabase.co';
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqemlicXRmZHd2c3FxeGl4bHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3MTAwOTUsImV4cCI6MjEwOTI4NjA5NX0.WtUFpoDw9H6fFxWvDCF_kJzrRpfgAcQOmVLkofa8eXA';

export const hasSupabase = Boolean(url && anon);

let browserClient: SupabaseClient | null = null;

// 瀏覽器端（登入、寫入，受 RLS 保護）
export function browser(): SupabaseClient | null {
  if (!hasSupabase) return null;
  browserClient ??= createClient(url!, anon!);
  return browserClient;
}

// 伺服器端唯讀
export function server(): SupabaseClient | null {
  if (!hasSupabase) return null;
  return createClient(url!, anon!, { auth: { persistSession: false } });
}

// 伺服器端管理權限（只在 API route 使用）
export function admin(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
