'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHousehold, isIoTDevMode, writeLocalState, ensureUuid } from './useHousehold';
import { CatLogoIcon } from './Icons';

const USER_NAV_ITEMS = [
  { href: '/', label: '排行榜' },
  { href: '/calc', label: '成本試算' },
  { href: '/submit', label: '提交實測' },
  { href: '/method', label: '評分方法' },
];

const UAT_NAV_ITEMS = [
  { href: '/', label: '排行榜' },
  { href: '/calc', label: '成本試算' },
  { href: '/submit', label: '提交實測' },
  { href: '/method', label: '評分方法' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { household, totalPoints } = useHousehold();
  const level = totalPoints >= 250 ? 'Lv.3 評鑑官' : totalPoints >= 120 ? 'Lv.2 認證飼主' : 'Lv.1 飼主';
  const navItems = isIoTDevMode ? UAT_NAV_ITEMS : USER_NAV_ITEMS;

  return (
    <>
      {isIoTDevMode && (
        <div
          style={{
            background: '#3D2E2E',
            color: '#FFFDFB',
            fontSize: '0.78rem',
            padding: '6px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                background: '#E86F68',
                color: '#fff',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 99,
                fontSize: '0.72rem',
              }}
            >
              UAT 驗收模式
            </span>
            <span>測試環境</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              style={{
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)',
                padding: '3px 10px',
                borderRadius: 6,
                fontSize: '0.74rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (household) {
                  writeLocalState((prev) => ({ ...prev, loggedIn: false }));
                } else {
                  writeLocalState((prev) => ({
                    ...prev,
                    loggedIn: true,
                    household: {
                      ...prev.household,
                      id: ensureUuid(prev.household.id),
                      email: 'bruce30709@gmail.com',
                      display_name: '雙喵實測家 Bruce (UAT)',
                      cats: 2,
                      housing: 'apartment',
                    },
                  }));
                }
              }}
            >
              {household ? '切換：訪客視角' : '切換：測試會員'}
            </button>
            <a
              href="https://meow-test-5fg.pages.dev"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#FADCD9', textDecoration: 'underline', fontSize: '0.74rem' }}
            >
              前往正式站 (PROD) ↗
            </a>
          </div>
        </div>
      )}
      <header className="nav">
        <div className="nav-in">
          <Link href="/" className="logo">
            <span className="logo-mark">
              <CatLogoIcon size={20} />
            </span>
            <span>
              喵實測
              <small className="logo-sub">{isIoTDevMode ? 'UAT STAGING ENVIRONMENT' : 'MEOW TEST LAB'}</small>
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
    </>
  );
}
