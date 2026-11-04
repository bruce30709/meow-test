import type { Product, ReviewPhoto } from '@/lib/types';
import { CameraIcon } from './Icons';

type PackTheme = {
  form: 'bag' | 'box';
  primary: string;
  headerBg: string;
  headerText: string;
  bodyBg: string;
  accentBg: string;
  accentText: string;
  brandName: string;
  badgeCode: string;
  tagColor: string;
  stripeColor?: string;
  subLabel?: string;
};

const THEMES: Record<string, PackTheme> = {
  'royal-in27': {
    form: 'bag',
    primary: '#E11922',
    headerBg: '#E11922',
    headerText: '#FFFFFF',
    bodyBg: '#FFFFFF',
    accentBg: '#FFF1F2',
    accentText: '#BE123C',
    brandName: 'ROYAL CANIN',
    badgeCode: 'IN 27',
    tagColor: '#E11922',
    subLabel: 'INDOOR ADULT',
    stripeColor: '#F59E0B',
  },
  'royal-lp34': {
    form: 'bag',
    primary: '#1D4ED8',
    headerBg: '#E11922',
    headerText: '#FFFFFF',
    bodyBg: '#FFFFFF',
    accentBg: '#EFF6FF',
    accentText: '#1E40AF',
    brandName: 'ROYAL CANIN',
    badgeCode: 'S/O LP34',
    tagColor: '#1D4ED8',
    subLabel: 'URINARY VET',
    stripeColor: '#1D4ED8',
  },
  'orijen-chicken': {
    form: 'bag',
    primary: '#991B1B',
    headerBg: '#2E150D',
    headerText: '#FDE68A',
    bodyBg: '#451A03',
    accentBg: '#B91C1C',
    accentText: '#FEF3C7',
    brandName: 'ORIJEN',
    badgeCode: '85% MEAT',
    tagColor: '#F59E0B',
    subLabel: 'ORIGINAL CAT',
    stripeColor: '#D97706',
  },
  'nutram-t22': {
    form: 'bag',
    primary: '#0F172A',
    headerBg: '#1E293B',
    headerText: '#FFFFFF',
    bodyBg: '#F8FAFC',
    accentBg: '#FFF7ED',
    accentText: '#C2410C',
    brandName: 'NUTRAM',
    badgeCode: 'T22',
    tagColor: '#EA580C',
    subLabel: 'GRAIN FREE',
    stripeColor: '#EA580C',
  },
  'acana-indoor': {
    form: 'bag',
    primary: '#B45309',
    headerBg: '#78350F',
    headerText: '#FEF3C7',
    bodyBg: '#FFFBEB',
    accentBg: '#F0FDF4',
    accentText: '#15803D',
    brandName: 'ACANA',
    badgeCode: 'INDOOR',
    tagColor: '#B45309',
    subLabel: 'HERITAGE RECIPE',
    stripeColor: '#15803D',
  },
  'farmina-nd': {
    form: 'bag',
    primary: '#3F6212',
    headerBg: '#3F6212',
    headerText: '#FEF9C3',
    bodyBg: '#FEFCE8',
    accentBg: '#FFF1F2',
    accentText: '#991B1B',
    brandName: 'FARMINA',
    badgeCode: 'N&D PRIME',
    tagColor: '#4D7C0F',
    subLabel: 'GRAIN-FREE 98%',
    stripeColor: '#B45309',
  },
  'everclean-blue': {
    form: 'box',
    primary: '#1E3A8A',
    headerBg: '#1E3A8A',
    headerText: '#FFFFFF',
    bodyBg: '#EFF6FF',
    accentBg: '#0891B2',
    accentText: '#FFFFFF',
    brandName: 'EVER CLEAN',
    badgeCode: 'CARBON+',
    tagColor: '#0284C7',
    subLabel: '25 LB HEAVY BOX',
    stripeColor: '#38BDF8',
  },
  'arm-hammer-slide': {
    form: 'box',
    primary: '#C2410C',
    headerBg: '#EA580C',
    headerText: '#FFFFFF',
    bodyBg: '#FFF7ED',
    accentBg: '#B45309',
    accentText: '#FFFFFF',
    brandName: 'ARM & HAMMER',
    badgeCode: 'SLIDE',
    tagColor: '#EA580C',
    subLabel: '40 LB NON-STICK',
    stripeColor: '#FBBF24',
  },
  'pidan-mixed': {
    form: 'bag',
    primary: '#18181B',
    headerBg: '#18181B',
    headerText: '#FFFFFF',
    bodyBg: '#FFFFFF',
    accentBg: '#FEF08A',
    accentText: '#854D0E',
    brandName: 'pidan',
    badgeCode: 'MIXED 7:3',
    tagColor: '#EAB308',
    subLabel: 'LAB EDITION',
    stripeColor: '#E4E4E7',
  },
  'odout-tofu': {
    form: 'bag',
    primary: '#047857',
    headerBg: '#065F46',
    headerText: '#FFFFFF',
    bodyBg: '#ECFDF5',
    accentBg: '#D1FAE5',
    accentText: '#065F46',
    brandName: 'ODOUT',
    badgeCode: '1.5MM TOFU',
    tagColor: '#10B981',
    subLabel: 'ODOR LOCK',
    stripeColor: '#34D399',
  },
  'dogcatstar-cassava': {
    form: 'bag',
    primary: '#C2410C',
    headerBg: '#EA580C',
    headerText: '#FFFFFF',
    bodyBg: '#FFF7ED',
    accentBg: '#FED7AA',
    accentText: '#9A3412',
    brandName: 'DOGCATSTAR',
    badgeCode: 'CASSAVA',
    tagColor: '#FB923C',
    subLabel: 'PREMIUM ZERO-DUST',
    stripeColor: '#FDBA74',
  },
  'lady-n-tofu': {
    form: 'bag',
    primary: '#BE185D',
    headerBg: '#BE185D',
    headerText: '#FFFFFF',
    bodyBg: '#FDF2F8',
    accentBg: '#FCE7F3',
    accentText: '#9D174D',
    brandName: 'LADY N',
    badgeCode: 'PEA TOFU',
    tagColor: '#F43F5E',
    subLabel: 'SILK TOUCH',
    stripeColor: '#F472B6',
  },
};

export function ProductPackThumb({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 108 : size === 'md' ? 82 : 56;
  const theme = THEMES[product.id] || {
    form: product.id.includes('box') ? 'box' : 'bag',
    primary: '#E86F68',
    headerBg: '#E86F68',
    headerText: '#FFFFFF',
    bodyBg: '#FFFFFF',
    accentBg: '#FCECEB',
    accentText: '#3D2E2E',
    brandName: product.brand.slice(0, 10).toUpperCase(),
    badgeCode: product.pack_weight_kg ? `${product.pack_weight_kg}KG` : 'STD',
    tagColor: '#E86F68',
    subLabel: 'VERIFIED',
  };

  const isBox = theme.form === 'box';

  return (
    <div
      className={`pack-thumb pack-${size}`}
      style={{ width: dim, height: dim, flexShrink: 0 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <filter id={`shadow-${product.id}`} x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#3D2E2E" floodOpacity="0.12" />
          </filter>
          <linearGradient id={`grad-bag-${product.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.bodyBg} />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id={`grad-header-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={theme.headerBg} />
            <stop offset="100%" stopColor={theme.stripeColor || theme.headerBg} />
          </linearGradient>
        </defs>

        {/* 柔光微圓角畫布底 */}
        <rect x="2" y="2" width="96" height="96" rx="22" fill="#FFFDFB" stroke="#F3E3DF" strokeWidth="1.2" />
        <ellipse cx="50" cy="88" rx="28" ry="4" fill="#3D2E2E" opacity="0.08" />

        {isBox ? (
          // ================= 立體質感砂盒 =================
          <g filter={`url(#shadow-${product.id})`}>
            {/* 盒頂面 */}
            <path
              d="M24 24 L33 16 L80 16 L71 24 Z"
              fill={theme.stripeColor || '#E2E8F0'}
              stroke="#4A3737"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* 盒側面深色陰影 */}
            <path
              d="M71 24 L80 16 L80 76 L71 84 Z"
              fill={theme.primary}
              fillOpacity="0.82"
              stroke="#4A3737"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* 盒正面 */}
            <rect
              x="24"
              y="24"
              width="47"
              height="60"
              rx="3"
              fill={theme.bodyBg}
              stroke="#4A3737"
              strokeWidth="1.3"
            />
            {/* 品牌色條紋 */}
            <rect x="24" y="24" width="47" height="18" fill={`url(#grad-header-${product.id})`} rx="2" />
            <text
              x="47.5"
              y="36"
              textAnchor="middle"
              fill={theme.headerText}
              fontSize="6"
              fontWeight="900"
              letterSpacing="0.4"
              fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
            >
              {theme.brandName}
            </text>

            {/* 盒面裝飾與提把線條 */}
            <rect x="40" y="19.5" width="16" height="3" rx="1.5" fill="#FFFFFF" opacity="0.7" />

            {/* 幾何貓印記 */}
            <path
              d="M41 53 L42 47.5 L45 50.5 L50 50.5 L53 47.5 L54 53 A6.5 6.5 0 1 1 41 53 Z"
              fill={theme.accentBg}
              stroke="#4A3737"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* 規格標章徽章 */}
            <rect
              x="30"
              y="68"
              width="35"
              height="10"
              rx="5"
              fill={theme.accentBg}
              stroke={theme.tagColor}
              strokeWidth="0.8"
            />
            <text
              x="47.5"
              y="75.2"
              textAnchor="middle"
              fill={theme.accentText}
              fontSize="5.8"
              fontWeight="800"
              fontFamily="IBM Plex Mono, monospace"
            >
              {theme.badgeCode}
            </text>
          </g>
        ) : (
          // ================= 立體立式包裝袋 =================
          <g filter={`url(#shadow-${product.id})`}>
            {/* 主袋體 */}
            <path
              d="M26 16 Q50 14 74 16 L78 84 Q50 87 22 84 Z"
              fill={`url(#grad-bag-${product.id})`}
              stroke="#4A3737"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* 封口微摺痕 */}
            <line x1="26" y1="21" x2="74" y2="21" stroke="#F3E3DF" strokeWidth="1" />
            <line x1="49" y1="15" x2="51" y2="15" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />

            {/* 頂部品牌色帶 */}
            <path d="M26 23 L74 23 L75 39 L25 39 Z" fill={`url(#grad-header-${product.id})`} />
            <text
              x="50"
              y="33.5"
              textAnchor="middle"
              fill={theme.headerText}
              fontSize="6"
              fontWeight="900"
              letterSpacing="0.4"
              fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
            >
              {theme.brandName}
            </text>

            {/* 精緻副標 */}
            {theme.subLabel && (
              <text
                x="50"
                y="37.5"
                textAnchor="middle"
                fill={theme.headerText}
                opacity="0.85"
                fontSize="3.4"
                fontWeight="700"
                letterSpacing="0.5"
                fontFamily="system-ui, sans-serif"
              >
                {theme.subLabel}
              </text>
            )}

            {/* 裝飾線 */}
            {theme.stripeColor && (
              <rect x="25" y="39" width="50" height="2" fill={theme.stripeColor} />
            )}

            {/* 幾何貓印記 */}
            <path
              d="M43 54 L44 48 L47 51.5 L53 51.5 L56 48 L57 54 A7 7 0 1 1 43 54 Z"
              fill={theme.accentBg}
              stroke="#4A3737"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <circle cx="47" cy="55.5" r="0.8" fill="#4A3737" />
            <circle cx="53" cy="55.5" r="0.8" fill="#4A3737" />

            {/* 規格標章徽章 */}
            <rect
              x="30"
              y="68"
              width="40"
              height="10"
              rx="5"
              fill={theme.accentBg}
              stroke={theme.tagColor}
              strokeWidth="0.8"
            />
            <text
              x="50"
              y="75.2"
              textAnchor="middle"
              fill={theme.accentText}
              fontSize="5.8"
              fontWeight="800"
              fontFamily="IBM Plex Mono, monospace"
            >
              {theme.badgeCode}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export function ReviewPhotoCard({ photo }: { photo: ReviewPhoto }) {
  return (
    <div className="rev-photo">
      <div className="rev-photo-art">
        {photo.kind === 'dust' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#201A1A" />
            <polygon points="14,50 210,18 210,92 14,60" fill="#FFF6E5" fillOpacity="0.16" />
            <rect x="4" y="46" width="10" height="18" rx="2" fill="none" stroke="#D6C2C2" strokeWidth="1.5" />
            <ellipse cx="118" cy="72" rx="40" ry="13" fill="#3D2E2E" stroke="#8C7373" strokeWidth="1.2" />
            <circle cx="72" cy="54" r="1.3" fill="#FFF6E5" />
            <circle cx="86" cy="61" r="1" fill="#F3E3DF" />
            <circle cx="140" cy="68" r="1.1" fill="#FFF6E5" />
            <text x="14" y="22" fill="#F3E3DF" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="IBM Plex Mono, monospace">TEST 01 / 黑紙側光粉塵盲測</text>
            <text x="118" y="96" textAnchor="middle" fill="#E86F68" fontSize="8.5" fontWeight="700">落砂粉塵近乎零痕跡 · 呼吸道友善</text>
          </svg>
        )}
        {photo.kind === 'clump' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <path d="M28 74 L95 62 L175 62 L186 76 L38 76 Z" fill="none" stroke="#8C7373" strokeWidth="1.5" />
            <ellipse cx="115" cy="56" rx="32" ry="16" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="IBM Plex Mono, monospace">TEST 02 / 20ML 滴水快速結團實測</text>
            <text x="115" y="95" textAnchor="middle" fill="#3D2E2E" fontSize="9" fontWeight="700">3 秒吸水硬結團 · 鏟起不黏盆底不崩碎</text>
          </svg>
        )}
        {photo.kind === 'kibble' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <line x1="20" y1="86" x2="200" y2="86" stroke="#6E5252" strokeWidth="1.2" />
            {[20, 38, 56, 74, 92, 110, 128, 146, 164, 182, 200].map((x, idx) => (
              <g key={x}>
                <line x1={x} y1="81" x2={x} y2="89" stroke="#6E5252" strokeWidth="1" />
                {idx % 2 === 0 && <text x={x} y="100" textAnchor="middle" fill="#8C7373" fontSize="7.5" fontFamily="IBM Plex Mono, monospace">{idx * 2}mm</text>}
              </g>
            ))}
            <circle cx="65" cy="52" r="12" fill="#FCECEB" stroke="#E86F68" strokeWidth="1.5" />
            <circle cx="115" cy="52" r="11" fill="#FFF6E5" stroke="#D98A4E" strokeWidth="1.5" />
            <polygon points="165,38 179,63 151,63" fill="#FCECEB" stroke="#E86F68" strokeWidth="1.5" strokeLinejoin="round" />
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="IBM Plex Mono, monospace">SPEC / 飼料顆粒比例尺 (MM)</text>
          </svg>
        )}
        {photo.kind === 'pack' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <rect x="38" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <rect x="89" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <rect x="140" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <text x="59" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">1.5KG</text>
            <text x="110" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">1.5KG</text>
            <text x="161" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="IBM Plex Mono, monospace">1.5KG</text>
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="IBM Plex Mono, monospace">STORAGE / 真空分裝防潮保存紀錄</text>
          </svg>
        )}
      </div>
      <div className="rev-photo-meta">
        <b className="row" style={{ gap: 5 }}><CameraIcon size={13} /> {photo.label}</b>
        <span className="small muted">{photo.caption}</span>
      </div>
    </div>
  );
}
