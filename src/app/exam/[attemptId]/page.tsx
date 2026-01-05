
 "use client";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import goldBank from "@/data/questionBank_GOLD.json";
import { ExamAttempt } from "@/lib/types";

type Question = {
  id: number;
  blokk: string;
  téma: string;
  típus: "single" | "multiple" | "regex" | string;
  nehézség: string;
  kérdés: string;
  válaszlehetőségek?: string[];
  helyes_válasz?: number; // 1-based index
  helyes_válaszok?: number[]; // 1-based indices
  helyes_regex?: string;
  forrás_téma?: string;
  forrás_témák?: string[];
};

// Helper to load localStorage and parse as expected structure

// Helper to load localStorage and parse as expected structure
function loadLocal(key: string): { attempt?: ExamAttempt; answers?: Record<string, unknown>; startTs?: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`exam-result-${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as { attempt?: ExamAttempt; answers?: Record<string, unknown>; startTs?: number };
  } catch {
    return null;
  }
}

// Deterministic shuffle compatible with QA model (optionId-based, 0-based, deterministic)
function getShuffledOptions(q: Question, seedKey: string): { ids: number[]; labels: string[] } {
  const opts = q.válaszlehetőségek ?? [];
  const ids = opts.map((_, i) => i); // 0-based optionIds
  let h = 2166136261;
  for (let i = 0; i < seedKey.length; i++) {
    h ^= seedKey.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  function rng() {
    let t = (h += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return { ids, labels: ids.map(i => opts[i]) };
}




function ExamPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(60);

  const [startTs, setStartTs] = useState<number | null>(null);
  const submittedRef = useRef(false);

  const preparedQuestions = useMemo(() => {
    return goldBank as unknown as Question[];
  }, []);

  const qid = attempt?.questionIds?.[currentQuestionIndex];
  const key = String(qid);

  // Minimal localStorage helpers
  function saveLocal(attemptId: string, data: unknown): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("exam-" + attemptId, JSON.stringify(data));
  }

  // Always resolve question and shuffled here, before any early return!
  const question: Question | undefined =
    preparedQuestions.find(q => String(q.id) === String(qid));

  const shuffled = useMemo(() => {
    if (!question) return { ids: [] as number[], labels: [] as string[] };
    const seedKey = `${String(attemptId)}::${String(question.id)}`;
    return getShuffledOptions(question, seedKey);
  }, [question, attemptId]);

  const handleSubmit = useCallback(async () => {
    // Always send answers in backend-expected format: { [qid]: { type, value } }
    const formattedAnswers: Record<string, unknown> = {};
    if (attempt) {
      for (const qid of attempt.questionIds) {
        const question = preparedQuestions.find(q => String(q.id) === String(qid));
        if (!question) continue;
        const ans = answers[String(qid)];
        if (question.típus === "single") {
          // Convert 0-based optionId to 1-based for backend (GOLD)
          formattedAnswers[qid] = { type: "single", value: typeof ans === "number" ? ans + 1 : null };
        } else if (question.típus === "multiple") {
          // Convert 0-based optionIds to 1-based for backend (GOLD)
          formattedAnswers[qid] = { type: "multi", value: Array.isArray(ans) ? (ans as number[]).map(id => id + 1) : [] };
        } else if (question.típus === "regex") {
          formattedAnswers[qid] = { type: "regex", value: typeof ans === "string" && ans.length > 0 ? ans : null };
        }
      }
    }
    try {
      // Submit answers to backend, always send attempt as well (for dev mode fallback)
      const res = await fetch(`/api/exam/${String(attemptId)}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId: String(attemptId), answers: formattedAnswers, attempt })
      });
      // Save answers and attempt to localStorage for result page
      if (res.ok && attempt) {
        const result = await res.json();
        localStorage.setItem(
          `exam-result-${String(attemptId)}`,
          JSON.stringify({
            attempt,
            answers: formattedAnswers,
            result
          })
        );
        localStorage.removeItem("exam-" + String(attemptId));
        setTimeout(() => {
          window.location.href = `/exam/${String(attemptId)}/result`;
        }, 300);
        return;
      } else {
        let errMsg = "";
        try {
          const errJson = await res.json();
          errMsg = errJson?.error || JSON.stringify(errJson);
        } catch {
          try {
            errMsg = await res.text();
          } catch {}
        }
        alert(`A vizsga leadása sikertelen! (HTTP ${res.status}) Hiba: ${errMsg}`);
        return;
      }
    } finally {
      // Only remove and redirect if not already done
      if (localStorage.getItem(`exam-result-${String(attemptId)}`) === null) {
        localStorage.removeItem("exam-" + String(attemptId));
        setTimeout(() => {
          window.location.href = `/exam/${String(attemptId)}/result`;
        }, 300);
      }
    }
  }, [attempt, answers, attemptId, preparedQuestions]);


  // Fetch attempt data on mount
  useEffect(() => {
    async function fetchAttempt() {
      const local = loadLocal(String(attemptId));
      if (local && local.attempt) {
        setAttempt(local.attempt);
        setAnswers(local.answers || {});
        setStartTs(local.startTs || Date.now());
        const elapsed = Math.floor((Date.now() - (local.startTs || Date.now())) / 1000);
        const total = local.attempt.durationSec || 0;
        setRemainingTime(Math.max(0, total - elapsed));
        return;
      }
      // Try to get count from localStorage (set by ExamStartPage)
      let count: number | undefined = undefined;
      try {
        const examMeta = localStorage.getItem("exam-meta");
        if (examMeta) {
          const meta = JSON.parse(examMeta);
          if (meta && meta[String(attemptId)] && typeof meta[String(attemptId)].count === "number") {
            count = meta[String(attemptId)].count;
          }
        }
      } catch {}
      // Fetch from backend with count if available
      const res = await fetch(`/api/exam/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(count ? { seed: attemptId, count } : { seed: attemptId })
      });
      if (res.ok) {
        const data = await res.json();
        setAttempt(data);
        const ts = Date.now();
        setStartTs(ts);
        setRemainingTime(data.durationSec || 0);
        saveLocal(String(attemptId), { attempt: data, answers: {}, startTs: ts });
      }
    }
    fetchAttempt();
  }, [attemptId]);

  // Timer logic
  useEffect(() => {
    if (!attempt || startTs === null) return;
    if (remainingTime <= 0 && !submittedRef.current) {
      submittedRef.current = true;
      handleSubmit();
      return;
    }
    const id = setTimeout(() => setRemainingTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [attempt, startTs, remainingTime, handleSubmit]);

  // Per-question timer
  useEffect(() => {
    setQuestionTime(60);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (questionTime <= 0) {
      // Auto-next if time runs out
      if (attempt) {
        setCurrentQuestionIndex(i => Math.min(attempt.questionIds.length - 1, i + 1));
      }
      setQuestionTime(60);
      return;
    }
    const id = setTimeout(() => setQuestionTime(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [questionTime, currentQuestionIndex, attempt]);

  if (!attempt) return (
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
          Vizsga betöltése...
        </h1>
        <div style={{ fontSize: 17, color: '#6366f1', fontWeight: 500, marginBottom: 18 }}>
          Kérlek, várj amíg a vizsga elindul!
        </div>
      </div>
    </main>
  );



  function renderQuestionContent() {
    if (!question) {
      // Skip to next question if not found
      setTimeout(() => {
        setCurrentQuestionIndex(i => {
          if (!attempt) return i;
          const next = i + 1;
          return next < attempt.questionIds.length ? next : i;
        });
      }, 100);
      return <div style={{color:'red'}}>Question not found, skipping...</div>;
    }
    if (question.típus === "single") {
      return (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(shuffled.labels || []).map((opt, i) => {
              const optionId = shuffled.ids[i]; // 0-based
              const checked = answers[key] === optionId;
              return (
                <li key={i} style={{
                  marginBottom: 10,
                  background: checked ? '#3730a3' : '#f3f4f6',
                  color: checked ? '#fff' : '#1e293b',
                  borderRadius: 8,
                  fontWeight: checked ? 700 : 500,
                  padding: '8px 14px',
                  transition: 'background 0.2s, color 0.2s',
                  display: 'flex', alignItems: 'center',
                  cursor: 'pointer',
                  border: checked ? '2px solid #6366f1' : '2px solid transparent'
                }}>
                  <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={key}
                      checked={checked}
                      onChange={() => setAnswers({ ...answers, [key]: optionId })}
                      style={{ marginRight: 10 }}
                    />
                    {opt}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    if (question.típus === "multiple") {
      return (
        <div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {(shuffled.labels || []).map((opt, i) => {
              const optionId = shuffled.ids[i]; // 0-based
              const checked = Array.isArray(answers[key]) && (answers[key] as number[]).includes(optionId);
              return (
                <li key={i} style={{
                  marginBottom: 10,
                  background: checked ? '#334155' : '#cbd5e1',
                  color: checked ? '#fff' : '#1e293b',
                  borderRadius: 8,
                  fontWeight: checked ? 700 : 500,
                  padding: '8px 14px',
                  transition: 'background 0.2s, color 0.2s',
                  display: 'flex', alignItems: 'center',
                  cursor: 'pointer',
                  border: checked ? '2px solid #6366f1' : '2px solid transparent'
                }}>
                  <label style={{ width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => {
                        let arr: number[] = Array.isArray(answers[key]) ? (answers[key] as number[]) : [];
                        if (e.target.checked) arr = [...arr, optionId];
                        else arr = arr.filter((idx: number) => idx !== optionId);
                        setAnswers({ ...answers, [key]: arr });
                      }}
                      style={{ marginRight: 10 }}
                    />
                    {opt}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    if (question.típus === "regex") {
      return (
        <div>
          <input
            type="text"
            value={typeof answers[key] === 'string' ? answers[key] : ''}
            onChange={e => setAnswers({ ...answers, [key]: e.target.value })}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                setCurrentQuestionIndex(i => {
                  if (!attempt) return i;
                  return Math.min((attempt?.questionIds?.length ?? 1) - 1, i + 1);
                });
              }
            }}
            placeholder="Írd be a választ..."
            style={{ width: "100%", padding: 8, borderRadius: 8, border: '1.5px solid #6366f1', fontSize: 16, color: '#1e293b' }}
            autoFocus
          />
        </div>
      );
    }
    return <div>Unknown question type.</div>;
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
        <div style={{ fontSize: 18, color: '#6366f1', fontWeight: 500, marginBottom: 8 }}>
          Kérdés {currentQuestionIndex + 1} / {attempt?.questionIds?.length ?? 0}
        </div>
        <div style={{ fontSize: 16, color: '#334155', marginBottom: 8 }}>
          Hátralévő idő: <b>{Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, "0")}</b>
        </div>
        <div style={{ fontSize: 16, color: '#334155', marginBottom: 8 }}>
          Kérdésre hátralévő idő: <b>{questionTime}</b> mp
        </div>
        <div style={{ marginTop: 16, marginBottom: 12 }}>
          <h2 style={{ fontWeight: 600, color: '#3730a3' }}>
            {question?.kérdés}
          </h2>
        </div>
        <div>
          {renderQuestionContent()}
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <button onClick={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))} disabled={currentQuestionIndex === 0} style={{
            background: '#e0e7ff', color: '#3730a3', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 22px', cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer' }}>Vissza</button>
          <button onClick={() => setCurrentQuestionIndex(i => {
            if (!attempt) return i;
            return Math.min((attempt?.questionIds?.length ?? 1) - 1, i + 1);
          })} disabled={!attempt || currentQuestionIndex === (attempt.questionIds?.length ?? 1) - 1} style={{
            background: '#e0e7ff', color: '#3730a3', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 22px', cursor: !attempt || currentQuestionIndex === (attempt.questionIds?.length ?? 1) - 1 ? 'not-allowed' : 'pointer' }}>Tovább</button>
          <button onClick={handleSubmit} style={{
            background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)', color: 'white', fontWeight: 600, border: 'none', borderRadius: 8, padding: '10px 22px', marginLeft: 8, cursor: 'pointer' }}>Vizsga leadása</button>
        </div>
      </div>
      <div style={{ color: '#64748b', fontSize: 15, marginTop: 8, textAlign: 'center' }}>
        <span role="img" aria-label="brain">🧠</span> Sok sikert!
      </div>
    </main>
  );
}

export default ExamPage;
