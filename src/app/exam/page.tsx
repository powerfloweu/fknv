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
      background: 'var(--paper)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px'
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
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>
          Próbavizsga indítása
        </h1>
        {/* Két külön gomb, figyelmeztetés eltávolítva */}
        <div style={{ textAlign: 'left', marginBottom: 18 }}>
          <label htmlFor="f-blokk" style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#3730a3', marginBottom: 4 }}>
            Témakör
          </label>
          <select
            id="f-blokk"
            value={blokk}
            onChange={e => changeBlokk(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #4f46e5', fontSize: 14, color: '#3730a3', background: 'white' }}
          >
            <option value="">Teljes vizsga (minden témakör)</option>
            {blokkok.map(b => (
              <option key={b.name} value={b.name}>{b.name} ({b.total})</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 17, color: '#4f46e5', fontWeight: 500, marginBottom: 18 }}>
          {selectedBlokk ? 'Hány kérdésből álljon a témakvíz?' : 'Állítsd be, hány kérdésből álljon a vizsga!'}
        </div>
        <div style={{ fontStyle: 'italic', fontSize: 15, color: '#3730a3', marginBottom: 18, fontWeight: 400 }}>
          {selectedBlokk
            ? `(Ebben a témakörben ${topicMax} ${hardMode ? 'nehéz ' : ''}kérdés van.)`
            : '(Mivel kilenc nagy téma van, ezzel a számmal oszhatónak kell lennie az elemszámnak!)'}
        </div>
        <input
          type="number"
          aria-label="Kérdések száma"
          min={selectedBlokk ? 1 : 9}
          max={selectedBlokk ? topicMax : 180}
          step={selectedBlokk ? 1 : 9}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          style={{
            fontSize: 18,
            padding: '8px 16px',
            borderRadius: 8,
            border: '1.5px solid #4f46e5',
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
              style={{ width: 20, height: 20, accentColor: '#4f46e5', marginRight: 8 }}
            />
            Csak nehéz kérdésekből álló (&quot;hard mode&quot;) vizsga
          </label>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
          <button
            onClick={startNormalExam}
            disabled={loading}
            style={{
              background: '#4338ca',
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
              background: 'white',
              color: '#4338ca',
              fontWeight: 600,
              fontSize: 18,
              padding: '12px 32px',
              borderRadius: 12,
              border: '2px solid #4338ca',
              boxShadow: '0 2px 8px rgba(251,191,36,0.10)',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Vizsga indítása...' : `${count} kérdéses Q&A ${selectedBlokk ? 'kvíz' : 'vizsga'}`}
          </button>
        </div>
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
        <Link href="/" style={{ display: 'inline-block', marginTop: 6, padding: '10px 12px', color: '#52606d', fontSize: 14, textDecoration: 'none' }}>
          ← Vissza
        </Link>
      </div>
    </main>
  );
}
