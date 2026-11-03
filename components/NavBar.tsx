'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHousehold, isIoTDevMode } from './useHousehold';
import { CatLogoIcon } from './Icons';

const USER_NAV_ITEMS = [
  { href: '/', label: '排行榜' },
  { href: '/calc', label: '每日成本試算' },
  { href: '/submit', label: '提交實測' },
  { href: '/purchase', label: '訂單驗證' },
  { href: '/method', label: '評分方法' },
];

const IOT_NAV_ITEMS = [
  { href: '/iot', label: 'IoT 感測貼片研發台' },
  { href: '/', label: '排行榜數據端' },
  { href: '/calc', label: '成本試算' },
  { href: '/submit', label: '提交實測' },
  { href: '/purchase', label: '訂單驗證' },
  { href: '/method', label: '評分方法' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { household, totalPoints } = useHousehold();
  const level = totalPoints >= 250 ? 'Lv.3 評鑑官' : totalPoints >= 120 ? 'Lv.2 認證飼主' : 'Lv.1 飼主';
  const navItems = isIoTDevMode ? IOT_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <header className="nav">
      <div className="nav-in">
        <Link href={isIoTDevMode ? '/iot' : '/'} className="logo">
          <span className="logo-mark">
            <CatLogoIcon size={20} />
          </span>
          <span>
            {isIoTDevMode ? '喵實測 · IoT 研發台' : '喵實測'}
            <small className="logo-sub">{isIoTDevMode ? 'HARDWARE & DATA LAB' : 'MEOW TEST LAB'}</small>
          </span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => {
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
              <span className="points-badge">{level}</span>
            </>
          ) : (
            <span className="login-cta">登入 / 我的貓窩</span>
          )}
        </Link>
      </div>
    </header>
  );
}
