import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '喵實測｜真的用過、真的回購的貓砂與飼料排行',
  description: '用標準實測和購買紀錄，依你家情境排名的貓砂與飼料排行榜。',
};

const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
const matomoSite = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&family=Noto+Sans+TC:wght@400;700&family=IBM+Plex+Mono:wght@400;600&display=swap" />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-in">
            <Link href="/" className="logo">喵實測</Link>
            <Link href="/">排行榜</Link>
            <Link href="/submit">做實測</Link>
            <Link href="/purchase">上傳訂單</Link>
            <Link href="/me">我的家</Link>
            <Link href="/method">實測方法</Link>
          </div>
        </nav>
        {children}
        {matomoUrl && matomoSite && (
          <Script id="matomo" strategy="afterInteractive">{`
            var _paq = window._paq = window._paq || [];
            _paq.push(['trackPageView']); _paq.push(['enableLinkTracking']);
            (function() { var u='${matomoUrl.replace(/\/?$/, '/')}';
              _paq.push(['setTrackerUrl', u+'matomo.php']); _paq.push(['setSiteId', '${matomoSite}']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s); })();
          `}</Script>
        )}
      </body>
    </html>
  );
}
