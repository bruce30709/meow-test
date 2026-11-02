'use client';
import { useState } from 'react';
import { useHousehold } from '@/components/useHousehold';
import { needsVet, VET_MESSAGE } from '@/lib/guard';
import type { Question } from '@/lib/types';

export default function QA({ productId, initial }: { productId: string; initial: Question[] }) {
  const { db, household } = useHousehold();
  const [questions, setQuestions] = useState(initial);
  const [text, setText] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const alert = needsVet(text) || Object.values(replies).some(needsVet);

  async function ask() {
    if (!db || !household || needsVet(text)) return;
    const { data, error } = await db.from('questions')
      .insert({ product_id: productId, household_id: household.id, author_name: household.display_name, body: text })
      .select().single();
    if (error) return setMsg(error.message);
    setQuestions([{ ...(data as Question), answers: [] }, ...questions]);
    setText('');
  }

  async function answer(qid: string) {
    const body = replies[qid];
    if (!db || !household || !body || needsVet(body)) return;
    const { data, error } = await db.from('answers')
      .insert({ question_id: qid, household_id: household.id, author_name: household.display_name, body })
      .select().single();
    if (error) return setMsg(error.message);
    setQuestions(questions.map((q) => (q.id === qid ? { ...q, answers: [...q.answers, data as Question['answers'][number]] } : q)));
    setReplies({ ...replies, [qid]: '' });
  }

  return (
    <div className="form">
      {alert && <p className="alert">{VET_MESSAGE}</p>}
      {household ? (
        <div className="row">
          <input id="qa-ask" style={{ flex: 1 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="例如：上掀式砂盆會卡蓋子嗎？" />
          <button onClick={ask} disabled={text.trim().length < 2 || needsVet(text)}>發問</button>
        </div>
      ) : (
        <p className="small muted">到「我的家」登入後就能發問和回答。</p>
      )}
      {msg && <p className="small" style={{ color: 'var(--warn)' }}>{msg}</p>}
      {questions.map((q) => (
        <div key={q.id} className="card">
          <b>{q.body}</b>
          <span className="small muted">{q.author_name}</span>
          {q.answers.map((a) => (
            <div key={a.id} style={{ borderLeft: '3px solid var(--line)', paddingLeft: 10 }}>
              {a.body} <span className="small muted">— {a.author_name}</span>
            </div>
          ))}
          {household && (
            <div className="row">
              <input id={`qa-reply-${q.id}`} style={{ flex: 1 }} value={replies[q.id] ?? ''} onChange={(e) => setReplies({ ...replies, [q.id]: e.target.value })} placeholder="分享你的經驗" />
              <button className="ghost" onClick={() => answer(q.id)}>回答</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
