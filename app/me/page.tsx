'use client';
import { useEffect, useState } from 'react';
import { useHousehold } from '@/components/useHousehold';
import { HOUSING_LABEL, type Housing } from '@/lib/types';

type Cat = { id: string; name: string; birth_date: string | null; long_hair: boolean; neutered: boolean; vet_tags: string[] };

function lifeStage(birth: string | null) {
  if (!birth) return '';
  const y = (Date.now() - new Date(birth).getTime()) / 3.15576e10;
  return y < 1 ? '幼貓（0–1 歲）' : y < 7 ? '青年（1–6 歲）' : y < 11 ? '成熟（7–10 歲）' : '老年（10 歲以上）';
}

export default function Me() {
  const { db, session, household, loading, reload } = useHousehold();
  const [email, setEmail] = useState('');
  const [h, setH] = useState({ display_name: '', cats: 1, housing: 'apartment', box_type: '', allergy: false });
  const [cats, setCats] = useState<Cat[]>([]);
  const [cat, setCat] = useState({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
  const [points, setPoints] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!db || !household) return;
    setH({ display_name: household.display_name, cats: household.cats, housing: household.housing ?? 'apartment', box_type: household.box_type ?? '', allergy: household.allergy });
    db.from('cats').select('*').then(({ data }) => setCats((data ?? []) as Cat[]));
    db.from('points_ledger').select('delta').then(({ data }) => setPoints((data ?? []).reduce((a, r) => a + (r as { delta: number }).delta, 0)));
  }, [db, household]);

  if (!db) return <main><h1>我的家</h1><p className="notice">示意模式沒有登入功能，請先設定 Supabase。</p></main>;
  if (loading) return <main><p className="muted">載入中…</p></main>;

  if (!session) {
    return (
      <main>
        <h1>登入</h1>
        <p className="muted">輸入 Email，我們會寄登入連結給你。</p>
        <div className="row">
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ flex: 1 }} />
          <button onClick={async () => {
            const { error } = await db.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/me` } });
            setMsg(error ? error.message : '登入連結已寄出，請到信箱點開。');
          }}>寄登入連結</button>
        </div>
        {msg && <p className="notice">{msg}</p>}
        <p className="disc">註冊即表示同意：你上傳的購買紀錄只用於計算排行與點數，只儲存寵物商品；評論會以暱稱和家庭情境公開。</p>
      </main>
    );
  }

  async function saveHousehold() {
    if (!db) return;
    // 空白暱稱會蓋掉資料庫預設值，所以送出前補回「匿名貓奴」
    const row = { ...h, display_name: h.display_name.trim() || '匿名貓奴' };
    const { error } = await db.from('households').upsert({ ...row, ...(household ? { id: household.id } : {}) });
    if (!error) setH(row);
    setMsg(error ? error.message : '已儲存。');
    reload();
  }

  async function addCat() {
    if (!db || !household || !cat.name) return;
    const { data, error } = await db.from('cats').insert({
      household_id: household.id, name: cat.name, birth_date: cat.birth_date || null, long_hair: cat.long_hair, neutered: cat.neutered,
      vet_tags: cat.vet_tag ? [cat.vet_tag] : [],
    }).select().single();
    if (error) return setMsg(error.message);
    setCats([...cats, data as Cat]);
    setCat({ name: '', birth_date: '', long_hair: false, neutered: true, vet_tag: '' });
  }

  return (
    <main>
      <div className="row"><h1>我的家</h1><span className="tag amber">{points} 點</span></div>
      <div className="card form">
        <h3>家庭情境</h3>
        <p className="small muted">這些標籤會用來篩選「跟你家相似」的排行。</p>
        <div className="grid2">
          <label htmlFor="dn">暱稱（公開）<input id="dn" value={h.display_name} onChange={(e) => setH({ ...h, display_name: e.target.value })} /></label>
          <label htmlFor="nc">幾隻貓<input id="nc" type="number" min={1} max={20} value={h.cats} onChange={(e) => setH({ ...h, cats: Number(e.target.value) })} /></label>
          <label htmlFor="hs">住宅
            <select id="hs" value={h.housing} onChange={(e) => setH({ ...h, housing: e.target.value })}>
              {(Object.keys(HOUSING_LABEL) as Housing[]).map((k) => <option key={k} value={k}>{HOUSING_LABEL[k]}</option>)}
            </select>
          </label>
          <label htmlFor="bx">砂盆類型<input id="bx" value={h.box_type} onChange={(e) => setH({ ...h, box_type: e.target.value })} placeholder="開放式、上掀式、上入式…" /></label>
        </div>
        <label className="check" htmlFor="al"><input id="al" type="checkbox" checked={h.allergy} onChange={(e) => setH({ ...h, allergy: e.target.checked })} />家裡有人對粉塵過敏</label>
        <button onClick={saveHousehold}>儲存</button>
      </div>

      {household && (
        <div className="card form">
          <h3>我的貓</h3>
          {cats.map((c) => (
            <div key={c.id} className="row">
              <b>{c.name}</b>
              <span className="small muted">{lifeStage(c.birth_date)}・{c.long_hair ? '長毛' : '短毛'}・{c.neutered ? '已結紮' : '未結紮'}</span>
              {c.vet_tags.map((t) => <span key={t} className="tag plain">獸醫建議：{t}</span>)}
            </div>
          ))}
          <div className="grid2">
            <label htmlFor="cn">名字<input id="cn" value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} /></label>
            <label htmlFor="cb">生日（大約即可）<input id="cb" type="date" value={cat.birth_date} onChange={(e) => setCat({ ...cat, birth_date: e.target.value })} /></label>
            <label htmlFor="cv">獸醫建議（選填）
              <select id="cv" value={cat.vet_tag} onChange={(e) => setCat({ ...cat, vet_tag: e.target.value })}>
                <option value="">無</option><option>泌尿道照護</option><option>腎臟照護</option><option>體重控制</option><option>腸胃敏感</option>
              </select>
            </label>
          </div>
          <div className="row">
            <label className="check" htmlFor="lh"><input id="lh" type="checkbox" checked={cat.long_hair} onChange={(e) => setCat({ ...cat, long_hair: e.target.checked })} />長毛</label>
            <label className="check" htmlFor="nt"><input id="nt" type="checkbox" checked={cat.neutered} onChange={(e) => setCat({ ...cat, neutered: e.target.checked })} />已結紮</label>
          </div>
          <button className="ghost" onClick={addCat}>新增貓咪</button>
          <p className="disc">「獸醫建議」只用來看同類家長的經驗，平台不會依此推薦飼料。</p>
        </div>
      )}

      <div className="card">
        <h3>點數怎麼來</h3>
        <table><tbody>
          <tr><td>上傳訂單（有證明）</td><td className="num">+30</td></tr>
          <tr><td>同一款湊滿兩張不同日期的證明（解鎖一包用幾天）</td><td className="num">+20</td></tr>
          <tr><td>完成標準實測</td><td className="num">+80</td></tr>
          <tr><td>第 30 天追蹤</td><td className="num">+50</td></tr>
        </tbody></table>
        <p className="small muted">點數只看完成度，與評分高低無關。試用包兌換將在品牌合作開始後開放。</p>
      </div>
      {msg && <p className="notice">{msg}</p>}
      <button className="ghost" onClick={() => db.auth.signOut()}>登出</button>
    </main>
  );
}
