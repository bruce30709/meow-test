'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useHousehold, writeLocalState, ensureUuid, isIoTDevMode, type CatProfile } from '@/components/useHousehold';
import { HOUSING_LABEL, type Housing } from '@/lib/types';
import { CatLogoIcon, VerifiedIcon } from '@/components/Icons';

function lifeStage(birth: string | null) {
  if (!birth) return '成貓';
  const y = (Date.now() - new Date(birth).getTime()) / 3.15576e10;
  return y < 1 ? '幼貓（0–1 歲）' : y < 7 ? '青年成貓（1–6 歲）' : y < 11 ? '熟齡貓（7–10 歲）' : '高齡老貓（10 歲以上）';
}

export default function Me() {
  const { db, isLocalMode, session, household, local, totalPoints, loading, reload } = useHousehold();
  const [email, setEmail] = useState(isIoTDevMode ? 'bruce30709@gmail.com' : '');
  const [nickname, setNickname] = useState('');
  const [h, setH] = useState<{ display_name: string; cats: number; housing: Housing; box_type: string; allergy: boolean }>({
    display_name: '', cats: 1, housing: 'apartment', box_type: '', allergy: false,
  });
  const [cats, setCats] = useState<CatProfile[]>([]);
  const [cat, setCat] = useState({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
  const [msg, setMsg] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState(true);

  useEffect(() => {
    if (!household) return;
    setH({
      display_name: household.display_name,
      cats: household.cats,
      housing: (household.housing as Housing) ?? 'apartment',
      box_type: household.box_type ?? '',
      allergy: household.allergy,
    });
    setCats(local.cats);
    if (db && household.id) {
      db.from('cats').select('*').eq('household_id', household.id).then(({ data }) => {
        if (data && data.length > 0) setCats(data as CatProfile[]);
      });
    }
  }, [db, household, local.cats]);

  if (loading) return <main><p className="muted">載入中…</p></main>;

  if (!household && (!session || isLocalMode)) {
    return (
      <main>
        <section className="login-box card">
          <div className="tag" style={{ alignSelf: 'flex-start' }}>MEOW TEST LAB · 會員中心</div>
          <h1>登入／註冊「我的貓窩」</h1>
          <p className="muted">
            無需綁定信用卡。登入後即可建立專屬的「養貓花費與換糧避坑筆記本」，並提交標準實測累積信譽權重。
          </p>

          <div className="form" style={{ marginTop: 8 }}>
            <label htmlFor="email">
              電子信箱
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label htmlFor="nickname">
              公開顯示暱稱（例如：橘座阿母、雙貓奴阿哲）
              <input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="輸入你想在評論區顯示的稱呼"
              />
            </label>
            <div className="row" style={{ gap: 10 }}>
              <button
                onClick={async () => {
                  const cleanEmail = email.trim();
                  if (!cleanEmail) {
                    setMsg('請輸入電子信箱。');
                    return;
                  }
                  const displayName = nickname.trim() || cleanEmail.split('@')[0] || '認證飼主';
                  const hhId = ensureUuid(local.household?.id);
                  if (db) {
                    await db.from('households').upsert({
                      id: hhId,
                      email: cleanEmail,
                      display_name: displayName,
                      cats: local.household?.cats || 1,
                      housing: local.household?.housing || 'apartment',
                      box_type: local.household?.box_type || '',
                      allergy: Boolean(local.household?.allergy),
                    });
                  }
                  writeLocalState((prev) => ({
                    ...prev,
                    loggedIn: true,
                    household: {
                      ...prev.household,
                      id: hhId,
                      email: cleanEmail,
                      display_name: displayName,
                    },
                  }));
                  setMsg('已成功登入並同步至雲端貓窩。');
                }}
              >
                登入／建立我的貓窩
              </button>

              {isIoTDevMode && (
                <button
                  className="ghost"
                  onClick={() => {
                    writeLocalState((prev) => ({
                      ...prev,
                      loggedIn: true,
                      household: {
                        ...prev.household,
                        id: ensureUuid(prev.household.id),
                        email: 'bruce30709@gmail.com',
                        display_name: '雙喵實測家 Bruce',
                      },
                    }));
                  }}
                >
                  一鍵快速體驗登入（開發測試用）
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
    const hhId = ensureUuid(household?.id);
    const row = { ...h, display_name: h.display_name.trim() || '匿名貓奴' };
    if (db) {
      await db.from('households').upsert({ id: hhId, email: household?.email || null, ...row });
    }
    writeLocalState((prev) => ({
      ...prev,
      household: { ...prev.household, id: hhId, ...row },
    }));
    setH(row);
    setMsg('家庭情境已儲存並同步至 Supabase 雲端資料庫！');
    reload();
  }

  async function addCat() {
    if (!cat.name.trim()) return setMsg('請先輸入貓咪名字。');
    const hhId = ensureUuid(household?.id);
    const catId = ensureUuid(null);
    const newCat: CatProfile = {
      id: catId,
      name: cat.name.trim(),
      birth_date: cat.birth_date || null,
      long_hair: cat.long_hair,
      neutered: cat.neutered,
      vet_tags: cat.vet_tag ? [cat.vet_tag] : [],
    };
    if (db) {
      await db.from('households').upsert({
        id: hhId,
        display_name: household?.display_name || '匿名貓奴',
        cats: Math.max(h.cats, cats.length + 1),
        housing: h.housing,
        box_type: h.box_type,
        allergy: h.allergy,
      });
      await db.from('cats').upsert({
        id: catId,
        household_id: hhId,
        name: newCat.name,
        birth_date: newCat.birth_date,
        long_hair: newCat.long_hair,
        neutered: newCat.neutered,
        vet_tags: newCat.vet_tags,
      });
    }
    writeLocalState((prev) => ({
      ...prev,
      cats: [...prev.cats, newCat],
      household: { ...prev.household, id: hhId, cats: Math.max(prev.household.cats, prev.cats.length + 1) },
    }));
    setCat({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
    setMsg(`已新增貓咪「${newCat.name}」並同步至雲端。`);
  }

  function removeCat(id: string) {
    if (isLocalMode || !db) {
      writeLocalState((prev) => ({
        ...prev,
        cats: prev.cats.filter((c) => c.id !== id),
      }));
    }
  }

  const levelTitle = totalPoints >= 250 ? 'Lv.3 殿堂評鑑官' : totalPoints >= 120 ? 'Lv.2 認證實測員' : 'Lv.1 見習飼主';
  const totalSpent = local.purchases.reduce((sum, p) => sum + (p.price_twd ?? 0), 0);

  return (
    <main>
      <section className="me-header card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="row" style={{ gap: 14 }}>
            <div className="me-avatar-lg">{household?.display_name.slice(0, 1)}</div>
            <div>
              <div className="row" style={{ gap: 8 }}>
                <h1>{household?.display_name}</h1>
                <span className="tag">{levelTitle}</span>
                <span className="tag plain">演算法權重 1.0x（已驗證訂單）</span>
              </div>
              <p className="small muted" style={{ margin: '4px 0 0' }}>
                帳號：{household?.email ?? '已驗證會員'} · {h.cats} 隻貓 · {HOUSING_LABEL[h.housing]}
              </p>
            </div>
          </div>
          <div className="points-hero">
            <div className="points-hero-num">{totalPoints} EXP</div>
            <div className="small muted">實測貢獻值（不隨評分高低變動）</div>
          </div>
        </div>
      </section>

      {msg && <p className="notice">{msg}</p>}

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h3>我的貓窩花費 ＆ 避坑紀錄本</h3>
            <p className="small muted" style={{ margin: 0 }}>
              不用等廠商給贈品。上傳訂單與實測即可自動幫你記錄「每包吃幾天、哪款會軟便或過敏、每月真實開銷」。
            </p>
          </div>
          <div className="row">
            <Link href="/purchase" className="btn-secondary">＋ 記一筆訂單</Link>
            <Link href="/submit" className="btn-primary">＋ 記一筆換糧／換砂實測</Link>
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="v">NT${totalSpent.toLocaleString()}</div>
            <div className="k">已登錄訂單累計金額（{local.purchases.length} 筆）</div>
          </div>
          <div className="metric">
            <div className="v">NT${Math.round(28.5 * h.cats * 30).toLocaleString()}</div>
            <div className="k">{h.cats} 貓每月預估耗材開銷（飼料＋砂）</div>
          </div>
          <div className="metric">
            <div className="v">21 天</div>
            <div className="k">法國皇家 IN27（2kg）你家雙貓平均週期</div>
          </div>
          <div className="metric">
            <div className="v">0 次軟便</div>
            <div className="k">目前主力糧（皇家 IN27）腸胃適應紀錄</div>
          </div>
        </div>
      </section>

      <div className="grid2">
        <section className="card form">
          <h3>家庭情境設定</h3>
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
          <button onClick={saveHousehold}>儲存家庭情境</button>
        </section>

        <section className="card form">
          <h3>我的貓咪檔案（{cats.length} 隻）</h3>
          <div className="cat-cards-list">
            {cats.map((c) => (
              <div key={c.id} className="cat-item">
                <span className="cta-icon" style={{ width: 34, height: 34 }}><CatLogoIcon size={18} /></span>
                <div style={{ flex: 1 }}>
                  <b>{c.name}</b>
                  <div className="small muted">
                    {lifeStage(c.birth_date)} · {c.long_hair ? '長毛貓' : '短毛貓'} · {c.neutered ? '已結紮' : '未結紮'}
                  </div>
                  {c.vet_tags.map((t) => <span key={t} className="tag plain" style={{ marginTop: 4 }}>照護備註：{t}</span>)}
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

      <div className="grid2">
        <section className="card">
          <h3>{isIoTDevMode ? '實測官信譽等級 ＆ 二階段硬體早鳥資格' : '實測官信譽等級 ＆ 演算法權重說明'}</h3>
          <p className="small muted">
            為保持 100% 獨立中立，你的實測貢獻值（EXP）只看實測完整度、不隨給分高低變動，並用來解鎖排行榜演算法權重：
          </p>
          <div className="form">
            <div className="reward-row">
              <div>
                <b>Lv.1 見習飼主（0+ EXP）</b>
                <div className="small muted">可使用個人花費記帳本、發表公開實測與提問（未驗證訂單權重 0.25x）</div>
              </div>
              <span className="tag plain">已解鎖</span>
            </div>
            <div className="reward-row">
              <div>
                <b>Lv.2 認證實測員（120+ EXP）</b>
                <div className="small muted">已上傳真實訂單驗證，評論獲得「已驗證購買」標章與完整 1.0x 排名權重</div>
              </div>
              <span className="tag row" style={{ gap: 4 }}>
                {totalPoints >= 120 ? <><VerifiedIcon size={12} /> 目前等級</> : '需 120 EXP'}
              </span>
            </div>
            <div className="reward-row">
              <div>
                <b>{isIoTDevMode ? 'Lv.3 創始評鑑官（200+ EXP）· 二階段硬體種子資格' : 'Lv.3 殿堂評鑑官（200+ EXP）'}</b>
                <div className="small muted">
                  {isIoTDevMode
                    ? '優先獲得第二階段「免換盆 · 加裝式砂盆＆飲水智慧貼片」首批內測資格，以及未來無印盲測盒候補權'
                    : '累積 2 款以上第 30 天長期追蹤實測，享有社群精選置頂與無印盲測體驗優先候補資格'}
                </div>
              </div>
              <button
                className="ghost small-btn"
                onClick={() => {
                  setWaitlistJoined(true);
                  setMsg(isIoTDevMode ? '已將您排入第二階段「加裝式智慧貼片」種子內測名單。' : '已將您排入殿堂評鑑官優先候補名單。');
                }}
              >
                {waitlistJoined ? '已排入候補' : '登記候補'}
              </button>
            </div>
          </div>
        </section>

        <section className="card">
          <h3>貢獻值（EXP）累積紀錄</h3>
          <table>
            <tbody>
              <tr><td>提交標準實測（/submit）</td><td className="num"><b>+80 EXP</b></td></tr>
              <tr><td>第 30 天長期追蹤更新</td><td className="num"><b>+50 EXP</b></td></tr>
              <tr><td>上傳購買訂單證明（/purchase）</td><td className="num"><b>+30 EXP</b></td></tr>
              <tr><td>同款湊滿兩張訂單（算出真實消耗天數）</td><td className="num"><b>+20 EXP</b></td></tr>
            </tbody>
          </table>
          <h4 style={{ margin: '10px 0 4px', fontSize: '.9rem' }}>最近紀錄</h4>
          <div className="ledger-list">
            {local.points.map((pt) => (
              <div key={pt.id} className="ledger-item">
                <span>{pt.label} <small className="muted">（{pt.created_at}）</small></span>
                <b className="num" style={{ color: 'var(--ink)' }}>
                  {pt.delta > 0 ? `+${pt.delta}` : pt.delta} EXP
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
          登出帳號
        </button>
      </div>
    </main>
  );
}
