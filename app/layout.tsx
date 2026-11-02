import type { Metadata } from 'next';
import Script from 'next/script';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: '喵實測｜台灣貓砂與貓飼料真實數據排行榜（皇家、歐睿健、紐頓、藍鑽實測）',
  description: '拒絕業配洗版！結合訂單回購證明、居家 3 分鐘標準化盲測與家庭情境分組的貓砂與飼料排行榜。',
};

const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
const matomoSite = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant-TW">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=LXGW+WenKai+TC:wght@400;700&family=Noto+Sans+TC:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;600;700&display=swap" />
      </head>
      <body>
        <NavBar />
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
