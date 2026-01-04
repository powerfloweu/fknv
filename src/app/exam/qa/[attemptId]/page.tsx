"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// import questionBank from "@/data/questionBank.json";
import { Question } from "@/lib/types";
import goldBank from "@/data/questionBank_GOLD.json";
// import { applyGoldAnswers } from "@/lib/applyGoldAnswers";

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
      // GOLD bank answers are typically 1-based; normalize to 0-based indices
      answer: Array.isArray(json.helyes_válaszok)
        ? json.helyes_válaszok.map((v: any) => (typeof v === "number" ? v - 1 : v))
        : json.helyes_válaszok,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'tf') {
    return {
      id: json.id,
      type: 'tf',
      question: json.kérdés,
      // normalize numeric answers if they are 1-based (defensive)
      answer: typeof json.helyes_válasz === "number" ? json.helyes_válasz - 1 : json.helyes_válasz,
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

function buildDisplayedOptions(
  q: Extract<Question, { options: string[] }>,
  seed: string
): { order: number[]; labels: string[] } {
  const order = q.options.map((_, i) => i);
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  function rng() {
    let t = (h += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { order, labels: order.map(i => q.options[i]) };
}

function isMultiCorrect(user: number[] | undefined, correct: number[]) {
  if (!Array.isArray(user)) return false;
  const a = [...user].sort().join(",");
  const b = [...correct].sort().join(",");
  return a === b;
}

export default function ExamQaPage() {
  const { attemptId } = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | number[] | string>>({});
  const [showCorrect, setShowCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [optionOrders, setOptionOrders] = useState<Record<number, number[]>>({});

  // Betöltjük a vizsga metaadatokat és kérdéseket
  useEffect(() => {
    if (!attemptId) return;
    // Metaadatok localStorage-ből
    const metaRaw = localStorage.getItem("exam-meta");
    let meta: Record<string, any> = {};
    if (metaRaw) try { meta = JSON.parse(metaRaw); } catch {}
    const attemptMeta = meta[String(attemptId)];
    if (!attemptMeta) return;
    // KérdésID-k localStorage-ből (mint a sima examnál)
    const resultRaw = localStorage.getItem(`exam-result-${attemptId}`);
    let questionIds: number[] = [];
    if (resultRaw) {
      try {
        const parsed = JSON.parse(resultRaw);
        if (parsed.attempt && Array.isArray(parsed.attempt.questionIds)) {
          questionIds = parsed.attempt.questionIds;
        }
      } catch {}
    }
    // Ha nincs, fallback: összes kérdésből random választás (nem ideális, de MVP)
    if (!questionIds.length) {
      questionIds = (goldBank as any[])
        .map(mapJsonToQuestion)
        .filter(q => !attemptMeta.hardMode || q.difficulty === 'hard')
        .sort(() => Math.random() - 0.5)
        .slice(0, attemptMeta.count)
        .map(q => q.id);
    }
    // Kérdések betöltése
    const qs = (goldBank as any[])
      .map(mapJsonToQuestion)
      .filter(q => questionIds.includes(q.id));
    setQuestions(qs);
    setAttempt({ ...attemptMeta, questionIds });
  }, [attemptId]);

  // Válaszadás kezelése
  function handleAnswer(ans: any) {
    if (showCorrect) return;
    const q = questions[current];
    setAnswers(a => ({ ...a, [q.id]: ans }));
    setShowCorrect(true);
  }

  function nextQuestion() {
    setShowCorrect(false);
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
    } else {
      // Vizsga vége, pontszám újraszámolása
      let total = 0;
      questions.forEach(q => {
        const ans = answers[q.id];
        let correct = false;
        if (q.type === 'single') correct = ans === q.answer;
        else if (q.type === 'multi') {
          // q.answer and ans are arrays of optionIds
          if (Array.isArray(ans) && Array.isArray(q.answer)) {
            correct = isMultiCorrect(ans, q.answer);
          }
        }
        else if (q.type === 'short' && Array.isArray(q.criteria) && q.criteria.length > 0 && typeof ans === 'string') {
          for (const crit of q.criteria) {
            try {
              const re = new RegExp(crit.regex, crit.flags || 'i');
              if (re.test(ans.trim())) { correct = true; break; }
            } catch {}
          }
        }
        if (correct) total++;
      });
      setScore(total);
      setFinished(true);
    }
  }

  if (!attempt || !questions.length) {
    return <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>Vizsga betöltése...</div></main>;
  }

  if (finished) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: 40, maxWidth: 540, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>Kérdés-felelet vizsga vége</h1>
          <div style={{ fontSize: 18, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
            Elért pontszám: <b>{score} / {questions.length}</b> ({Math.round((score / questions.length) * 100)}%)
          </div>
          <button onClick={() => router.push("/exam")} style={{ background: '#6366f1', color: 'white', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 22px', marginTop: 16, cursor: 'pointer' }}>Vissza a vizsgaindítóhoz</button>
        </div>
      </main>
    );
  }

  const q = questions[current];
  const userAns = answers[q.id];
  const seed = `${attemptId}::${q.id}`;

  let order = optionOrders[q.id];
  if (!order && (q.type === "single" || q.type === "multi")) {
    const built = buildDisplayedOptions(q, seed);
    order = built.order;
    if (!optionOrders[q.id]) {
      setOptionOrders(o => ({ ...o, [q.id]: order! }));
    }
  }
  const displayed =
    q.type === "single" || q.type === "multi"
      ? { order: order ?? q.options.map((_, i) => i), labels: (order ?? q.options.map((_, i) => i)).map(i => q.options[i]) }
      : { order: [], labels: [] };

  const isCorrect =
    showCorrect &&
    (
      (q.type === "single" && userAns === q.answer) ||
      (q.type === "multi" && isMultiCorrect(userAns as number[], q.answer as number[])) ||
      (q.type === "short" &&
        Array.isArray(q.criteria) &&
        typeof userAns === "string" &&
        q.criteria.some(c => {
          try {
            return new RegExp(c.regex, c.flags || "i").test(userAns.trim());
          } catch {
            return false;
          }
        }))
    );

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0e7ff 0%, #f0fdfa 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
      <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(60,60,120,0.12)', padding: '40px 32px 32px 32px', maxWidth: 700, width: '100%', textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#3730a3', marginBottom: 10 }}>Kérdés-felelet vizsga</h1>
        <div style={{ fontSize: 16, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          {current + 1} / {questions.length} kérdés
        </div>
        <div style={{ fontWeight: 600, color: '#3730a3', fontSize: 17, marginBottom: 12 }}>{q.question}</div>
        {/* Válaszlehetőségek */}
        {q.type === 'single' && (
          <ul style={{ margin: '8px 0', padding: 0 }}>
            {displayed.labels.map((opt: string, i: number) => {
              const optionId = displayed.order[i];
              return (
                <li key={i} style={{
                  background: userAns === optionId ? (showCorrect ? (optionId === q.answer ? '#16a34a' : '#f59e42') : '#6366f1') : '#f3f4f6',
                  color: userAns === optionId ? '#fff' : '#1e293b',
                  borderRadius: 6,
                  padding: '8px 14px',
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  listStyle: 'none',
                  cursor: showCorrect ? 'default' : 'pointer',
                  border: optionId === q.answer && showCorrect ? '2px solid #16a34a' : '2px solid transparent',
                  transition: 'background 0.2s'
                }}
                  onClick={() => !showCorrect && handleAnswer(optionId)}
                >{opt}</li>
              );
            })}
          </ul>
        )}
        {q.type === 'multi' && (
          <>
            <ul style={{ margin: '8px 0', padding: 0 }}>
              {displayed.labels.map((opt: string, i: number) => {
                const optionId = displayed.order[i];
                const checked = Array.isArray(userAns) && userAns.includes(optionId);
                return (
                  <li key={i} style={{
                    background: checked
                      ? showCorrect
                        ? (Array.isArray(q.answer) && q.answer.includes(optionId)
                            ? "#16a34a"
                            : "#f59e42")
                        : "#6366f1"
                      : showCorrect && Array.isArray(q.answer) && q.answer.includes(optionId)
                        ? "#2563eb"
                        : "#f3f4f6",
                    color: checked ? '#fff' : '#1e293b',
                    borderRadius: 6,
                    padding: '8px 14px',
                    marginBottom: 8,
                    fontSize: 16,
                    fontWeight: 500,
                    listStyle: 'none',
                    cursor: showCorrect ? 'default' : 'pointer',
                    border: Array.isArray(q.answer) && q.answer.includes(optionId) && showCorrect ? '2px solid #16a34a' : '2px solid transparent',
                    transition: 'background 0.2s'
                  }}
                    onClick={() => {
                      if (showCorrect) return;
                      let arr = Array.isArray(userAns) ? [...userAns] : [];
                      if (arr.includes(optionId)) arr = arr.filter(x => x !== optionId);
                      else arr.push(optionId);
                      setAnswers(a => ({ ...a, [q.id]: arr }));
                    }}
                  >{opt}</li>
                );
              })}
            </ul>
            {!showCorrect && (
              <button
                onClick={() => handleAnswer(userAns)}
                disabled={!Array.isArray(userAns) || userAns.length === 0}
                style={{ marginTop: 8, padding: '8px 18px', borderRadius: 8, background: '#6366f1', color: 'white', fontWeight: 600, border: 'none', cursor: (!Array.isArray(userAns) || userAns.length === 0) ? 'not-allowed' : 'pointer' }}
              >Válasz</button>
            )}
          </>
        )}
        {q.type === 'short' && (
          <div style={{ margin: '12px 0' }}>
            <input
              type="text"
              value={typeof userAns === 'string' ? userAns : ''}
              onChange={e => !showCorrect && setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
              style={{ fontSize: 16, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #6366f1', width: 320, maxWidth: '100%' }}
              disabled={showCorrect}
              onKeyDown={e => { if (e.key === 'Enter' && !showCorrect) handleAnswer(e.currentTarget.value); }}
            />
            <button onClick={() => handleAnswer(userAns)} disabled={showCorrect || !userAns || typeof userAns !== 'string'} style={{ marginLeft: 10, padding: '8px 18px', borderRadius: 8, background: '#6366f1', color: 'white', fontWeight: 600, border: 'none', cursor: showCorrect ? 'not-allowed' : 'pointer' }}>Válasz</button>
          </div>
        )}
        {/* Helyes válasz visszajelzés */}
        {showCorrect && (
          <div style={{ marginTop: 18, marginBottom: 8, fontSize: 16, fontWeight: 500 }}>
            {isCorrect ? <span style={{ color: '#16a34a' }}>✔️ Helyes válasz!</span> : <span style={{ color: '#dc2626' }}>❌ Hibás válasz.</span>}
            <div style={{ marginTop: 8, color: '#334155', fontSize: 15 }}>
              <b>Helyes válasz:</b> {q.type === 'single' ? q.options[q.answer as number] : q.type === 'multi' ? (Array.isArray(q.answer) ? (q.answer as number[]).slice().sort((a,b) => a - b).map(i => q.options[i]).join(", ") : '') : q.type === 'short' && Array.isArray(q.criteria) && q.criteria.length > 0 && typeof q.criteria[0] === 'object' && 'regex' in q.criteria[0] ? <span style={{fontFamily:'monospace'}}>{q.criteria[0].regex}</span> : ''}
            </div>
            <button onClick={nextQuestion} style={{ marginTop: 16, padding: '8px 22px', borderRadius: 8, background: '#6366f1', color: 'white', fontWeight: 600, border: 'none', cursor: 'pointer' }}>{current + 1 === questions.length ? 'Befejezés' : 'Következő kérdés'}</button>
          </div>
        )}
      </div>
    </main>
  );
}
