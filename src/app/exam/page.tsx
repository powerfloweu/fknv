"use client";
import { useState } from 'react';
import Link from 'next/link';
import goldBank from '@/data/questionBank_GOLD.json';

type BankItem = { blokk?: string; nehézség?: string };
const bank = goldBank as BankItem[];

// Témakörök (blokkok) az első előfordulás sorrendjében, kérdésszámmal
const blokkok: { name: string; total: number; hard: number }[] = [];
for (const q of bank) {
  if (!q.blokk) continue;
  let b = blokkok.find(x => x.name === q.blokk);
  if (!b) { b = { name: q.blokk, total: 0, hard: 0 }; blokkok.push(b); }
  b.total++;
  if (q.nehézség === 'hard') b.hard++;
}

export default function ExamStartPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(90);
  const [hardMode, setHardMode] = useState(false);
  const [blokk, setBlokk] = useState('');

  const selectedBlokk = blokkok.find(b => b.name === blokk);
  const topicMax = selectedBlokk ? (hardMode ? selectedBlokk.hard : selectedBlokk.total) : 0;

  function changeBlokk(name: string) {
    setBlokk(name);
    setError(null);
    const b = blokkok.find(x => x.name === name);
    if (b) setCount(Math.min(10, hardMode ? b.hard : b.total) || 1);
    else setCount(90);
  }

  // Separate handlers for normal and Q&A modes
  async function startNormalExam() {
    if (!validateCount(count)) {
      setError(countError());
      return;
    }
    setLoading(true);
    setError(null);
    const seed = Date.now().toString();
    try {
      const metaRaw = localStorage.getItem("exam-meta");
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta[seed] = { count, hardMode, qaMode: false, blokk: blokk || undefined };
      localStorage.setItem("exam-meta", JSON.stringify(meta));
    } catch {}
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, count, hardMode, blokk: blokk || undefined })
    });
    if (!res.ok) {
      setError('Hiba a vizsga indításakor');
      setLoading(false);
      return;
    }
    const data = await res.json();
    window.location.href = `/exam/${data.attemptId}`;
  }

  async function startQaExam() {
    if (!validateCount(count)) {
      setError(countError());
      return;
    }
    setLoading(true);
    setError(null);
    const seed = Date.now().toString();
    try {
      const metaRaw = localStorage.getItem("exam-meta");
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta[seed] = { count, hardMode, qaMode: true, blokk: blokk || undefined };
      localStorage.setItem("exam-meta", JSON.stringify(meta));
    } catch {}
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, count, hardMode, blokk: blokk || undefined })
    });
    if (!res.ok) {
      setError('Hiba a vizsga indításakor');
      setLoading(false);
      return;
    }
    const data = await res.json();
    window.location.href = `/exam/qa/${data.attemptId}`;
  }

  function validateCount(n: number) {
    if (selectedBlokk) return n >= 1 && n <= topicMax;
    return n >= 9 && n <= 180 && n % 9 === 0;
  }

  function countError() {
    if (!selectedBlokk) return 'A kérdések száma legyen legalább 9 és osztható 9-cel!';
    if (topicMax === 0) return 'Ebben a témakörben nincs nehéz kérdés — kapcsold ki a hard mode-ot!';
    return `A kérdések száma 1 és ${topicMax} között legyen!`;
  }


  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0
    }}>
      <div style={{
        background: 'white',
        borderRadius: 24,
        boxShadow: '0 8px 32px rgba(60,60,120,0.12)',
        padding: '40px 32px 32px 32px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        marginBottom: 32
      }}>
        <div style={{ marginBottom: 24 }}>
          {/* Simple SVG brain illustration */}
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
          Próbavizsga indítása
        </h1>
        {/* Két külön gomb, figyelmeztetés eltávolítva */}
        <div style={{ textAlign: 'left', marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#3730a3', marginBottom: 4 }}>
            Témakör
          </label>
          <select
            value={blokk}
            onChange={e => changeBlokk(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #6366f1', fontSize: 14, color: '#3730a3', background: 'white' }}
          >
            <option value="">Teljes vizsga (minden témakör)</option>
            {blokkok.map(b => (
              <option key={b.name} value={b.name}>{b.name} ({b.total})</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          {selectedBlokk ? 'Hány kérdésből álljon a témakvíz?' : 'Állítsd be, hány kérdésből álljon a vizsga!'}
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 15, color: '#3730a3', marginBottom: 18, fontWeight: 400 }}>
          {selectedBlokk
            ? `(Ebben a témakörben ${topicMax} ${hardMode ? 'nehéz ' : ''}kérdés van.)`
            : '(Mivel kilenc nagy téma van, ezzel a számmal oszhatónak kell lennie az elemszámnak!)'}
        </div>
        <input
          type="number"
          min={selectedBlokk ? 1 : 9}
          max={selectedBlokk ? topicMax : 180}
          step={selectedBlokk ? 1 : 9}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{
            fontSize: 18,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1.5px solid #6366f1',
            marginBottom: 16,
            width: 120,
            textAlign: 'center',
            color: '#1e293b'
          }}
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 17, color: '#0f172a', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={hardMode}
              onChange={e => setHardMode(e.target.checked)}
              style={{ width: 20, height: 20, accentColor: '#6366f1', marginRight: 8 }}
            />
            Csak nehéz kérdésekből álló (&quot;hard mode&quot;) vizsga
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          <button
            onClick={startNormalExam}
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: 18,
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Vizsga indítása...' : `${count} kérdéses normál ${selectedBlokk ? 'kvíz' : 'vizsga'}`}
          </button>
          <button
            onClick={startQaExam}
            disabled={loading}
            style={{
              background: 'linear-gradient(90deg, #f59e42 0%, #fbbf24 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: 18,
              padding: '12px 32px',
              borderRadius: 12,
              border: 'none',
              boxShadow: '0 2px 8px rgba(251,191,36,0.10)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Vizsga indítása...' : `${count} kérdéses Q&A ${selectedBlokk ? 'kvíz' : 'vizsga'}`}
          </button>
        </div>
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
        <Link href="/" style={{ display: 'inline-block', marginTop: 14, color: '#64748b', fontSize: 14, textDecoration: 'none' }}>
          ← Vissza
        </Link>
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Sok sikert a vizsgához!
      </div>
    </main>
  );
}
