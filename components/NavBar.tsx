'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHousehold } from './useHousehold';

const NAV_ITEMS = [
  { href: '/', label: '🏆 實測排行' },
  { href: '/calc', label: '🧮 算每日成本' },
  { href: '/submit', label: '✍️ 做實測 (+80點)' },
  { href: '/purchase', label: '🧾 傳訂單 (+30點)' },
  { href: '/method', label: '📐 評分規則' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { household, totalPoints } = useHousehold();

  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="logo">
          <span className="logo-mark">🐾</span>
          <span>
            喵實測
            <small className="logo-sub">台灣貓砂・飼料真實數據排行</small>
          </span>
        </Link>

        <nav className="nav-links">
          {NAV_ITEMS.map((item) => {
            const active = item.href === '/' ? pathname === '/' || pathname.startsWith('/products') : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`nav-link ${active ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/me" className={`user-pill ${pathname.startsWith('/me') ? 'active' : ''}`}>
          {household ? (
            <>
              <span className="user-avatar">{household.display_name.slice(0, 1)}</span>
              <span className="user-name">{household.display_name}</span>
              <span className="points-badge">🪙 {totalPoints} 點</span>
            </>
          ) : (
            <span className="login-cta">登入／註冊領點數 →</span>
          )}
        </Link>
      </div>
    </header>
  );
}
