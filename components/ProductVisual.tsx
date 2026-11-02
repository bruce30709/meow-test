import type { Product, ReviewPhoto } from '@/lib/types';
import { CameraIcon } from './Icons';

export function ProductPackThumb({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 104 : size === 'md' ? 76 : 52;
  const isBox = product.id === 'everclean-blue' || product.id === 'arm-hammer-slide';

  const brandShort =
    product.image_svg === 'royal' ? 'ROYAL CANIN' :
    product.image_svg === 'orijen' ? 'ORIJEN' :
    product.image_svg === 'nutram' ? 'NUTRAM' :
    product.image_svg === 'acana' ? 'ACANA' :
    product.image_svg === 'farmina' ? 'FARMINA' :
    product.image_svg === 'everclean' ? 'EVER CLEAN' :
    product.image_svg === 'armhammer' ? 'ARM & HAMMER' :
    product.image_svg === 'pidan' ? 'pidan' :
    product.image_svg === 'odout' ? 'ODOUT' :
    product.image_svg === 'dogcatstar' ? 'DOGCATSTAR' :
    product.image_svg === 'ladyn' ? 'LADY N' : product.brand.slice(0, 8);

  const badge =
    product.id === 'royal-in27' ? 'IN 27' :
    product.id === 'royal-lp34' ? 'S/O LP34' :
    product.id === 'orijen-chicken' ? '85% MEAT' :
    product.id === 'nutram-t22' ? 'T22' :
    product.id === 'acana-indoor' ? 'INDOOR' :
    product.id === 'farmina-nd' ? 'N&D GC-1' :
    product.id === 'everclean-blue' ? '25 LB' :
    product.id === 'arm-hammer-slide' ? '40 LB' :
    product.id === 'pidan-mixed' ? 'MIXED' :
    product.id === 'odout-tofu' ? '1.5MM' :
    product.id === 'dogcatstar-cassava' ? 'CASSAVA' :
    product.id === 'lady-n-tofu' ? 'TOFU' :
    product.pack_weight_kg ? `${product.pack_weight_kg}KG` : '';

  return (
    <div
      className={`pack-thumb pack-${size}`}
      style={{ width: dim, height: dim, flexShrink: 0 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        {/* 溫柔淡粉圓角底框 */}
        <rect x="2" y="2" width="96" height="96" rx="20" fill="#FDF6F4" stroke="#F3E3DF" strokeWidth="1.5" />
        <ellipse cx="50" cy="85" rx="24" ry="3" fill="#8C7373" opacity="0.12" />

        {isBox ? (
          // 手繪感柔色立體盒裝
          <g>
            <path d="M25 25 L32 18 L79 18 L72 25 Z" fill="#F9DCDA" stroke="#6E5252" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M72 25 L79 18 L79 77 L72 84 Z" fill="#F3CCC8" stroke="#6E5252" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="25" y="25" width="47" height="59" rx="3" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <rect x="25" y="25" width="47" height="16" rx="2" fill="#E86F68" />
            <text x="48.5" y="35.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.2" fontWeight="800" letterSpacing="0.4" fontFamily="system-ui, sans-serif">{brandShort}</text>
            {/* 手繪線條貓臉 */}
            <path d="M42 54 L43 48 L46 51.5 L51 51.5 L54 48 L55 54 A6.5 6.5 0 1 1 42 54 Z" fill="#FCECEB" stroke="#6E5252" strokeWidth="1.4" strokeLinejoin="round" />
            <rect x="31" y="68" width="35" height="9.5" rx="4.5" fill="#FDF6F4" stroke="#F3E3DF" strokeWidth="1" />
            <text x="48.5" y="74.8" textAnchor="middle" fill="#6E5252" fontSize="6.2" fontWeight="800" fontFamily="ui-monospace, monospace">{badge}</text>
          </g>
        ) : (
          // 手繪感柔色立體包裝袋
          <g>
            <path d="M26 16 Q50 14 74 16 L77 83 Q50 86 23 83 Z" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" strokeLinejoin="round" />
            <line x1="27" y1="21" x2="73" y2="21" stroke="#F3E3DF" strokeWidth="1.2" />
            <rect x="26" y="25" width="48" height="15" fill="#E86F68" />
            <text x="50" y="34.5" textAnchor="middle" fill="#FFFFFF" fontSize="6.2" fontWeight="800" letterSpacing="0.5" fontFamily="system-ui, sans-serif">{brandShort}</text>
            {/* 手繪線條貓臉 */}
            <path d="M43.5 54 L44.5 48 L47.5 51.5 L52.5 51.5 L55.5 48 L56.5 54 A6.5 6.5 0 1 1 43.5 54 Z" fill="#FCECEB" stroke="#6E5252" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="47.5" cy="55" r="0.8" fill="#6E5252" />
            <circle cx="52.5" cy="55" r="0.8" fill="#6E5252" />
            <rect x="31" y="68" width="38" height="9.5" rx="4.5" fill="#FDF6F4" stroke="#F3E3DF" strokeWidth="1" />
            <text x="50" y="74.8" textAnchor="middle" fill="#6E5252" fontSize="6.3" fontWeight="800" fontFamily="ui-monospace, monospace">{badge}</text>
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
            <rect width="220" height="110" fill="#2B2323" />
            <polygon points="14,50 210,18 210,92 14,60" fill="#FFF6E5" fillOpacity="0.18" />
            <rect x="4" y="46" width="10" height="18" rx="2" fill="none" stroke="#D6C2C2" strokeWidth="1.5" />
            <ellipse cx="118" cy="72" rx="40" ry="13" fill="#4A3B3B" stroke="#A68E8E" strokeWidth="1.2" />
            <circle cx="72" cy="54" r="1.3" fill="#FFF6E5" />
            <circle cx="86" cy="61" r="1" fill="#F3E3DF" />
            <text x="14" y="22" fill="#F3E3DF" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="ui-monospace, monospace">TEST 01 / 黑紙側光粉塵測試</text>
          </svg>
        )}
        {photo.kind === 'clump' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <path d="M28 74 L95 62 L175 62 L186 76 L38 76 Z" fill="none" stroke="#8C7373" strokeWidth="1.5" />
            <ellipse cx="115" cy="56" rx="32" ry="16" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="ui-monospace, monospace">TEST 02 / 20ML 滴水結團測試</text>
            <text x="115" y="95" textAnchor="middle" fill="#3D2E2E" fontSize="9" fontWeight="700">結團緊實 · 鏟起邊緣不崩解</text>
          </svg>
        )}
        {photo.kind === 'kibble' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <line x1="20" y1="86" x2="200" y2="86" stroke="#6E5252" strokeWidth="1.2" />
            {[20, 38, 56, 74, 92, 110, 128, 146, 164, 182, 200].map((x, idx) => (
              <g key={x}>
                <line x1={x} y1="81" x2={x} y2="89" stroke="#6E5252" strokeWidth="1" />
                {idx % 2 === 0 && <text x={x} y="100" textAnchor="middle" fill="#8C7373" fontSize="7.5" fontFamily="ui-monospace, monospace">{idx * 2}mm</text>}
              </g>
            ))}
            <circle cx="65" cy="52" r="12" fill="#FCECEB" stroke="#E86F68" strokeWidth="1.5" />
            <circle cx="115" cy="52" r="11" fill="#FFF6E5" stroke="#D98A4E" strokeWidth="1.5" />
            <polygon points="165,38 179,63 151,63" fill="#FCECEB" stroke="#E86F68" strokeWidth="1.5" strokeLinejoin="round" />
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="ui-monospace, monospace">SPEC / 飼料顆粒比例尺 (MM)</text>
          </svg>
        )}
        {photo.kind === 'pack' && (
          <svg viewBox="0 0 220 110" width="100%" height="100%">
            <rect width="220" height="110" fill="#FDF6F4" />
            <rect x="38" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <rect x="89" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <rect x="140" y="32" width="42" height="54" rx="5" fill="#FFFFFF" stroke="#6E5252" strokeWidth="1.5" />
            <text x="59" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="ui-monospace, monospace">1.5KG</text>
            <text x="110" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="ui-monospace, monospace">1.5KG</text>
            <text x="161" y="62" textAnchor="middle" fill="#6E5252" fontSize="8.5" fontWeight="700" fontFamily="ui-monospace, monospace">1.5KG</text>
            <text x="14" y="22" fill="#8C7373" fontSize="8.5" fontWeight="700" letterSpacing="0.6" fontFamily="ui-monospace, monospace">STORAGE / 真空分裝保存</text>
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
