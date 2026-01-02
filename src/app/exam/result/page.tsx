"use client";
import { useEffect, useState } from "react";
import questionBank from "@/data/questionBank.json";

export default function ExamResultPage() {
  const [attempt, setAttempt] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem("examAttempt");
        if (data) setAttempt(JSON.parse(data));
      } catch {}
    }
  }, []);

  if (!attempt || !Array.isArray(attempt.questionIds)) {
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
          maxWidth: 540,
          width: '100%',
          textAlign: 'center',
          marginBottom: 32
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
            Nincs vizsgaeredmény
          </h1>
          <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
            Nem található vizsgakísérlet az eszközön.
          </div>
        </div>
      </main>
    );
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
        maxWidth: 700,
        width: '100%',
        textAlign: 'center',
        marginBottom: 32
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
          Vizsgaeredmény
        </h1>
        <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Kérdésenkénti válaszaid, helyes megoldások, magyarázatok.
        </div>
        <ul style={{ listStyle: "none", padding: 0, textAlign: 'left', marginTop: 16 }}>
          {attempt.questionIds.map((qid: string, idx: number) => {
            const q = questionBank.find((qq: any) => qq.id === qid);
            return (
              <li key={qid} style={{ marginBottom: 32, borderBottom: "1px solid #ccc", paddingBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17 }}><b>{idx + 1}.</b> {q ? q.kérdés : <i>Question not found</i>}</div>
                {q && q.válaszlehetőségek && Array.isArray(q.válaszlehetőségek) && (
                  <ul style={{ margin: "8px 0" }}>
                    {q.válaszlehetőségek.map((opt: string, i: number) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                )}
                <div><b>Válaszod:</b> {JSON.stringify(attempt.answers[qid])}</div>
                <div><b>Helyes válasz:</b> {q && (q.helyes_válasz !== undefined || q.helyes_válaszok !== undefined) ? JSON.stringify(q.helyes_válasz ?? q.helyes_válaszok) : <i>Not specified</i>}</div>
                <div style={{ border: '1px solid #bbb', borderRadius: 6, padding: 12, marginTop: 16, background: '#fafbfc' }}>
                  <b>Magyarázat</b>
                  <div style={{ marginTop: 8 }}>
                      <i>Nincs magyarázat.</i>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Gratulálunk a kitöltéshez!
      </div>
    </main>
  );
}
