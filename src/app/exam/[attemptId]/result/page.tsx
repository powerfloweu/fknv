"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type StoredAnswer = {
  selected?: number[] | number;
  displayedCorrect?: number[];
  displayedOptions?: string[];
};

type ExamResultData = {
  attempt: {
    questionIds: number[];
  };
  answers: Record<string, StoredAnswer>;
  result: {
    total: number;
    breakdown: Record<string, number>;
  };
};

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const [data, setData] = useState<ExamResultData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`exam-result-${String(attemptId)}`);
      if (!raw) return;
      setData(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to load exam result", e);
    }
  }, [attemptId]);

  if (!data) {
    return (
      <main style={{ padding: 40, textAlign: "center" }}>
        <h2>Vizsgaeredmény betöltése…</h2>
      </main>
    );
  }

  const { attempt, answers, result } = data;
  const totalQuestions =
    Array.isArray(attempt.questionIds) && attempt.questionIds.length > 0
      ? attempt.questionIds.length
      : 1;

  const percent = Math.round((result.total / totalQuestions) * 100);

  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Vizsgaeredmény</h1>
      <p>
        Elért pontszám: <b>{result.total} / {totalQuestions}</b> ({percent}%)
      </p>

      <hr style={{ margin: "24px 0" }} />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {attempt.questionIds.map((qid, index) => {
          const answer = answers?.[String(qid)];
          const isCorrect = result.breakdown?.[qid] > 0;

          const selected =
            typeof answer?.selected === "number"
              ? [answer.selected]
              : Array.isArray(answer?.selected)
              ? answer.selected
              : [];

          return (
            <li key={qid} style={{ marginBottom: 28 }}>
              <b>{index + 1}. Kérdés #{qid}</b>

              {/* OPTIONS */}
              {Array.isArray(answer?.displayedOptions) &&
              answer.displayedOptions.length > 0 ? (
                <ul style={{ marginTop: 8, padding: 0 }}>
                  {answer.displayedOptions.map((opt, i) => {
                    const isUser = selected.includes(i);
                    const isCorrectOpt =
                      Array.isArray(answer.displayedCorrect) &&
                      answer.displayedCorrect.includes(i);

                    let background = "#1e293b";
                    let border = "none";

                    if (isUser && isCorrectOpt) {
                      background = "#16a34a";
                      border = "2px solid #fbbf24";
                    } else if (isUser && !isCorrectOpt) {
                      background = "#f59e42";
                      border = "2px solid #fbbf24";
                    } else if (!isUser && isCorrectOpt) {
                      background = "#2563eb";
                      border = "2px solid #2563eb";
                    }

                    return (
                      <li
                        key={i}
                        style={{
                          background,
                          color: "#fff",
                          borderRadius: 6,
                          padding: "6px 12px",
                          marginBottom: 6,
                          display: "inline-block",
                          marginRight: 6,
                          border,
                        }}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div
                  style={{
                    marginTop: 8,
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Nincs megjeleníthető válasz (régi vizsgaadat).
                </div>
              )}

              {/* RESULT */}
              <div
                style={{
                  marginTop: 6,
                  fontWeight: 600,
                  color: isCorrect ? "#16a34a" : "#dc2626",
                }}
              >
                {isCorrect ? "✔️ Helyes" : "❌ Hibás"}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
