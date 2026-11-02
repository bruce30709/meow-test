import Disclaimer from '@/components/Disclaimer';
import { MIN_VERIFIED } from '@/lib/scoring';

export default function Method() {
  return (
    <main>
      <h1>實測方法</h1>
      <p className="muted">所有公式公開。品牌不能付費改變排名，只能公開回覆評論。</p>

      <h2>標準實測（貓砂）</h2>
      <table><tbody>
        <tr><td>粉塵</td><td>在黑紙上倒一杯砂，手電筒側光拍照，1–5 分</td></tr>
        <tr><td>結團</td><td>滴 20 ml 水，等 1 分鐘夾起來，1–5 分</td></tr>
        <tr><td>帶砂</td><td>一週後砂盆外的砂量，1–5 分</td></tr>
        <tr><td>除臭</td><td>第 3 天和第 7 天各評一次，1–5 分</td></tr>
        <tr><td>貓接受度</td><td>有沒有在砂盆外大小便</td></tr>
      </tbody></table>

      <h2>飼料：只記錄飼主看得到的現象</h2>
      <p>適口性、便便評分（1 硬–7 水狀）、換糧一週內軟便、每週嘔吐、毛髮，以及「是否為獸醫建議」。平台不計算「健康分數」，處方飼料不列入排行。</p>

      <h2>一包能用幾天</h2>
      <p>同一個家庭連續兩次購買同一款，就是一個使用週期；間隔超過 90 天的不計。每款商品取所有週期的中位數。若該款商品還沒有連續兩次的購買紀錄，會暫時採用實測時飼主自填的「一包用幾天」（頁面上會標註「自填估計」）。</p>
      <div className="formula">每貓每天成本 = 一包價格 ÷ (使用天數 × 貓數)</div>

      <h2>排行分數</h2>
      <p>使用貝氏平均，資料少的商品會被拉向品類平均，避免只有幾筆資料就衝上第一。每個家庭對同一款商品只算一票（完成第 30 天追蹤後會更新同一票，不會重複加權）。</p>
      <div className="formula">分數 = (10 × 品類平均 + Σ 權重 × 分數) ÷ (10 + Σ 權重)</div>
      <table><tbody>
        <tr><th>資料來源</th><th>權重</th></tr>
        <tr><td>有購買證明</td><td className="num">1.0</td></tr>
        <tr><td>試用包（一律標示）</td><td className="num">0.5</td></tr>
        <tr><td>沒有購買證明</td><td className="num">0.4</td></tr>
      </tbody></table>
      <table><tbody>
        <tr><th>貓砂綜合分數</th><th>比重</th></tr>
        <tr><td>回購率</td><td className="num">30%</td></tr>
        <tr><td>每貓每天成本（越低越好）</td><td className="num">25%</td></tr>
        <tr><td>粉塵（越低越好）</td><td className="num">20%</td></tr>
        <tr><td>除臭</td><td className="num">15%</td></tr>
        <tr><td>貓接受度</td><td className="num">10%</td></tr>
      </tbody></table>
      <table><tbody>
        <tr><th>飼料綜合分數</th><th>比重</th></tr>
        <tr><td>回購率</td><td className="num">40%</td></tr>
        <tr><td>適口性</td><td className="num">35%</td></tr>
        <tr><td>換糧軟便比例（越低越好）</td><td className="num">15%</td></tr>
        <tr><td>每週嘔吐比例（越低越好）</td><td className="num">10%</td></tr>
      </tbody></table>
      <p className="small muted">進榜門檻：至少 {MIN_VERIFIED} 筆購買驗證。「獸醫建議比例」是飼主自行回報，只顯示、不計分。</p>

      <h2>點數與揭露</h2>
      <p>點數只看完成度（上傳訂單、完成實測、30 天追蹤），與評分高低無關。拿過試用品的評論會自動標示「試用」，導購連結會標示含分潤。</p>
      <Disclaimer food />
    </main>
  );
}
