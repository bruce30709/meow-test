import type { Product, ReviewPhoto } from '@/lib/types';

export function ProductPackThumb({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) {
  const color = product.accent_color ?? (product.category === 'litter' ? '#3B82F6' : '#E15B45');
  const dim = size === 'lg' ? 108 : size === 'md' ? 76 : 52;
  const isBox = product.id === 'everclean-blue' || product.id === 'arm-hammer-slide';

  const brandShort =
    product.image_svg === 'royal' ? 'ROYAL CANIN' :
    product.image_svg === 'orijen' ? 'ORIJEN' :
    product.image_svg === 'nutram' ? 'NUTRAM' :
    product.image_svg === 'acana' ? 'ACANA' :
    product.image_svg === 'farmina' ? 'FARMINA' :
    product.image_svg === 'everclean' ? 'EVER CLEAN' :
    product.image_svg === 'armhammer' ? 'ARM & HAMMER' :
    product.image_svg === 'pidan' ? 'PIDAN' :
    product.image_svg === 'odout' ? '臭味滾' :
    product.image_svg === 'dogcatstar' ? '汪喵星球' :
    product.image_svg === 'ladyn' ? '超凝小姐' : product.brand.slice(0, 8);

  const badge =
    product.id === 'royal-in27' ? 'IN 27' :
    product.id === 'royal-lp34' ? 'S/O LP34' :
    product.id === 'orijen-chicken' ? '85% 鮮雞' :
    product.id === 'nutram-t22' ? 'T22 無穀' :
    product.id === 'acana-indoor' ? '室內控卡' :
    product.id === 'farmina-nd' ? 'N&D 石榴' :
    product.id === 'everclean-blue' ? '25 LB' :
    product.id === 'arm-hammer-slide' ? '40 LB' :
    product.id === 'pidan-mixed' ? '經典混合' :
    product.id === 'odout-tofu' ? '1.5mm' :
    product.id === 'dogcatstar-cassava' ? '木薯混合' :
    product.id === 'lady-n-tofu' ? '益生菌' :
    product.pack_weight_kg ? `${product.pack_weight_kg}kg` : '';

  return (
    <div
      className={`pack-thumb pack-${size}`}
      style={{ width: dim, height: dim, flexShrink: 0 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id={`studio-${product.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id={`bag-${product.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
          <filter id={`drop-${product.id}`} x="-10%" y="-10%" width="120%" height="125%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* 乾淨攝影棚圓角底座 */}
        <rect x="2" y="2" width="96" height="96" rx="20" fill={`url(#studio-${product.id})`} stroke="#E2E8F0" strokeWidth="1.2" />
        <ellipse cx="50" cy="86" rx="26" ry="3.5" fill="#0F172A" opacity="0.07" />

        {isBox ? (
          // 質感立體盒裝（藍鑽 / 鐵鎚）
          <g filter={`url(#drop-${product.id})`}>
            <path d="M24 24 L31 18 L79 18 L72 24 Z" fill={color} opacity="0.85" />
            <path d="M72 24 L79 18 L79 78 L72 84 Z" fill="#CBD5E1" />
            <rect x="24" y="24" width="48" height="60" rx="4" fill={`url(#bag-${product.id})`} stroke="#CBD5E1" strokeWidth="1.2" />
            <rect x="24" y="24" width="48" height="19" rx="3" fill={color} />
            <text x="48" y="36" textAnchor="middle" fill="#FFFFFF" fontSize="6.8" fontWeight="800" letterSpacing="0.3" fontFamily="system-ui, sans-serif">{brandShort}</text>
            <rect x="30" y="50" width="36" height="14" rx="4" fill={color} fillOpacity="0.1" />
            <text x="48" y="59.5" textAnchor="middle" fill={color} fontSize="7.5" fontWeight="800" fontFamily="system-ui, sans-serif">{badge}</text>
            <line x1="32" y1="72" x2="64" y2="72" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="77" x2="60" y2="77" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          // 質感立體包裝袋
          <g filter={`url(#drop-${product.id})`}>
            <path d="M25 16 Q50 14 75 16 L78 83 Q50 86 22 83 Z" fill={`url(#bag-${product.id})`} stroke="#CBD5E1" strokeWidth="1.2" />
            <line x1="27" y1="21" x2="73" y2="21" stroke="#E2E8F0" strokeWidth="1.5" />
            <rect x="25" y="26" width="50" height="16" fill={color} />
            <text x="50" y="36.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.8" fontWeight="800" letterSpacing="0.4" fontFamily="system-ui, sans-serif">{brandShort}</text>
            <circle cx="50" cy="56" r="10" fill={color} fillOpacity="0.1" />
            <path d="M45 54 L46 49 L48.5 52 L51.5 52 L54 49 L55 54 A5 5 0 1 1 45 54 Z" fill={color} opacity="0.85" />
            <rect x="29" y="70" width="42" height="9.5" rx="4.5" fill="#F1F5F9" />
            <text x="50" y="76.8" textAnchor="middle" fill="#334155" fontSize="6.8" fontWeight="700" fontFamily="system-ui, sans-serif">{badge}</text>
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
            <defs>
              <linearGradient id="beam" x1="0" y1="0.5" x2="1" y2="0.5">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <rect width="220" height="110" rx="8" fill="#1E293B" />
            <polygon points="10,48 210,16 210,94 10,62" fill="url(#beam)" />
            <rect x="2" y="45" width="12" height="20" rx="3" fill="#94A3B8" />
            <ellipse cx="118" cy="72" rx="42" ry="15" fill="#CBD5E1" />
            <ellipse cx="118" cy="69" rx="36" ry="11" fill="#E2E8F0" />
            <circle cx="72" cy="54" r="1.3" fill="#FEF08A" opacity="0.8" />
            <circle cx="85" cy="62" r="1" fill="#FEF08A" opacity="0.7" />
            <text x="14" y="22" fill="#E2E8F0" fontSize="9" fontWeight="700" fontFamily="monospace">黑紙側光落塵實測</text>
          </svg>
        )}
        {photo.kind === 'clump' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#334155" />
            <path d="M24 74 L95 62 L175 62 L188 76 L36 76 Z" fill="#94A3B8" opacity="0.5" />
            <ellipse cx="115" cy="56" rx="34" ry="18" fill="#F1F5F9" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="14" y="22" fill="#BAE6FD" fontSize="9" fontWeight="700" fontFamily="monospace">20ml 定量滴水結塊測試</text>
            <text x="115" y="95" textAnchor="middle" fill="#F8FAFC" fontSize="9.5" fontWeight="600">結團緊實・鏟起不崩解</text>
          </svg>
        )}
        {photo.kind === 'kibble' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#F8FAFC" />
            <line x1="20" y1="86" x2="200" y2="86" stroke="#94A3B8" strokeWidth="1.5" />
            {[20, 38, 56, 74, 92, 110, 128, 146, 164, 182, 200].map((x, idx) => (
              <g key={x}>
                <line x1={x} y1="81" x2={x} y2="90" stroke="#94A3B8" strokeWidth="1.2" />
                {idx % 2 === 0 && <text x={x} y="101" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="monospace">{idx * 2}mm</text>}
              </g>
            ))}
            <circle cx="65" cy="52" r="13" fill="#9A3412" opacity="0.85" />
            <circle cx="115" cy="52" r="12" fill="#78350F" opacity="0.85" />
            <polygon points="165,37 180,63 150,63" fill="#B45309" opacity="0.9" strokeLinejoin="round" />
            <text x="14" y="22" fill="#475569" fontSize="9" fontWeight="700" fontFamily="monospace">飼料顆粒大小＆形狀比例尺</text>
          </svg>
        )}
        {photo.kind === 'pack' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#F1F5F9" />
            <rect x="36" y="30" width="44" height="56" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="88" y="30" width="44" height="56" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <rect x="140" y="30" width="44" height="56" rx="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="58" y="61" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="110" y="61" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="162" y="61" textAnchor="middle" fill="#334155" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="14" y="21" fill="#475569" fontSize="9" fontWeight="700" fontFamily="monospace">真空分裝防潮保存</text>
          </svg>
        )}
      </div>
      <div className="rev-photo-meta">
        <b>📷 {photo.label}</b>
        <span className="small muted">{photo.caption}</span>
      </div>
    </div>
  );
}
