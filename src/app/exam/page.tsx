"use client";
import { useState } from 'react';

export default function ExamStartPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(90);

  function validateCount(n: number) {
    return n >= 9 && n <= 180 && n % 9 === 0;
  }

  async function startExam() {
    if (!validateCount(count)) {
      setError('A kérdések száma legyen legalább 9 és osztható 9-cel!');
      return;
    }
    setLoading(true);
    setError(null);
    const seed = Date.now().toString();
    // Store count in localStorage for ExamPage to pick up
    try {
      const metaRaw = localStorage.getItem("exam-meta");
      const meta = metaRaw ? JSON.parse(metaRaw) : {};
      meta[seed] = { count };
      localStorage.setItem("exam-meta", JSON.stringify(meta));
    } catch {}
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, count })
    });
    if (!res.ok) {
      setError('Hiba a vizsga indításakor');
      setLoading(false);
      return;
    }
    const data = await res.json();
    window.location.href = `/exam/${data.attemptId}`;
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
        <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Állítsd be, hány kérdésből álljon a vizsga! (Mivel kilenc nagy téma van, ezzel a számmal oszhatónak kell lennie az elemszámnak!)
        </div>
        <input
          type="number"
          min={9}
          max={180}
          step={9}
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
        <button
          onClick={startExam}
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
            marginBottom: 12,
            transition: 'background 0.2s'
          }}
        >
          {loading ? 'Vizsga indítása...' : `${count} kérdéses vizsga indítása`}
        </button>
        {error && <div style={{ color: '#dc2626', marginTop: 8 }}>{error}</div>}
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Sok sikert a vizsgához!
      </div>
    </main>
  );
}
