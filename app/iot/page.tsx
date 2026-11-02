'use client';
import Link from 'next/link';
import { useState } from 'react';
import { SensorIcon, VerifiedIcon } from '@/components/Icons';

type SimMode = 'normal' | 'flutd' | 'switch_litter';

export default function PhaseTwoIoTPage() {
  const [mode, setMode] = useState<SimMode>('normal');

  return (
    <main>
      <section className="hero">
        <div className="hero-badge">PHASE 02 ROADMAP · 第二階段硬體與數據閉環</div>
        <h1>加裝式「貓砂盆 ＆ 飲水機」智慧感測貼片</h1>
        <p className="hero-desc">
          第一階段用「喵實測平台」零硬體成本聚集最在乎貓咪排泄與飲食的精準飼主；第二階段再把「不用換掉原本砂盆、貼上去就能連 LINE」的感測貼片賣給這群鐵粉，並讓貼片數據自動回傳平台，形成別人抄不走的護城河。
        </p>
      </section>

      <section className="card">
        <h2>為什麼要分「第一階段 → 第二階段」？（完整商業閉環）</h2>
        <div className="metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
          <div className="metric" style={{ borderLeft: '3px solid var(--ink)' }}>
            <span className="tag">PHASE 01（第 1–3 個月）</span>
            <h3 style={{ marginTop: 8 }}>第一階段：喵實測排行平台</h3>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              <b>零硬體開模成本、免過 NCC、不碰醫療法規。</b><br />
              靠「每貓每天成本計算機」與「換糧軟便／貓砂粉塵真實排行」解決飼主挑砂換糧痛點。在沒找廠商談之前，靠<b>個人養貓記帳本＋信譽權重</b>累積首批 100–500 戶精準飼主，並以電商聯盟導購分潤驗證變現。
            </p>
          </div>

          <div className="metric" style={{ borderLeft: '3px solid var(--muted)' }}>
            <span className="tag plain">PHASE 1.5（第 3–6 個月）</span>
            <h3 style={{ marginTop: 8 }}>品牌盲測盒 ＆ 認證標章</h3>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              <b>等平台有流量與排名公信力後，品牌主動洽談。</b><br />
              新興貓砂／飼料品牌苦於大廠業配壟斷，可付費贊助「無印盲測體驗包」給高信譽實測官（Lv.2+）試用，或購買「喵實測 Top 3 認證標章」商用授權（仿德國 Stiftung Warentest 模式，不能買榜，只能買標章授權）。
            </p>
          </div>

          <div className="metric" style={{ borderLeft: '3px solid var(--ink)' }}>
            <span className="tag">PHASE 02（第 6 個月後）</span>
            <h3 style={{ marginTop: 8 }}>加裝式砂盆 ＆ 飲水貼片</h3>
            <p className="small muted" style={{ margin: '6px 0 0' }}>
              <b>直接賣給平台上已經高度信任你的飼主。</b><br />
              自動貓砂機要價 NT$15,000 且貓常不敢進；我們的<b>「加裝式震動感測貼片（NT$990–1,990）」</b>直接貼在原本的砂盆外側，自動記錄如廁與喝水次數、異常時 LINE 推播，並將<b>「換砂後的真實如廁頻率」</b>回傳喵實測。
            </p>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 className="row" style={{ gap: 8 }}><SensorIcon size={20} /> 第二階段互動預覽：貼片感測 × LINE 警報 × 數據回傳</h2>
            <p className="small muted" style={{ margin: 0 }}>點擊右側按鈕切換情境，檢視硬體貼片如何保護貓咪並強化「喵實測」排行榜：</p>
          </div>
          <div className="row seg">
            <button type="button" className={mode === 'normal' ? '' : 'ghost'} onClick={() => setMode('normal')}>
              日常監測模式
            </button>
            <button type="button" className={mode === 'flutd' ? '' : 'ghost'} onClick={() => setMode('flutd')}>
              模擬公貓尿閉警報
            </button>
            <button type="button" className={mode === 'switch_litter' ? '' : 'ghost'} onClick={() => setMode('switch_litter')}>
              模擬換新貓砂硬體實測
            </button>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 8 }}>
          <div className="card" style={{ background: 'var(--card-alt)' }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <b>砂盆外側貼片即時狀態（XIAO nRF52840 + ADXL362）</b>
              <span className="tag plain">CR2032 續航 8 個月</span>
            </div>

            <div style={{ background: '#141413', borderRadius: 10, padding: 16, color: '#F4F4F5' }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: '0.76rem', color: '#A1A1AA', fontFamily: 'var(--f-data)' }}>
                <span>DEVICE: MEOW-PATCH-01 (主臥豆腐砂盆)</span>
                <span style={{ color: mode === 'flutd' ? '#F87171' : '#E4E4E7' }}>ONLINE / BLE 5.0</span>
              </div>

              <svg viewBox="0 0 400 105" width="100%" height="105" style={{ marginTop: 8 }}>
                <line x1="0" y1="75" x2="400" y2="75" stroke="#3F3F46" strokeDasharray="4 4" />
                {mode === 'normal' && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      points="0,75 45,75 55,32 65,60 75,25 88,75 210,75 220,38 232,58 242,28 255,75 400,75"
                    />
                    <text x="52" y="20" fill="#E4E4E7" fontSize="9.5" fontFamily="monospace">08:15 如廁 (停留 42s · 正常埋砂)</text>
                    <text x="215" y="20" fill="#E4E4E7" fontSize="9.5" fontFamily="monospace">14:40 如廁 (停留 38s · 正常埋砂)</text>
                  </>
                )}
                {mode === 'flutd' && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#F87171"
                      strokeWidth="2"
                      points="0,75 30,75 38,20 46,75 75,75 83,18 92,75 125,75 133,22 142,75 175,75 184,16 194,75 230,75 240,15 252,75 400,75"
                    />
                    <text x="28" y="14" fill="#FCA5A5" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                      ALERT: 30 分鐘內連續進出砂盆 5 次（蹲超過 90 秒無刨砂動作）
                    </text>
                  </>
                )}
                {mode === 'switch_litter' && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      points="0,75 60,75 68,45 78,75 180,75 190,30 205,40 220,25 235,75 400,75"
                    />
                    <text x="48" y="28" fill="#E4E4E7" fontSize="9.5" fontFamily="monospace">換砂首日：進盆踏步 8 秒即適應 · 無憋尿</text>
                  </>
                )}
              </svg>

              <div className="metrics" style={{ marginTop: 8, gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div style={{ background: '#27272A', padding: '8px 10px', borderRadius: 6 }}>
                  <div className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: mode === 'flutd' ? '#F87171' : '#fff' }}>
                    {mode === 'flutd' ? '8 次 (異常)' : mode === 'switch_litter' ? '3.5 次/日' : '3.2 次/日'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>今日如廁次數（基準 3.1）</div>
                </div>
                <div style={{ background: '#27272A', padding: '8px 10px', borderRadius: 6 }}>
                  <div className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    {mode === 'flutd' ? '112 秒' : mode === 'switch_litter' ? '39 秒' : '41 秒'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>平均在盆停留秒數</div>
                </div>
                <div style={{ background: '#27272A', padding: '8px 10px', borderRadius: 6 }}>
                  <div className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    {mode === 'flutd' ? '1 次 (偏少)' : '6.4 次/日'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#A1A1AA' }}>飲水機感測喝水次數</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ background: 'var(--card-alt)' }}>
            <b>LINE 家庭群組推播 ＆ 喵實測平台自動連動</b>

            {mode === 'normal' && (
              <div className="card" style={{ borderLeft: '3px solid var(--ink)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tag">LINE 喵實測通知 · 21:00 日報</span>
                  <span className="small muted">剛剛</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                  <b>【雙喵家庭今日健康日報】</b><br />
                  ・主臥豆腐砂盆：今日共如廁 <b>6 次</b>（平均停留 41 秒，與過去 14 天基準一致）<br />
                  ・客廳飲水機：今日共偵測喝水 <b>12 次</b><br />
                  ・<b>耗材預測提醒</b>：目前使用的「臭味滾 1.5mm 豆腐砂」已開封第 18 天，預計還有 6 天用完。
                </p>
              </div>
            )}

            {mode === 'flutd' && (
              <div className="card" style={{ borderLeft: '3px solid var(--warn)', background: 'var(--warn-soft)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tag warn">LINE 緊急異常通知（公貓尿閉高風險警訊）</span>
                  <span className="small muted">1 分鐘前</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--warn)' }}>
                  <b>【砂盆異常頻繁進出提醒】</b><br />
                  您的砂盆在過去 <b>30 分鐘內被觸發了 5 次</b>，且單次蹲盆時間長達 112 秒、幾乎無刨砂震動。<br />
                  <b>重要提醒</b>：若家中有公貓（麻糬）出現頻繁蹲砂盆卻尿不出來、哀號或舔舐生殖器，可能是<b>急性下泌尿道阻塞（24–48 小時內有生命危險）</b>，請立即聯繫動物醫院就醫。
                </p>
              </div>
            )}

            {mode === 'switch_litter' && (
              <div className="card" style={{ borderLeft: '3px solid var(--ink)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span className="tag row" style={{ gap: 4 }}><VerifiedIcon size={12} /> 自動回傳「喵實測」排行榜</span>
                  <span className="small muted">第 7 天自動結算</span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                  <b>【硬體實測自動驗證完成】</b><br />
                  您於 7 天前更換為「<b>pidan 經典混合貓砂</b>」，貼片已自動完成 7 日對比：<br />
                  ・<b>換砂憋尿率</b>：0%（換砂首日即正常進盆 3.5 次）<br />
                  ・<b>踩砂嫌棄度</b>：極低（平均埋砂動作完整，停留 39 秒）<br />
                  系統已自動為該商品加上 <b>「砂盆貼片硬體實測驗證」</b> 標章，形成電商與論壇無法仿造的真實數據護城河。
                </p>
              </div>
            )}

            <div className="specs-bar" style={{ marginTop: 'auto' }}>
              <b>硬體規格與成本估算</b>：採用 Seeed XIAO nRF52840 ＋ ADXL362 超低功耗加速度計（待機 0.3uA），單顆 BOM 成本約 NT$180–250，終端售價 <b>NT$990（單貼片）／NT$1,690（砂盆＋飲水雙貼片組）</b>。
            </div>
          </div>
        </div>
      </section>

      <div className="row" style={{ justifyContent: 'space-between' }}>
        <Link href="/" className="btn-ghost">← 返回第一階段：喵實測排行榜</Link>
        <Link href="/me" className="btn-primary">前往「我的貓窩」查看二階段早鳥資格 →</Link>
      </div>
    </main>
  );
}
