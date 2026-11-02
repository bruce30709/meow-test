'use client';
import { useEffect, useState } from 'react';
import { useHousehold, writeLocalState, type CatProfile } from '@/components/useHousehold';
import { HOUSING_LABEL, type Housing } from '@/lib/types';

function lifeStage(birth: string | null) {
  if (!birth) return '成貓';
  const y = (Date.now() - new Date(birth).getTime()) / 3.15576e10;
  return y < 1 ? '幼貓（0–1 歲）' : y < 7 ? '青年成貓（1–6 歲）' : y < 11 ? '熟齡貓（7–10 歲）' : '高齡老貓（10 歲以上）';
}

const REWARDS = [
  { id: 'rw1', title: '臭味滾 Odout 極細抗臭豆腐砂 2L 體驗包', cost: 150, tag: '免運寄送到家' },
  { id: 'rw2', title: '紐頓 Nutram T22 無穀火雞＋雞肉 100g 試吃包 ×2', cost: 120, tag: '換糧7日體驗組' },
  { id: 'rw3', title: '法米納 N&D 頂級無穀雞肉石榴 50g 隨手包 ×3', cost: 120, tag: '挑嘴貓測試組' },
];

export default function Me() {
  const { db, isLocalMode, session, household, local, totalPoints, loading, reload } = useHousehold();
  const [email, setEmail] = useState('bruce30709@gmail.com');
  const [h, setH] = useState<{ display_name: string; cats: number; housing: Housing; box_type: string; allergy: boolean }>({
    display_name: '', cats: 1, housing: 'apartment', box_type: '', allergy: false,
  });
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [cat, setCat] = useState({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!household) return;
    setH({
      display_name: household.display_name,
      cats: household.cats,
      housing: (household.housing as Housing) ?? 'apartment',
      box_type: household.box_type ?? '',
      allergy: household.allergy,
    });
    if (isLocalMode) {
      setCats(local.cats);
    } else if (db) {
      db.from('cats').select('*').then(({ data }) => setCats((data ?? []) as CatProfile[]));
    }
  }, [db, isLocalMode, household, local.cats]);

  if (loading) return <main><p className="muted">載入中…</p></main>;

  // ================= 未登入畫面（提供完整登入體驗） =================
  if (!household && (!session || isLocalMode)) {
    return (
      <main>
        <section className="login-box card">
          <div className="login-badge">🐾 喵實測會員中心</div>
          <h1>登入／註冊「我的家」</h1>
          <p className="muted">
            登入後即可設定你家的貓咪數量與居住空間，提交標準實測（+80 點）、上傳訂單截圖（+30 點），並累積點數免費兌換合作品牌試用包。
          </p>

          <div className="form" style={{ marginTop: 8 }}>
            <label htmlFor="email">
              電子信箱（Magic Link 免密碼登入）
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <div className="row" style={{ gap: 10 }}>
              <button
                onClick={async () => {
                  if (isLocalMode || !db) {
                    writeLocalState((prev) => ({
                      ...prev,
                      loggedIn: true,
                      household: {
                        ...prev.household,
                        email: email.trim() || 'catlover@example.com',
                        display_name: prev.household.display_name || email.split('@')[0] || '匿名貓奴',
                      },
                    }));
                    setMsg('✓ 已成功登入！');
                    return;
                  }
                  const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/me` } });
                  setMsg(error ? error.message : '登入連結已寄出，請到信箱點開。');
                }}
              >
                ✉️ 使用此信箱登入／註冊
              </button>

              {isLocalMode && (
                <button
                  className="ghost"
                  onClick={() => {
                    writeLocalState((prev) => ({ ...prev, loggedIn: true }));
                  }}
                >
                  ✨ 一鍵快速體驗登入（雙喵實測家 Bruce）
                </button>
              )}
            </div>
          </div>
          {msg && <p className="notice">{msg}</p>}
          <p className="disc">
            隱私承諾：你上傳的訂單截圖僅擷取寵物商品用於計算回購率與使用天數，其他個人消費品項一律忽略不存；公開評論只會顯示你的暱稱與「幾貓・住宅」標籤。
          </p>
        </section>
      </main>
    );
  }

  async function saveHousehold() {
    const row = { ...h, display_name: h.display_name.trim() || '匿名貓奴' };
    if (isLocalMode || !db) {
      writeLocalState((prev) => ({
        ...prev,
        household: { ...prev.household, ...row },
      }));
      setH(row);
      setMsg('✓ 家庭情境已儲存！排行榜與實測將自動帶入此設定。');
      return;
    }
    const { error } = await db.from('households').upsert({ ...row, ...(household ? { id: household.id } : {}) });
    if (!error) setH(row);
    setMsg(error ? error.message : '✓ 已儲存。');
    reload();
  }

  async function addCat() {
    if (!cat.name.trim()) return setMsg('請先輸入貓咪名字。');
    const newCat: CatProfile = {
      id: `cat-${Date.now()}`,
      name: cat.name.trim(),
      birth_date: cat.birth_date || null,
      long_hair: cat.long_hair,
      neutered: cat.neutered,
      vet_tags: cat.vet_tag ? [cat.vet_tag] : [],
    };
    if (isLocalMode || !db) {
      writeLocalState((prev) => ({
        ...prev,
        cats: [...prev.cats, newCat],
        household: { ...prev.household, cats: Math.max(prev.household.cats, prev.cats.length + 1) },
      }));
      setCat({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
      setMsg(`✓ 已新增貓咪「${newCat.name}」！`);
      return;
    }
    if (!household) return;
    const { data, error } = await db.from('cats').insert({
      household_id: household.id, name: newCat.name, birth_date: newCat.birth_date, long_hair: newCat.long_hair, neutered: newCat.neutered, vet_tags: newCat.vet_tags,
    }).select().single();
    if (error) return setMsg(error.message);
    setCats([...cats, data as CatProfile]);
    setCat({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
  }

  function removeCat(id: string) {
    if (isLocalMode || !db) {
      writeLocalState((prev) => ({
        ...prev,
        cats: prev.cats.filter((c) => c.id !== id),
      }));
    }
  }

  function redeemReward(title: string, cost: number) {
    if (totalPoints < cost) return setMsg(`點數不足（需要 ${cost} 點，目前 ${totalPoints} 點）。快去完成一次實測 (+80 點) 吧！`);
    writeLocalState((prev) => ({
      ...prev,
      points: [
        { id: `pt-${Date.now()}`, delta: -cost, reason: 'redeem', label: `兌換試用包：${title}`, created_at: new Date().toISOString().slice(0, 10) },
        ...prev.points,
      ],
    }));
    setMsg(`🎉 兌換成功！「${title}」已扣除 ${cost} 點（提交該款實測時系統將自動標註「試用」）。`);
  }

  return (
    <main>
      <section className="me-header card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="me-avatar-lg">{household?.display_name.slice(0, 1)}</div>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <h1>{household?.display_name}</h1>
                <span className="tag">🏅 創始實測員</span>
              </div>
              <p className="small muted" style={{ margin: 0 }}>
                帳號：{household?.email ?? '已驗證會員'} · {h.cats} 隻貓 · {HOUSING_LABEL[h.housing]}
              </p>
            </div>
          </div>
          <div className="points-hero">
            <div className="points-hero-num">🪙 {totalPoints}</div>
            <div className="small muted">可用實測點數</div>
          </div>
        </div>
      </section>

      {msg && <p className="notice">{msg}</p>}

      <div className="grid2">
        {/* 家庭情境設定 */}
        <section className="card form">
          <h3>🏠 家庭情境設定</h3>
          <p className="small muted">這些標籤會自動帶入你的評論，並用來篩選「跟你家條件相似」的排行榜。</p>
          <div className="grid2">
            <label htmlFor="dn">公開暱稱<input id="dn" value={h.display_name} onChange={(e) => setH({ ...h, display_name: e.target.value })} /></label>
            <label htmlFor="nc">家裡幾隻貓<input id="nc" type="number" min={1} max={20} value={h.cats} onChange={(e) => setH({ ...h, cats: Number(e.target.value) })} /></label>
            <label htmlFor="hs">居住空間類型
              <select id="hs" value={h.housing} onChange={(e) => setH({ ...h, housing: e.target.value as Housing })}>
                {(Object.keys(HOUSING_LABEL) as Housing[]).map((k) => <option key={k} value={k}>{HOUSING_LABEL[k]}</option>)}
              </select>
            </label>
            <label htmlFor="bx">主力砂盆類型<input id="bx" value={h.box_type} onChange={(e) => setH({ ...h, box_type: e.target.value })} placeholder="開放式大盆、上掀式、自動貓砂機…" /></label>
          </div>
          <label className="check" htmlFor="al">
            <input id="al" type="checkbox" checked={h.allergy} onChange={(e) => setH({ ...h, allergy: e.target.checked })} />
            家裡有人或貓對粉塵敏感（有過敏性鼻炎／氣喘）
          </label>
          <button onClick={saveHousehold}>💾 儲存家庭情境</button>
        </section>

        {/* 我的貓咪檔案 */}
        <section className="card form">
          <h3>🐱 我的貓咪檔案（{cats.length} 隻）</h3>
          <div className="cat-cards-list">
            {cats.map((c) => (
              <div key={c.id} className="cat-item">
                <span className="cat-emoji">{c.long_hair ? '🦁' : '🐱'}</span>
                <div style={{ flex: 1 }}>
                  <b>{c.name}</b>
                  <div className="small muted">
                    {lifeStage(c.birth_date)} · {c.long_hair ? '長毛貓' : '短毛貓'} · {c.neutered ? '已結紮' : '未結紮'}
                  </div>
                  {c.vet_tags.map((t) => <span key={t} className="tag plain" style={{ marginTop: 4 }}>獸醫叮嚀：{t}</span>)}
                </div>
                {isLocalMode && (
                  <button className="ghost small-btn" onClick={() => removeCat(c.id)}>移除</button>
                )}
              </div>
            ))}
          </div>

          <div className="add-cat-box">
            <b>＋ 新增貓咪成員</b>
            <div className="grid2" style={{ marginTop: 8 }}>
              <label htmlFor="cn">貓咪名字<input id="cn" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} placeholder="例如：布丁" /></label>
              <label htmlFor="cb">大約生日<input id="cb" type="date" value={cat.birth_date} onChange={(e) => setCat({ ...cat, birth_date: e.target.value })} /></label>
              <label htmlFor="cv">獸醫照護備註（選填）
                <select id="cv" value={cat.vet_tag} onChange={(e) => setCat({ ...cat, vet_tag: e.target.value })}>
                  <option value="">無特別備註</option>
                  <option>泌尿道照護</option>
                  <option>腎臟照護</option>
                  <option>體重控制</option>
                  <option>腸胃敏感</option>
                </select>
              </label>
              <div className="row" style={{ alignSelf: 'end', paddingBottom: 6 }}>
                <label className="check" htmlFor="lh"><input id="lh" type="checkbox" checked={cat.long_hair} onChange={(e) => setCat({ ...cat, long_hair: e.target.checked })} />長毛</label>
                <label className="check" htmlFor="nt"><input id="nt" type="checkbox" checked={cat.neutered} onChange={(e) => setCat({ ...cat, neutered: e.target.checked })} />已結紮</label>
              </div>
            </div>
            <button className="ghost" style={{ marginTop: 8 }} onClick={addCat}>＋ 加入這隻貓咪</button>
          </div>
        </section>
      </div>

      {/* 點數兌換與點數存摺 */}
      <div className="grid2">
        <section className="card">
          <h3>🎁 點數兌換試用包專區</h3>
          <p className="small muted">點數只看實測完成度，與你給幾分完全無關。兌換試用包後的評論會自動誠實揭露「試用」標籤。</p>
          <div className="form">
            {REWARDS.map((rw) => (
              <div key={rw.id} className="reward-row">
                <div>
                  <b>{rw.title}</b>
                  <div className="small muted">{rw.tag}</div>
                </div>
                <button className="ghost small-btn" onClick={() => redeemReward(rw.title, rw.cost)}>
                  🪙 {rw.cost} 點兌換
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>📒 點數存摺明細與獲取規則</h3>
          <table>
            <tbody>
              <tr><td>完成第一次標準實測（/submit）</td><td className="num"><b>+80 點</b></td></tr>
              <tr><td>完成第 30 天長期追蹤實測</td><td className="num"><b>+50 點</b></td></tr>
              <tr><td>上傳購買訂單證明（/purchase）</td><td className="num"><b>+30 點</b></td></tr>
              <tr><td>同款湊滿兩張不同日期訂單（解鎖使用週期）</td><td className="num"><b>+20 點</b></td></tr>
            </tbody>
          </table>
          <h4 style={{ margin: '10px 0 4px', fontSize: '.9rem' }}>最近入帳紀錄</h4>
          <div className="ledger-list">
            {local.points.map((pt) => (
              <div key={pt.id} className="ledger-item">
                <span>{pt.label} <small className="muted">（{pt.created_at}）</small></span>
                <b className="num" style={{ color: pt.delta > 0 ? 'var(--accent)' : 'var(--warn)' }}>
                  {pt.delta > 0 ? `+${pt.delta}` : pt.delta} 點
                </b>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button
          className="ghost"
          onClick={() => {
            if (isLocalMode || !db) {
              writeLocalState((prev) => ({ ...prev, loggedIn: false }));
              setMsg('已登出帳號。');
              return;
            }
            db.auth.signOut();
          }}
        >
          🚪 登出帳號
        </button>
      </div>
    </main>
  );
}
