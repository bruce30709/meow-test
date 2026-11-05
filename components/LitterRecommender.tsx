'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ProductPackThumb } from './ProductVisual';
import { VerifiedIcon, ArrowUpRightIcon } from './Icons';
import type { Product, Ranked } from '@/lib/types';

type Answers = {
  housing?: 'toilet' | 'trash';
  priority?: 'odor' | 'dust' | 'tracking';
  preference?: 'mineral' | 'plant' | 'budget';
};

type Recommendation = {
  product: Ranked;
  matchScore: number;
  reason: string;
  badge: string;
};

export default function LitterRecommender({ litters }: { litters: Ranked[] }) {
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Recommendation[] | null>(null);

  function selectAnswer<K extends keyof Answers>(key: K, val: Answers[K]) {
    const next = { ...answers, [key]: val };
    setAnswers(next);

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      calculateResult(next);
      setStep(4);
    }
  }

  function calculateResult(ans: Answers) {
    const scored = litters.map((p) => {
      let score = 70;
      let reasons: string[] = [];

      // Q1: 清運方式
      if (ans.housing === 'toilet') {
        if (p.id === 'pidan-mixed' || p.id === 'odout-tofu' || p.id === 'lady-n-tofu') {
          score += 25;
          reasons.push('可分次沖馬桶免追垃圾車');
        } else {
          score -= 30; // 礦砂不能沖馬桶
        }
      } else if (ans.housing === 'trash') {
        if (p.id === 'everclean-blue' || p.id === 'arm-hammer-slide' || p.id === 'dogcatstar-cassava') {
          score += 20;
          reasons.push('凝結緊實好鏟，適合每日丟垃圾');
        }
      }

      // Q2: 最在意痛點
      if (ans.priority === 'odor') {
        if (p.id === 'everclean-blue') {
          score += 25;
          reasons.push('雙重活性碳第7天除臭達 4.9 分最高');
        } else if (p.id === 'arm-hammer-slide') {
          score += 20;
          reasons.push('專利除臭晶體，封閉盆除臭首選');
        } else if (p.id === 'odout-tofu') {
          score += 15;
          reasons.push('含消臭配方，植物砂中除臭最佳');
        }
      } else if (ans.priority === 'dust') {
        if (p.id === 'dogcatstar-cassava') {
          score += 25;
          reasons.push('木薯無粉塵特性，人貓過敏氣喘首選');
        } else if (p.id === 'pidan-mixed' || p.id === 'odout-tofu') {
          score += 18;
          reasons.push('高溫烘乾抗碎，粉塵評分高達 4.8 分');
        } else if (p.id === 'everclean-blue') {
          score -= 10; // 礦砂有微粉塵
        }
      } else if (ans.priority === 'tracking') {
        if (p.id === 'odout-tofu' || p.id === 'lady-n-tofu') {
          score += 22;
          reasons.push('條狀長型顆粒不易卡肉球，帶砂量最少');
        } else if (p.id === 'pidan-mixed') {
          score += 15;
          reasons.push('大顆粒混合配比，不易被腳趾夾出盆外');
        }
      }

      // Q3: 腳感與偏好
      if (ans.preference === 'mineral') {
        if (p.litter_type === 'bentonite' || p.id === 'pidan-mixed') {
          score += 15;
          reasons.push('真實細砂腳感，貓咪接受度近 100%');
        }
      } else if (ans.preference === 'plant') {
        if (p.litter_type === 'tofu' || p.litter_type === 'cassava') {
          score += 15;
          reasons.push('純天然植物原料，舔毛誤食安全');
        }
      } else if (ans.preference === 'budget') {
        if ((p.cost_per_cat_day ?? 99) < 15) {
          score += 20;
          reasons.push(`每日約 NT$${p.cost_per_cat_day?.toFixed(1) ?? '10'}，荷包超省`);
        }
      }

      return {
        product: p,
        matchScore: Math.min(99, Math.max(60, score)),
        reason: reasons.slice(0, 2).join(' · ') || '全方位各項指標均衡',
        badge: score >= 90 ? '最完美契合' : '高匹配推薦',
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    setResult(scored.slice(0, 2));
  }

  function reset() {
    setStep(1);
    setAnswers({});
    setResult(null);
  }

  return (
    <section className="recommender-card card">
      <div className="recommender-header">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="tag">30 秒貓砂智慧推薦</span>
          <span className="small muted">免登入 · 3 題快速配對</span>
        </div>
        <h2 style={{ fontSize: '1.24rem', marginTop: 4 }}>不知道該買哪款砂？讓數據為你挑</h2>
        <p className="small muted" style={{ margin: '2px 0 0' }}>
          依照你的「居住環境、是否沖馬桶、過敏狀況」快速計算最適合你家的貓砂。
        </p>
      </div>

      {step < 4 && (
        <div className="quiz-progress-bar">
          <div className="quiz-progress-track">
            <div className="quiz-progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <span className="quiz-progress-text">問題 {step} / 3</span>
        </div>
      )}

      {/* 第 1 題 */}
      {step === 1 && (
        <div className="quiz-step">
          <div className="quiz-question">Q1. 平常的倒垃圾與清理習慣？</div>
          <div className="quiz-options">
            <button
              type="button"
              className={`quiz-opt-btn ${answers.housing === 'toilet' ? 'on' : ''}`}
              onClick={() => selectAnswer('housing', 'toilet')}
            >
              <b>可沖馬桶（小套房／免追垃圾車）</b>
              <span>習慣鏟完直接倒馬桶沖掉，不想堆垃圾袋</span>
            </button>
            <button
              type="button"
              className={`quiz-opt-btn ${answers.housing === 'trash' ? 'on' : ''}`}
              onClick={() => selectAnswer('housing', 'trash')}
            >
              <b>可裝袋丟一般垃圾（大樓有子母車）</b>
              <span>可每天或定期丟垃圾，優先考慮最強凝結與除臭</span>
            </button>
          </div>
        </div>
      )}

      {/* 第 2 題 */}
      {step === 2 && (
        <div className="quiz-step">
          <div className="quiz-question">Q2. 你或貓咪目前最困擾的痛點？</div>
          <div className="quiz-options">
            <button
              type="button"
              className={`quiz-opt-btn ${answers.priority === 'odor' ? 'on' : ''}`}
              onClick={() => selectAnswer('priority', 'odor')}
            >
              <b>臭味嚴重（多貓或房間空氣不流通）</b>
              <span>第 3 天起砂盆飄味，需要極致除臭天花板</span>
            </button>
            <button
              type="button"
              className={`quiz-opt-btn ${answers.priority === 'dust' ? 'on' : ''}`}
              onClick={() => selectAnswer('priority', 'dust')}
            >
              <b>粉塵敏感（人或貓鼻過敏／眼睛易流淚）</b>
              <span>倒砂打噴嚏，需要近乎零粉塵的安心配方</span>
            </button>
            <button
              type="button"
              className={`quiz-opt-btn ${answers.priority === 'tracking' ? 'on' : ''}`}
              onClick={() => selectAnswer('priority', 'tracking')}
            >
              <b>帶砂嚴重（腳底常踩到碎顆粒沙漠化）</b>
              <span>希望貓咪出盆不卡腳、地板維持乾爽</span>
            </button>
          </div>
          <button type="button" className="ghost small-btn quiz-back" onClick={() => setStep(1)}>
            ← 上一題
          </button>
        </div>
      )}

      {/* 第 3 題 */}
      {step === 3 && (
        <div className="quiz-step">
          <div className="quiz-question">Q3. 貓咪習慣與材質偏好？</div>
          <div className="quiz-options">
            <button
              type="button"
              className={`quiz-opt-btn ${answers.preference === 'mineral' ? 'on' : ''}`}
              onClick={() => selectAnswer('preference', 'mineral')}
            >
              <b>偏好天然細砂腳感（貓咪最愛）</b>
              <span>貓咪挑砂、喜歡踩在細軟礦砂上掩埋排泄物</span>
            </button>
            <button
              type="button"
              className={`quiz-opt-btn ${answers.preference === 'plant' ? 'on' : ''}`}
              onClick={() => selectAnswer('preference', 'plant')}
            >
              <b>偏好純植物成分（豆腐砂／木薯砂）</b>
              <span>天然食品級原料，舔毛誤食安全更放心</span>
            </button>
            <button
              type="button"
              className={`quiz-opt-btn ${answers.preference === 'budget' ? 'on' : ''}`}
              onClick={() => selectAnswer('preference', 'budget')}
            >
              <b>CP 值省荷包優先（用量省壽命長）</b>
              <span>一包能用很久，每隻貓每日耗材開銷愈低愈好</span>
            </button>
          </div>
          <button type="button" className="ghost small-btn quiz-back" onClick={() => setStep(2)}>
            ← 上一題
          </button>
        </div>
      )}

      {/* 測驗結果展示 */}
      {step === 4 && result && (
        <div className="quiz-result-view">
          <div className="quiz-result-header">
            <div>
              <span className="tag amber">推薦結果已生成</span>
              <h3 style={{ marginTop: 4 }}>最適合你家的 2 款貓砂</h3>
            </div>
            <button type="button" className="ghost small-btn" onClick={reset}>
              重新測驗
            </button>
          </div>

          <div className="quiz-result-cards">
            {result.map((item, idx) => (
              <div key={item.product.id} className="quiz-result-item">
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="row" style={{ gap: 8 }}>
                    <span className={`tag ${idx === 0 ? '' : 'plain'}`}>
                      {idx === 0 ? '最佳首選' : '替代備選'}
                    </span>
                    <span className="match-percent">{item.matchScore}% 契合度</span>
                  </div>
                  <span className="price-badge">
                    每日約 NT${item.product.cost_per_cat_day?.toFixed(1) ?? '—'}
                  </span>
                </div>

                <div className="quiz-result-body">
                  <ProductPackThumb product={item.product} size="md" />
                  <div style={{ flex: 1 }}>
                    <div className="brand-pill" style={{ alignSelf: 'flex-start', marginBottom: 3 }}>
                      {item.product.brand}
                    </div>
                    <b style={{ fontSize: '1.05rem', display: 'block' }}>{item.product.name}</b>
                    <p className="quiz-reason">
                      <b>推薦原因：</b>{item.reason}
                    </p>
                    <div className="row" style={{ gap: 6, marginTop: 6 }}>
                      <span className="cute-pill">
                        回購率 <b>{Math.round((item.product.repurchase_b ?? 0.85) * 100)}%</b>
                      </span>
                      <span className="cute-pill">
                        除臭 <b>{item.product.odor_b?.toFixed(1) ?? '4.8'} / 5</b>
                      </span>
                      <span className="cute-pill">
                        低粉塵 <b>{item.product.dust_b != null ? (6 - item.product.dust_b).toFixed(1) : '4.8'} / 5</b>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="quiz-result-footer">
                  <Link href={`/products/${item.product.id}`} className="btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
                    查看這款的完整實測與評價 <ArrowUpRightIcon size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
