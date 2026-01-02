"use client";
import { useState, useMemo } from "react";

export default function ClientStudyPage({ questions }: { questions: any[] }) {
  const [showOnlyCorrect, setShowOnlyCorrect] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  let filtered: typeof questions = [];
  let totalPages = 1;
  let paginated: typeof questions = [];
  const [block, setBlock] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");

  const blocks = useMemo(
    () => Array.from(new Set(questions.map(q => q.blokk).filter(Boolean))),
    [questions]
  );
  const types = useMemo(
    () => Array.from(new Set(questions.map(q => q.típus).filter(Boolean))),
    [questions]
  );
  const blockScoped = useMemo(
    () => (block ? questions.filter(q => q.blokk === block) : questions),
    [block, questions]
  );
  const topics = useMemo(
    () => Array.from(new Set(blockScoped.map(q => q.téma).filter(Boolean))),
    [blockScoped]
  );
  const difficulties = useMemo(
    () => Array.from(new Set(blockScoped.map(q => q.nehézség).filter(Boolean))),
    [blockScoped]
  );
  filtered = useMemo(
    () =>
      blockScoped.filter(
        q =>
          (!topic || q.téma === topic) &&
          (!difficulty || q.nehézség === difficulty) &&
          (!type || q.típus === type)
      ),
    [blockScoped, topic, difficulty, type]
  );
  totalPages = Math.ceil(filtered.length / pageSize);
  paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 0
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)',
        padding: '40px 32px 32px 32px',
        maxWidth: 900,
        width: '100%',
        textAlign: 'center',
        margin: '32px 0 24px 0'
      }}>
        <div style={{ marginBottom: 24 }}>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto 12px auto' }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#a5b4fc" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#f0abfc" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#f0abfc" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#6366f1" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#6366f1" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#6366f1" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>
          Tanuló mód
        </h1>
        <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Böngéssz, szűrj, tanulj!
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 16, justifyContent: 'center', flexWrap: 'wrap', background: '#fff', padding: 12, borderRadius: 12, boxShadow: '0 2px 8px rgba(60,60,120,0.04)' }}>
          <select value={type} onChange={e => { setType(e.target.value); setPage(1); }} style={{ minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #6366f1', background: '#fff', color: '#3730a3', fontWeight: 500, fontSize: 16 }}>
            <option value="">Minden típus</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={block} onChange={e => {
            setBlock(e.target.value);
            setTopic("");
            setDifficulty("");
            setPage(1);
          }} style={{ minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #6366f1', background: '#fff', color: '#3730a3', fontWeight: 500, fontSize: 16 }}>
            <option value="">Minden blokk</option>
            {blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={topic} onChange={e => { setTopic(e.target.value); setPage(1); }} style={{ minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #6366f1', background: '#fff', color: '#3730a3', fontWeight: 500, fontSize: 16 }}>
            <option value="">Minden téma</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={difficulty} onChange={e => { setDifficulty(e.target.value); setPage(1); }} style={{ minWidth: 140, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #6366f1', background: '#fff', color: '#3730a3', fontWeight: 500, fontSize: 16 }}>
            <option value="">Minden nehézség</option>
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: '#3730a3', fontSize: 16, background: '#f1f5f9', borderRadius: 8, padding: '8px 14px', border: '1.5px solid #6366f1', cursor: 'pointer' }}>
            <input type="checkbox" checked={showOnlyCorrect} onChange={e => setShowOnlyCorrect(e.target.checked)} style={{ accentColor: '#6366f1', width: 18, height: 18 }} />
            Csak a helyes válasz mutatása
          </label>
        </div>
        <ul style={{ padding: 0, textAlign: 'left', marginTop: 16 }}>
          {paginated.map((q, idx) => (
            <li key={q.id} style={{ marginBottom: 24, borderBottom: "1px solid #e0e7ff", paddingBottom: 12, background: '#f8fafc', borderRadius: 12, padding: '16px 16px 12px 16px', boxShadow: '0 2px 8px rgba(60,60,120,0.04)' }}>
              <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17, marginBottom: 4 }}>
                <span style={{ color: '#818cf8', fontWeight: 700, marginRight: 8 }}>{(page - 1) * pageSize + idx + 1}.</span> {q.kérdés}
              </div>
              {q.válaszlehetőségek && Array.isArray(q.válaszlehetőségek) && (
                <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
                  {q.válaszlehetőségek.map((opt: string, i: number) => {
                    const isCorrect = (typeof q.helyes_válasz === 'number' && q.helyes_válasz - 1 === i) || (Array.isArray(q.helyes_válaszok) && q.helyes_válaszok.includes(i + 1));
                    if (showOnlyCorrect && !isCorrect) return null;
                    return (
                      <li key={i} style={{ color: isCorrect ? '#166534' : '#3730a3', background: isCorrect ? '#bbf7d0' : '#e0e7ff', borderRadius: 6, padding: '4px 10px', marginBottom: 4, display: 'inline-block', minWidth: 120, fontWeight: isCorrect ? 700 : 400 }}>{String.fromCharCode(65 + i)}. {opt}</li>
                    );
                  })}
                </ul>
              )}
              <div style={{ color: '#6366f1', fontSize: 14, marginTop: 4 }}>
                <b>Blokk:</b> {q.blokk} | <b>Téma:</b> {q.téma} | <b>Nehézség:</b> {q.nehézség}
              </div>
            </li>
          ))}
        </ul>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
            <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: page === 1 ? '#e0e7ff' : '#6366f1', color: page === 1 ? '#a5b4fc' : '#fff', fontWeight: 600, fontSize: 16, cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Előző</button>
            <span style={{ fontWeight: 500, color: '#3730a3', fontSize: 16 }}>Oldal {page} / {totalPages}</span>
            <button onClick={() => setPage(page + 1)} disabled={page === totalPages} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: page === totalPages ? '#e0e7ff' : '#6366f1', color: page === totalPages ? '#a5b4fc' : '#fff', fontWeight: 600, fontSize: 16, cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Következő</button>
          </div>
        )}
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Tanulj, fejlődj, ismételj!
      </div>
    </main>
  );
}
