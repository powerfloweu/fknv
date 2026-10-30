"use client";
"use client";
// Helper to map JSON question to internal Question type
function mapJsonToQuestion(json: any): Question {
  if (json.típus === 'single') {
    return {
      id: json.id,
      type: 'single',
      question: json.kérdés,
      options: json.válaszlehetőségek,
      answer: typeof json.helyes_válasz === 'number' ? json.helyes_válasz - 1 : json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'multi' || json.típus === 'multiple') {
    return {
      id: json.id,
      type: 'multi',
      question: json.kérdés,
      options: json.válaszlehetőségek,
      answer: Array.isArray(json.helyes_válaszok) ? json.helyes_válaszok.map((n: number) => n - 1) : json.helyes_válaszok,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'tf') {
    return {
      id: json.id,
      type: 'tf',
      question: json.kérdés,
      answer: json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'short' || json.típus === 'regex') {
    return {
      id: json.id,
      type: 'short',
      question: json.kérdés,
      criteria: json.helyes_regex ? [{ regex: json.helyes_regex }] : [],
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  }
  throw new Error('Ismeretlen kérdés típus: ' + json.típus);
}
import { useEffect, useState } from "react";
import questionBank from "@/data/questionBank.json";
import { Question } from "@/lib/types";


export default function ExamResultPage() {
  const [attempt, setAttempt] = useState<{
    questionIds?: number[];
    [key: string]: unknown;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const data = localStorage.getItem("examAttempt");
        if (data) {
          setTimeout(() => setAttempt(JSON.parse(data)), 0);
        }
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
        padding: '24px 16px'
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
      padding: '24px 16px'
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
          {attempt.questionIds.map((qid: number, idx: number) => {
            const q = (questionBank as any[]).map(mapJsonToQuestion).find((qq) => qq.id === qid);
            if (!q) return null;
            const answers: Record<number, any> = attempt.answers as Record<number, any>;
            const userAns = answers?.[qid];
            // Determine correct answers
            const correctSingle = q.type === 'single' && typeof q.answer === 'number' ? q.answer - 1 : undefined;
            const correctMulti = q.type === 'multi' && Array.isArray(q.answer) ? q.answer.map((n: number) => n - 1) : [];
            // Determine user answers
            const userSingle = typeof userAns === 'number' ? userAns : userAns?.value;
            const userMulti = Array.isArray(userAns) ? userAns : userAns?.value;
            // Breakdown and point info
            const result: { breakdown?: Record<number, number> } = attempt.result as { breakdown?: Record<number, number> };
            const breakdown = result?.breakdown || {};
            const gotPoint = breakdown[qid] > 0;
            return (
              <li key={qid} style={{ marginBottom: 32, borderBottom: "1px solid #ccc", paddingBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17, marginBottom: 6 }}>
                  <b>{idx + 1}.</b> {q.question}
                </div>
                {'options' in q && q.options && Array.isArray(q.options) && (
                  <ul style={{ margin: "8px 0 0 0", padding: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {q.options.map((opt: string, i: number) => {
                      let background = '#f3f4f6';
                      let color = '#1e293b';
                      let border = '1.5px solid #e5e7eb';
                      let icon = null;
                      let isUser = false, isCorrect = false;
                       if (q.type === 'single') {
                         isUser = userSingle === i;
                         isCorrect = correctSingle === i;
                       } else if (q.type === 'multi') {
                         isUser = Array.isArray(userMulti) && userMulti.includes(i);
                         isCorrect = Array.isArray(correctMulti) && correctMulti.includes(i);
                       }
                      // Color logic
                      if (isUser && isCorrect && gotPoint) {
                        background = '#16a34a'; color = '#fff'; border = '2px solid #16a34a'; icon = '✔️';
                      } else if (isUser && !isCorrect) {
                        background = '#f59e42'; color = '#fff'; border = '2px solid #f59e42'; icon = '✖️';
                      } else if (!isUser && isCorrect) {
                        background = '#2563eb'; color = '#fff'; border = '2px solid #2563eb';
                      }
                      return (
                        <li key={i} style={{
                          background,
                          color,
                          borderRadius: 8,
                          padding: '8px 16px',
                          marginBottom: 2,
                          fontSize: 16,
                          fontWeight: 500,
                          listStyle: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          border,
                          position: 'relative',
                          boxShadow: isUser ? '0 2px 8px rgba(99,102,241,0.08)' : undefined,
                        }}>
                           {q.type === 'single' ? (
                            <input type="radio" checked={isUser} readOnly style={{ accentColor: background, marginRight: 8 }} />
                          ) : (
                            <input type="checkbox" checked={isUser} readOnly style={{ accentColor: background, marginRight: 8 }} />
                          )}
                          <span>{opt}</span>
                          {icon && <span style={{ marginLeft: 'auto', fontSize: 18 }}>{icon}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {/* Legend for answer colors */}
                <div style={{ margin: '10px 0 0 0', fontSize: 14, color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                  <span><span style={{ display: 'inline-block', width: 16, height: 16, background: '#16a34a', borderRadius: 4, marginRight: 4, verticalAlign: 'middle' }}></span> Helyes és bejelölted (pontot kaptál)</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 16, background: '#f59e42', borderRadius: 4, marginRight: 4, verticalAlign: 'middle' }}></span> Bejelölted, de nem helyes</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 16, background: '#2563eb', borderRadius: 4, marginRight: 4, verticalAlign: 'middle' }}></span> Helyes, de nem jelölted</span>
                  <span><span style={{ display: 'inline-block', width: 16, height: 16, background: '#f3f4f6', borderRadius: 4, marginRight: 4, verticalAlign: 'middle', border: '1.5px solid #e5e7eb' }}></span> Egyéb opció</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 15 }}>
                  <b>Pont:</b> {breakdown[qid] ?? 0}
                  {gotPoint ? <span style={{ color: '#16a34a', marginLeft: 8 }}>✔️ Helyes válasz!</span> : <span style={{ color: '#dc2626', marginLeft: 8 }}>✖️ Nem kaptál pontot</span>}
                </div>
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
