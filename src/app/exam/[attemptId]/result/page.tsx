"use client";
import { useEffect, useState } from "react";
import questionBank from "@/data/questionBank.json";
import { useParams } from "next/navigation";

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let tries = 0;
      function tryLoad() {
        try {
          const raw = localStorage.getItem(`exam-result-${String(attemptId)}`);
          if (raw) {
            setData(JSON.parse(raw));
            return;
          }
        } catch {}
        if (tries < 10) {
          tries++;
          setTimeout(tryLoad, 100);
        }
      }
      tryLoad();
    }
  }, [attemptId]);

  if (!data || !data.attempt || !data.result) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: 40, maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>Exam result not found or not available.</h1>
        </div>
      </main>
    );
  }

  const { attempt, answers, result } = data;
  const questions = (questionBank as any[]).filter(q => attempt.questionIds.includes(q.id));
  const total = result.total;
  const percent = Math.round((total / attempt.questionIds.length) * 100);

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: '40px 32px 32px 32px', maxWidth: 800, width: '100%', textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>Vizsgaeredmény</h1>
        <div style={{ fontSize: 18, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Elért pontszám: <b>{total} / {attempt.questionIds.length}</b> ({percent}%)
        </div>
        {/* Color legend */}
        <div style={{ margin: '0 auto 18px auto', maxWidth: 500, textAlign: 'left', background: '#f3f4f6', borderRadius: 10, padding: '12px 18px', fontSize: 15, color: '#111' }}>
          <b>Színmagyarázat:</b>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 18, height: 18, background: '#16a34a', borderRadius: 4, marginRight: 8, border: '2px solid #fbbf24' }}></span>
              <span><b>Zöld</b> – Helyes válasz, amit te is megjelöltél</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 18, height: 18, background: '#f59e42', borderRadius: 4, marginRight: 8, border: '2px solid #fbbf24' }}></span>
              <span><b>Narancs</b> – Általad megjelölt, de nem helyes válasz</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ display: 'inline-block', width: 18, height: 18, background: '#2563eb', borderRadius: 4, marginRight: 8, border: '2px solid #2563eb' }}></span>
              <span><b>Kék</b> – Helyes válasz, amit nem jelöltél meg</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
              <span style={{ display: 'inline-block', width: 18, height: 18, background: '#1e293b', borderRadius: 4, marginRight: 8 }}></span>
              <span><b>Sötétszürke</b> – Egyéb válaszlehetőség</span>
            </li>
          </ul>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginTop: 16 }}>
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            let correctAns = null;
            if (q.típus === "single") correctAns = q.helyes_válasz;
            else if (q.típus === "multiple") correctAns = q.helyes_válaszok;
            else if (q.típus === "regex") correctAns = q.helyes_regex;
            const isCorrect = result.breakdown && result.breakdown[q.id] > 0;
            // Helper to highlight user's answer and correct answer
            const renderOptions = () => {
              if (!q.válaszlehetőségek) return null;
              return (
                <ul style={{ margin: '8px 0', padding: 0 }}>
                  {q.válaszlehetőségek.map((opt: string, i: number) => {
                    let isUser = false, isCorrectOpt = false;
                    if (q.típus === "single") {
                      isUser = userAns === i || userAns?.value === i;
                      isCorrectOpt = correctAns === i;
                    } else if (q.típus === "multiple") {
                      isUser = Array.isArray(userAns) ? userAns.includes(i) : userAns?.value?.includes?.(i);
                      isCorrectOpt = Array.isArray(correctAns) ? correctAns.includes(i) : false;
                    }
                    return (
                      <li key={i} style={{
                        background: isUser && isCorrectOpt ? '#16a34a' : isUser ? '#f59e42' : isCorrectOpt ? '#2563eb' : '#1e293b',
                        color: '#fff',
                        borderRadius: 6,
                        padding: '6px 12px',
                        marginBottom: 6,
                        fontSize: 15,
                        fontWeight: 500,
                        listStyle: 'none',
                        display: 'inline-block',
                        border: isUser ? '2px solid #fbbf24' : isCorrectOpt ? '2px solid #2563eb' : 'none'
                      }}>{opt}</li>
                    );
                  })}
                </ul>
              );
            };
            return (
              <li key={q.id} style={{ marginBottom: 28, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17 }}><b>{idx + 1}.</b> {q.kérdés}</div>
                {renderOptions()}
                {q.típus === "regex" && (
                  <>
                    <div><b>Válaszod:</b> {JSON.stringify(userAns)}</div>
                    <div><b>Helyes válasz:</b> {JSON.stringify(correctAns)}</div>
                  </>
                )}
                <div style={{ color: isCorrect ? '#16a34a' : '#dc2626', fontWeight: 600, marginTop: 6 }}>
                  {isCorrect ? '✔️ Helyes' : '❌ Hibás'}
                </div>
              </li>
            );
          })}
        </ul>
        <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
          <span role="img" aria-label="brain">🧠</span> Gratulálunk a kitöltéshez!
        </div>
      </div>
    </main>
  );
}
