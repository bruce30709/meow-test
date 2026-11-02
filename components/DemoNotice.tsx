import { hasSupabase } from '@/lib/supabase';

export default function DemoNotice() {
  if (hasSupabase) return null;
  return <p className="notice">目前是示意資料模式，數字皆為虛構。設定 Supabase 環境變數後就會使用真實資料。</p>;
}
