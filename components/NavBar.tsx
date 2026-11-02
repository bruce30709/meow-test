'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useHousehold } from './useHousehold';

const NAV_ITEMS = [
  { href: '/', label: '實測排行' },
  { href: '/calc', label: '每日成本計算' },
  { href: '/submit', label: '提交實測' },
  { href: '/purchase', label: '訂單驗證' },
  { href: '/iot', label: '二階段：智慧貼片' },
  { href: '/method', label: '評分規則' },
];

type ThemeKey = 'coral' | 'slate' | 'oat';
const THEMES: { key: ThemeKey; label: string; dot: string }[] = [
  { key: 'coral', label: '暖白珊瑚', dot: '#E05A47' },
  { key: 'slate', label: '極簡霧藍', dot: '#2563EB' },
  { key: 'oat', label: '日系燕麥', dot: '#8C583A' },
];

export default function NavBar() {
  const pathname = usePathname();
  const { household, totalPoints } = useHousehold();
  const [theme, setTheme] = useState<ThemeKey>('coral');

  useEffect(() => {
    const saved = (localStorage.getItem('meow_theme') as ThemeKey) || 'coral';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  function cycleTheme() {
    const idx = THEMES.findIndex((t) => t.key === theme);
    const next = THEMES[(idx + 1) % THEMES.length].key;
    setTheme(next);
    localStorage.setItem('meow_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  const currentTheme = THEMES.find((t) => t.key === theme) ?? THEMES[0];
  const level = totalPoints >= 250 ? 'Lv.3 殿堂評鑑官' : totalPoints >= 120 ? 'Lv.2 認證實測員' : 'Lv.1 見習鏟屎官';

  return (
    <header className="nav">
      <div className="nav-in">
        <Link href="/" className="logo">
          <span className="logo-mark">🐾</span>
          <span>
            喵實測
            <small className="logo-sub">中立貓糧・貓砂數據實驗室</small>
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

        <div className="row" style={{ gap: 8 }}>
          <button
            type="button"
            className="theme-switch"
            onClick={cycleTheme}
            title="點擊切換網站配色主題"
          >
            <span className="theme-dot" style={{ background: currentTheme.dot }} />
            <span>{currentTheme.label}</span>
          </button>

          <Link href="/me" className={`user-pill ${pathname.startsWith('/me') ? 'active' : ''}`}>
            {household ? (
              <>
                <span className="user-avatar">{household.display_name.slice(0, 1)}</span>
                <span className="user-name">{household.display_name}</span>
                <span className="points-badge">{level}</span>
              </>
            ) : (
              <span className="login-cta">登入／我的貓窩 →</span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
