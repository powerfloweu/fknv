"use client";
import { useEffect, useState } from "react";
import { Question } from "@/lib/types";
import questionBank from "@/data/questionBank.json";
import { useParams } from "next/navigation";

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState<{
    attempt?: { questionIds: number[]; [key: string]: unknown };
    answers?: Record<string, unknown>;
    result?: { total: number; breakdown: Record<string, number> };
  } | null>(null);
  
    // Helper to map JSON question to internal Question type
    function mapJsonToQuestion(json: any): Question {
      if (json.típus === 'single') {
        return {
          id: json.id,
          type: 'single',
          question: json.kérdés,
          options: json.válaszlehetőségek,
          answer: json.helyes_válasz,
          difficulty: json.nehézség,
          blokk: json.blokk,
        };
      } else if (json.típus === 'multi' || json.típus === 'multiple') {
        return {
          id: json.id,
          type: 'multi',
          question: json.kérdés,
          options: json.válaszlehetőségek,
          answer: json.helyes_válaszok,
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
  // import removed: not allowed inside function
  const questions = (questionBank as any[])
    .map(mapJsonToQuestion)
    .filter(q => attempt.questionIds.includes(q.id));
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
            const userAns = answers?.[q.id];
            let correctAns = null;
            if (q.type === "single") correctAns = q.answer;
            else if (q.type === "multi") correctAns = q.answer;
            else if (q.type === "short") correctAns = q.criteria;
            const isCorrect = result.breakdown && result.breakdown[q.id] > 0;
            // Helper to highlight user's answer and correct answer
            const renderOptions = () => {
              if (!('options' in q) || !q.options) return null;
              return (
                <ul style={{ margin: '8px 0', padding: 0 }}>
                  {q.options.map((opt: string, i: number) => {
                    let isUser = false, isCorrectOpt = false;
                    if (q.type === "single") {
                      isUser = userAns === i;
                      isCorrectOpt = correctAns === i;
                    } else if (q.type === "multi") {
                      isUser = Array.isArray(userAns) ? userAns.includes(i) : false;
                      isCorrectOpt = Array.isArray(correctAns) && typeof correctAns[0] === 'number' ? (correctAns as number[]).includes(i) : false;
                    }
                    // Exclusive color logic:
                    let background = '#1e293b';
                    let border = 'none';
                    if (isUser && isCorrectOpt) {
                      background = '#16a34a'; // green
                      border = '2px solid #fbbf24';
                    } else if (isUser && !isCorrectOpt) {
                      background = '#f59e42'; // orange
                      border = '2px solid #fbbf24';
                    } else if (!isUser && isCorrectOpt) {
                      background = '#2563eb'; // blue
                      border = '2px solid #2563eb';
                    }
                    // else: dark gray
                    return (
                      <li key={i} style={{
                        background,
                        color: '#fff',
                        borderRadius: 6,
                        padding: '6px 12px',
                        marginBottom: 6,
                        fontSize: 15,
                        fontWeight: 500,
                        listStyle: 'none',
                        display: 'inline-block',
                        border
                      }}>{opt}</li>
                    );
                  })}
                </ul>
              );
            };
            return (
              <li key={q.id} style={{ marginBottom: 28, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
                <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17 }}><b>{idx + 1}.</b> {q.question}</div>
                {renderOptions()}
                {q.type === "short" && (
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
