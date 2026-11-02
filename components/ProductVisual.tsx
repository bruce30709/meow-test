import type { Product, ReviewPhoto } from '@/lib/types';

export function ProductPackThumb({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) {
  const color = product.accent_color ?? (product.category === 'litter' ? '#0D6E52' : '#B85D19');
  const dim = size === 'lg' ? 112 : size === 'md' ? 76 : 54;
  const isBox = product.id === 'everclean-blue' || product.id === 'arm-hammer-slide';
  const brandShort =
    product.image_svg === 'royal' ? 'ROYAL CANIN' :
    product.image_svg === 'orijen' ? 'ORIJEN' :
    product.image_svg === 'nutram' ? 'nutram' :
    product.image_svg === 'acana' ? 'ACANA' :
    product.image_svg === 'farmina' ? 'Farmina N&D' :
    product.image_svg === 'everclean' ? 'Ever Clean' :
    product.image_svg === 'armhammer' ? 'ARM & HAMMER' :
    product.image_svg === 'pidan' ? 'pidan' :
    product.image_svg === 'odout' ? 'ODOUT 臭味滾' :
    product.image_svg === 'dogcatstar' ? '汪喵星球' :
    product.image_svg === 'ladyn' ? 'Lady N' : product.brand.slice(0, 8);

  const badge =
    product.id === 'royal-in27' ? 'IN 27' :
    product.id === 'royal-lp34' ? 'S/O LP34' :
    product.id === 'orijen-chicken' ? '85% MEAT' :
    product.id === 'nutram-t22' ? 'T22 無穀' :
    product.id === 'acana-indoor' ? 'INDOOR' :
    product.id === 'farmina-nd' ? 'GC-1' :
    product.id === 'everclean-blue' ? '25 LB' :
    product.id === 'arm-hammer-slide' ? '40 LB' :
    product.id === 'pidan-mixed' ? '70/30 混合' :
    product.id === 'odout-tofu' ? '1.5mm 無香' :
    product.id === 'dogcatstar-cassava' ? '純木薯' :
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
          <linearGradient id={`bg-${product.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.14" />
            <stop offset="100%" stopColor={color} stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={`pk-${product.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f4f1ea" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="96" height="96" rx="18" fill={`url(#bg-${product.id})`} stroke={color} strokeOpacity="0.22" strokeWidth="1.5" />

        {isBox ? (
          // 美式紙盒裝礦砂（藍鑽 / 鐵鎚）
          <g>
            <path d="M22 24 L30 16 L82 16 L74 24 Z" fill={color} opacity="0.75" />
            <path d="M74 24 L82 16 L82 78 L74 86 Z" fill={color} opacity="0.9" />
            <rect x="22" y="24" width="52" height="62" rx="4" fill={`url(#pk-${product.id})`} stroke={color} strokeWidth="2" />
            <rect x="22" y="24" width="52" height="22" rx="3" fill={color} />
            <text x="48" y="38" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="800" fontFamily="system-ui, sans-serif">{brandShort}</text>
            <circle cx="48" cy="58" r="11" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
            <text x="48" y="61" textAnchor="middle" fill={color} fontSize="7.5" fontWeight="800" fontFamily="monospace">{badge}</text>
            <rect x="28" y="74" width="40" height="6" rx="3" fill={color} fillOpacity="0.85" />
          </g>
        ) : (
          // 立體夾鏈袋裝（皇家 / 歐睿健 / 紐頓 / 豆腐砂）
          <g>
            <path d="M23 16 Q50 13 77 16 L80 84 Q50 88 20 84 Z" fill={`url(#pk-${product.id})`} stroke={color} strokeWidth="2" />
            <path d="M24 22 L76 22" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="3 2" />
            {/* 品牌橫幅 */}
            <rect x="23" y="27" width="54" height="17" rx="2" fill={color} />
            <text x="50" y="38" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="800" fontFamily="system-ui, sans-serif">{brandShort}</text>
            {/* 貓咪剪影與徽章 */}
            <circle cx="50" cy="59" r="11" fill={color} fillOpacity="0.12" />
            <path d="M44 56 L45 50 L48 54 L52 54 L55 50 L56 56 A6 6 0 1 1 44 56 Z" fill={color} opacity="0.85" />
            <rect x="27" y="72" width="46" height="10" rx="5" fill={color} fillOpacity="0.14" />
            <text x="50" y="79.5" textAnchor="middle" fill={color} fontSize="7.2" fontWeight="800" fontFamily="monospace">{badge}</text>
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
                <stop offset="0%" stopColor="#fde68a" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#fde68a" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <rect width="220" height="110" rx="8" fill="#161b19" />
            {/* 手電筒側光光束 */}
            <polygon points="8,48 212,12 212,98 8,62" fill="url(#beam)" />
            <rect x="2" y="44" width="12" height="22" rx="3" fill="#94a3b8" />
            {/* 貓砂堆與微量粉塵點 */}
            <ellipse cx="118" cy="72" rx="44" ry="16" fill="#d6d3c9" />
            <ellipse cx="118" cy="69" rx="38" ry="12" fill="#e7e5dc" />
            <circle cx="72" cy="54" r="1.3" fill="#fef08a" opacity="0.8" />
            <circle cx="85" cy="62" r="1" fill="#fef08a" opacity="0.7" />
            <circle cx="158" cy="58" r="1.2" fill="#fef08a" opacity="0.7" />
            <text x="12" y="20" fill="#a7f3d0" fontSize="9.5" fontFamily="monospace">BLACK-PAPER DUST TEST</text>
          </svg>
        )}
        {photo.kind === 'clump' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#1e293b" />
            {/* 貓砂鏟與結團塊 */}
            <path d="M20 75 L95 62 L175 62 L190 78 L35 78 Z" fill="#64748b" opacity="0.6" />
            <ellipse cx="115" cy="56" rx="36" ry="20" fill="#cbd5e1" stroke="#f8fafc" strokeWidth="1.5" />
            <path d="M92 52 Q115 42 138 52" stroke="#94a3b8" strokeWidth="2" fill="none" />
            <text x="12" y="20" fill="#38bdf8" fontSize="9.5" fontFamily="monospace">20ml WATER · 60s CLUMP</text>
            <text x="115" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="700">結團完整不散裂</text>
          </svg>
        )}
        {photo.kind === 'kibble' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#292524" />
            {/* 比例尺格線 */}
            <line x1="20" y1="88" x2="200" y2="88" stroke="#a8a29e" strokeWidth="1.5" />
            {[20, 38, 56, 74, 92, 110, 128, 146, 164, 182, 200].map((x, idx) => (
              <g key={x}>
                <line x1={x} y1="83" x2={x} y2="92" stroke="#a8a29e" strokeWidth="1.2" />
                {idx % 2 === 0 && <text x={x} y="102" textAnchor="middle" fill="#d6d3d1" fontSize="8" fontFamily="monospace">{idx * 2}mm</text>}
              </g>
            ))}
            {/* 飼料顆粒 */}
            <circle cx="65" cy="52" r="14" fill="#78350f" stroke="#b45309" strokeWidth="2" />
            <circle cx="115" cy="52" r="13" fill="#713f12" stroke="#a16207" strokeWidth="2" />
            <polygon points="165,36 181,64 149,64" fill="#7c2d12" stroke="#c2410c" strokeWidth="2" strokeLinejoin="round" />
            <text x="12" y="20" fill="#fcd34d" fontSize="9.5" fontFamily="monospace">KIBBLE SIZE &amp; TEXTURE</text>
          </svg>
        )}
        {photo.kind === 'pack' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" rx="8" fill="#1f2937" />
            <rect x="36" y="28" width="44" height="58" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="88" y="28" width="44" height="58" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="140" y="28" width="44" height="58" rx="5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1.5" />
            <text x="58" y="60" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="110" y="60" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="162" y="60" textAnchor="middle" fill="#374151" fontSize="9" fontWeight="700">1.5kg</text>
            <text x="12" y="20" fill="#6ee7b7" fontSize="9.5" fontFamily="monospace">VACUUM SEAL STORAGE</text>
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
