"use client";
import { useState } from 'react';

export default function ExamStartPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startExam() {
    setLoading(true);
    setError(null);
    const seed = Date.now().toString();
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed })
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
    <main>
      <h1>Próbavizsga indítása</h1>
      <button onClick={startExam} disabled={loading}>
        90 kérdéses vizsga indítása (90 perc)
      </button>
      {error && <div>{error}</div>}
    </main>
  );
}
