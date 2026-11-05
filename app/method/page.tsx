import Disclaimer from '@/components/Disclaimer';
import { MIN_VERIFIED } from '@/lib/scoring';

export default function Method() {
  return (
    <main>
      <h1>評分與實測方法</h1>
      <p className="muted">公式全面公開。廠商無法付費影響排名，只以客觀數據與驗證回購說話。</p>

      <div
        style={{
          background: '#FFF9F6',
          border: '1.5px solid #F4DDD5',
          borderRadius: 20,
          padding: '16px 20px',
          margin: '16px 0 24px',
        }}
      >
        <b style={{ color: '#E86F68', display: 'block', marginBottom: 4 }}>
          【客觀公信力公告】全面暫停貓飼料評比
        </b>
        <p className="small" style={{ color: '#5A4644', margin: 0, lineHeight: 1.6 }}>
          為避免毛孩個體醫療、腸胃變因及法律爭議，在未取得具備法定公正檢驗（如 ISO/IEC 17025 認證第三方實驗室檢驗成分）前，本平台全面暫停所有貓飼料評比與導購，專注於無醫療爭議之<b>居家貓砂實測評鑑與智慧推薦</b>。
        </p>
      </div>

      <h2>貓砂標準實測維度</h2>
      <table><tbody>
        <tr><td>低粉塵</td><td>在深黑卡紙上定距倒砂，強光側拍灰塵落點與懸浮量，1–5 分</td></tr>
        <tr><td>結團力</td><td>定量注入 20ml 水分，靜置 60 秒夾取並施壓測試碎裂度，1–5 分</td></tr>
        <tr><td>防帶砂</td><td>記錄出盆後落砂量與周圍沙漠化程度，1–5 分</td></tr>
        <tr><td>除臭力</td><td>第 3 天與第 7 天使用氨氣感測與居家盲測雙重驗證，1–5 分</td></tr>
        <tr><td>貓咪接受度</td><td>是否有排斥、憋尿或砂盆外排泄異常行為</td></tr>
      </tbody></table>

      <h2>一包能用幾天（耗材成本）</h2>
      <p>同一個家庭連續兩次購買同一款貓砂，視為一個標準使用週期；間隔超過 90 天不列入。每款商品取所有驗證家庭的中位數。</p>
      <div className="formula">每貓每天成本 = 一包實購價格 ÷ (使用天數 × 貓數)</div>

      <h2>排行綜合分數（貝氏平滑）</h2>
      <p>採用貝氏平均避免新商品少數灌票衝上第一；彙整各大社群真實評價權重。</p>
      <div className="formula">分數 = (10 × 品類平均 + Σ 權重 × 分數) ÷ (10 + Σ 權重)</div>
      <table><tbody>
        <tr><th>資料來源</th><th>權重</th></tr>
        <tr><td>全網真實社群／電商評價大數據</td><td className="num">1.0</td></tr>
        <tr><td>飼主自主提交標準實測</td><td className="num">1.0</td></tr>
        <tr><td>合作試用品（一律強制標示）</td><td className="num">0.5</td></tr>
      </tbody></table>
      <table><tbody>
        <tr><th>貓砂綜合評分權重</th><th>佔比</th></tr>
        <tr><td>真實回購率</td><td className="num">30%</td></tr>
        <tr><td>每貓每日耗材成本（愈低愈好）</td><td className="num">25%</td></tr>
        <tr><td>低粉塵表現（愈低愈好）</td><td className="num">20%</td></tr>
        <tr><td>長效除臭力</td><td className="num">15%</td></tr>
        <tr><td>貓咪接受度</td><td className="num">10%</td></tr>
      </tbody></table>
      <p className="small muted">進榜門檻：至少累積滿 {MIN_VERIFIED} 筆真實社群評價反饋。本站不強迫使用者上傳發票憑證，杜絕繁瑣步驟，專注呈現最客觀大數據。</p>

      <h2>點數與防弊揭露</h2>
      <p>點數獎勵僅依任務完成度發放，與評分高低無關。任何合作試用品皆由系統強制加上「試用」標籤。</p>
      <Disclaimer food={false} />
    </main>
  );
}
