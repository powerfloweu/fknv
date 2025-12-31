"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

function loadLocal(attemptId: string) {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('exam-' + attemptId) || '{}');
  } catch { return {}; }
}
function saveLocal(attemptId: string, data: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('exam-' + attemptId, JSON.stringify(data));
}

export default function ExamAttemptPage() {
  const { attemptId } = useParams() as { attemptId: string };
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load attempt data
  useEffect(() => {
    async function fetchAttempt() {
      const local = loadLocal(attemptId);
      if (local && local.attempt) {
        setAttempt(local.attempt);
        setAnswers(local.answers || {});
        setTimeLeft(local.timeLeft || local.attempt.durationSec || 0);
        return;
      }
      // No local, fetch from server
      // (In real app, would need a GET endpoint or pass data from redirect)
      setAttempt(null);
    }
    fetchAttempt();
  }, [attemptId]);

  // Timer
  useEffect(() => {
    if (!attempt || submitted) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [attempt, timeLeft, submitted]);

  // Autosave
  useEffect(() => {
    if (!attempt) return;
    saveLocal(attemptId, { attempt, answers, timeLeft });
  }, [attempt, answers, timeLeft, attemptId]);

  if (!attempt) return <main>Vizsgaadatok nem elérhetők.</main>;
  if (submitted) return (
    <main>
      <h1>Vizsga vége</h1>
      <div>Eredmény: {score ? score.total : '...'}/ {attempt.questionIds.length}</div>
      <pre>{score && JSON.stringify(score.breakdown, null, 2)}</pre>
    </main>
  );

  const qid = attempt.questionIds[current];
  // In real app, fetch question data by ID from server or static import
  // Here, just show ID for minimal demo

  function handleAnswer(val: any) {
    setAnswers({ ...answers, [qid]: val });
  }
  function handleNext() {
    if (current < attempt.questionIds.length - 1) setCurrent(c => c + 1);
  }
  function handleBack() {
    if (current > 0) setCurrent(c => c - 1);
  }
  async function handleSubmit() {
    setSubmitted(true);
    const res = await fetch(`/api/exam/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attemptId, answers })
    });
    if (res.ok) setScore(await res.json());
  }

  return (
    <main>
      <div>Vizsga: {attemptId}</div>
      <div>Kérdés {current + 1} / {attempt.questionIds.length}</div>
      <div>Hátralévő idő: {timeLeft} mp</div>
      <div>Kérdés ID: {qid}</div>
      <input
        value={answers[qid]?.value || ''}
        onChange={e => handleAnswer({ type: 'short', value: e.target.value })}
        placeholder="Válasz..."
      />
      <div>
        <button onClick={handleBack} disabled={current === 0}>Vissza</button>
        <button onClick={handleNext} disabled={current === attempt.questionIds.length - 1}>Következő</button>
        <button onClick={handleSubmit}>Beküldés</button>
      </div>
    </main>
  );
}
