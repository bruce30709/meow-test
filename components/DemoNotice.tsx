import { hasSupabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DemoNotice() {
  if (hasSupabase) return null;
  return (
    <div className="demo-banner">
      <span className="demo-badge">本機互動體驗模式</span>
      <span>
        已預載 <b>法國皇家、歐睿健（渴望）、紐頓、藍鑽、鐵鎚、pidan</b> 等真實社群評價與規格。您可以直接測試{' '}
        <Link href="/me">會員登入／貓咪檔案</Link>、<Link href="/submit">送出實測</Link>、<Link href="/purchase">AI 訂單辨識</Link>，資料會即時保存在您的瀏覽器中！
      </span>
    </div>
  );
}
