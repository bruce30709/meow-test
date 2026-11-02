'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useHousehold, writeLocalState } from '@/components/useHousehold';
import { needsVet, VET_MESSAGE } from '@/lib/guard';
import type { Question } from '@/lib/types';

export default function QA({ productId, initial }: { productId: string; initial: Question[] }) {
  const { db, isLocalMode, household, local } = useHousehold();
  const [serverQuestions, setServerQuestions] = useState(initial);
  const [text, setText] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const alert = needsVet(text) || Object.values(replies).some(needsVet);

  const localQuestions = local.questions.filter((q) => q.product_id === productId);
  const questions = [...localQuestions, ...serverQuestions];

  async function ask() {
    if (!household || needsVet(text) || text.trim().length < 2) return;
    const today = new Date().toISOString().slice(0, 10);
    if (isLocalMode || !db) {
      const q: Question = {
        id: `lq-${Date.now()}`,
        product_id: productId,
        author_name: household.display_name,
        body: text.trim(),
        created_at: today,
        answers: [],
      };
      writeLocalState((prev) => ({ ...prev, questions: [q, ...prev.questions] }));
      setText('');
      return;
    }
    const { data, error } = await db.from('questions')
      .insert({ product_id: productId, household_id: household.id, author_name: household.display_name, body: text })
      .select().single();
    if (error) return setMsg(error.message);
    setServerQuestions([{ ...(data as Question), answers: [] }, ...serverQuestions]);
    setText('');
  }

  async function answer(qid: string) {
    const body = replies[qid]?.trim();
    if (!household || !body || needsVet(body)) return;
    const today = new Date().toISOString().slice(0, 10);
    const newAns = { id: `la-${Date.now()}`, author_name: household.display_name, body, created_at: today };

    if (isLocalMode || !db) {
      if (qid.startsWith('lq-')) {
        writeLocalState((prev) => ({
          ...prev,
          questions: prev.questions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, newAns] } : q)),
        }));
      } else {
        setServerQuestions(serverQuestions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, newAns] } : q)));
      }
      setReplies({ ...replies, [qid]: '' });
      return;
    }
    const { data, error } = await db.from('answers')
      .insert({ question_id: qid, household_id: household.id, author_name: household.display_name, body })
      .select().single();
    if (error) return setMsg(error.message);
    setServerQuestions(serverQuestions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, data as Question['answers'][number]] } : q)));
    setReplies({ ...replies, [qid]: '' });
  }

  return (
    <div className="form">
      {alert && <p className="alert">{VET_MESSAGE}</p>}
      {household ? (
        <div className="row">
          <input
            id="qa-ask"
            style={{ flex: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="想問用過的飼主什麼？（例如：換糧要混幾天？上掀式砂盆會卡嗎？試試輸入「尿不出來」看醫療防護）"
          />
          <button onClick={ask} disabled={text.trim().length < 2 || needsVet(text)}>送出提問</button>
        </div>
      ) : (
        <p className="small muted">請先到 <Link href="/me">我的貓窩</Link> 登入後即可發問與回答。</p>
      )}
      {msg && <p className="small" style={{ color: 'var(--warn)' }}>{msg}</p>}
      {questions.map((q) => (
        <div key={q.id} className="card qa-card">
          <div className="row">
            <span className="tag">Q 提問</span>
            <b>{q.body}</b>
            <span className="small muted" style={{ marginLeft: 'auto' }}>{q.author_name} · {q.created_at}</span>
          </div>
          {q.answers.map((a) => (
            <div key={a.id} className="qa-answer">
              <b>A：</b>{a.body} <span className="small muted">— {a.author_name}（{a.created_at}）</span>
            </div>
          ))}
          {household && (
            <div className="row" style={{ marginTop: 4 }}>
              <input
                id={`qa-reply-${q.id}`}
                style={{ flex: 1 }}
                value={replies[q.id] ?? ''}
                onChange={(e) => setReplies({ ...replies, [q.id]: e.target.value })}
                placeholder="分享你的真實使用經驗…"
              />
              <button className="ghost" onClick={() => answer(q.id)} disabled={!replies[q.id]?.trim() || needsVet(replies[q.id] ?? '')}>
                回覆
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
