"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import goldBank from "@/data/questionBank_GOLD.json";
import { Question } from "@/lib/types";

/* ---------- helpers ---------- */

/**
 * Defensive mapping from raw JSON to Question.
 * Accepts both 'típus' and 'tipus' as type keys.
 * Never throws; always returns a valid Question object.
 * If type is unknown or missing, falls back to a default 'single' type.
 * All fields are optional in input; sensible defaults are provided.
 * 
 * Recognized types:
 *   - "single": single choice
 *   - "multi" or "multiple": multiple choice
 *   - "tf": true/false
 *   - "short" or "regex": short answer, regex criteria
 */
function mapJsonToQuestion(json: any): Question {
  try {
    // Defensive: ensure input is an object
    if (!json || typeof json !== "object") throw new Error("Input is not an object");
    // Accept both 'típus' and 'tipus'
    const tipus = json.típus ?? json.tipus ?? "";
    const id = typeof json.id === "number" ? json.id : -1;
    const question = json.kérdés ?? "(Ismeretlen kérdés)";
    const options = Array.isArray(json.válaszlehetőségek) ? json.válaszlehetőségek : [];
    const difficulty =
      json.nehézség === "easy" || json.nehézség === "medium" || json.nehézség === "hard"
        ? json.nehézség
        : "easy";
    const blokk = json.blokk ?? "unknown";
    // Map by type
    if (tipus === "single") {
      return {
        id,
        type: "single",
        question,
        options,
        answer: typeof json.helyes_válasz === "number" ? json.helyes_válasz - 1 : 0,
        difficulty,
        blokk,
      };
    }
    if (tipus === "multi" || tipus === "multiple") {
      return {
        id,
        type: "multi",
        question,
        options,
        answer: Array.isArray(json.helyes_válaszok) ? json.helyes_válaszok : [],
        difficulty,
        blokk,
      };
    }
    if (tipus === "tf") {
      return {
        id,
        type: "tf",
        question,
        answer: typeof json.helyes_válasz !== "undefined" ? json.helyes_válasz : false,
        difficulty,
        blokk,
      };
    }
    if (tipus === "short" || tipus === "regex") {
      return {
        id,
        type: "short",
        question,
        criteria: json.helyes_regex ? [{ regex: json.helyes_regex }] : [],
        difficulty,
        blokk,
      };
    }
    // Unknown type fallback
    return {
      id: -1,
      type: "single",
      question,
      options,
      answer: 0,
      difficulty: "easy",
      blokk,
    };
  } catch (e) {
    // On error, fallback to a safe dummy question
    return {
      id: -1,
      type: "single",
      question: "(Ismeretlen kérdés)",
      options: [],
      answer: 0,
      difficulty: "easy",
      blokk: "unknown",
    };
  }
}

function normalizeStoredAnswer(
  raw: any
): number | number[] | boolean | string | undefined {
  if (raw === null || typeof raw === "undefined") return undefined;

  // Some versions may wrap answers in an object
  if (typeof raw === "object" && !Array.isArray(raw)) {
    if ("value" in raw) return normalizeStoredAnswer((raw as any).value);
    if ("selected" in raw) return normalizeStoredAnswer((raw as any).selected);
    if ("answer" in raw) return normalizeStoredAnswer((raw as any).answer);
  }

  // Arrays (multi-select)
  if (Array.isArray(raw)) {
    return raw
      .map(v => (typeof v === "string" ? Number(v) : v))
      .filter(v => typeof v === "number" && !Number.isNaN(v)) as number[];
  }

  // Booleans sometimes stored as "true"/"false"
  if (typeof raw === "string") {
    const s = raw.trim();
    if (s === "true") return true;
    if (s === "false") return false;

    // CSV string for multi
    if (s.includes(",")) {
      const arr = s
        .split(",")
        .map(v => Number(v.trim()))
        .filter(v => !Number.isNaN(v));
      return arr;
    }

    // Numeric string
    if (!Number.isNaN(Number(s)) && s !== "") return Number(s);

    // Otherwise keep as text (short answer)
    return raw;
  }

  if (typeof raw === "number") return raw;
  if (typeof raw === "boolean") return raw;

  return undefined;
}

function shuffleOptions(options: string[], seed: string) {
  const order = Array.isArray(options) ? options.map((_, i) => i) : [];
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
  return order;
}

/* ---------- page ---------- */

type StoredData = {
  attempt: { questionIds: number[] };
  answers: Record<string, number | number[] | string>;
  result: { total: number; breakdown: Record<string, number> };
};

export default function ExamResultPage() {
  const { attemptId } = useParams();
  const attemptKey = String(attemptId);
  const [data, setData] = useState<StoredData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(`exam-result-${String(attemptId)}`);
    if (!raw) return;
    setData(JSON.parse(raw));
  }, [attemptId]);

  if (!data) {
    return <main style={{ padding: 40 }}>Vizsgaeredmény betöltése…</main>;
  }

  const questionMap = new Map(
    (goldBank as any[]).map(q => {
      const qq = mapJsonToQuestion(q);
      return [qq.id, qq];
    })
  );

  // --- Score calculation ---
  const scoreSeed = (qid: number) => `${attemptKey}::${qid}`;
  const scored: number[] = data.attempt.questionIds.map(qid => {
    let score = 0;

    const q = questionMap.get(qid);
    if (!q) return 0;

    const rawAns = data.answers?.[String(qid)];
    const userAns = normalizeStoredAnswer(rawAns);

    if (q.type === "single") {
      if (typeof userAns === "number" && q.options && q.options.length > 0) {
        const order = shuffleOptions(q.options, scoreSeed(qid));
        const chosenOptId = order[userAns];
        if (typeof chosenOptId === "number" && chosenOptId === q.answer) {
          score = 1;
        }
      }
    } else if (q.type === "multi") {
      if (Array.isArray(userAns) && q.options && q.options.length > 0) {
        const order = shuffleOptions(q.options, scoreSeed(qid));
        const chosenOptIds = userAns
          .map(i => order[i])
          .filter((v): v is number => typeof v === "number")
          .sort();
        const correctOptIds = Array.isArray(q.answer)
          ? [...(q.answer as number[])].sort()
          : [];
        if (
          chosenOptIds.length === correctOptIds.length &&
          chosenOptIds.every((v, i) => v === correctOptIds[i])
        ) {
          score = 1;
        }
      }
    } else if (q.type === "tf") {
      if (typeof userAns === "boolean" && userAns === q.answer) {
        score = 1;
      }
    } else if (q.type === "short") {
      if (
        typeof userAns === "string" &&
        (q.criteria?.some(c => new RegExp(c.regex, "i").test(userAns)) ?? false)
      ) {
        score = 1;
      }
    }

    return score;
  });

  const totalScore = scored.reduce((a, b) => a + b, 0);
  const maxScore = data.attempt.questionIds.length;

  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Vizsgaeredmény</h1>
      <div style={{ marginBottom: 20, fontSize: 18, fontWeight: 700 }}>
        Pontszám: {totalScore} / {maxScore}
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.attempt.questionIds.map((qid, idx) => {
          const q = questionMap.get(qid);
          if (!q) return null;

          const rawAns = data.answers?.[String(qid)];

          const userAns = normalizeStoredAnswer(rawAns);
          const seed = `${attemptKey}::${qid}`;

          let isCorrect = false;

          if (q.type === "single") {
            if (typeof userAns === "number" && q.options && q.options.length > 0) {
              const order = shuffleOptions(q.options, seed);
              const chosenOptId = order[userAns];
              isCorrect = typeof chosenOptId === "number" && chosenOptId === q.answer;
            } else {
              isCorrect = false;
            }
          }

          if (q.type === "multi") {
            if (Array.isArray(userAns) && q.options && q.options.length > 0) {
              const order = shuffleOptions(q.options, seed);
              const chosenOptIds = userAns
                .map(i => order[i])
                .filter((v): v is number => typeof v === "number")
                .sort();
              const correctOptIds = Array.isArray(q.answer) ? [...(q.answer as number[])].sort() : [];
              isCorrect =
                chosenOptIds.length === correctOptIds.length &&
                chosenOptIds.every((v, i) => v === correctOptIds[i]);
            } else {
              isCorrect = false;
            }
          }

          if (q.type === "tf") {
            isCorrect =
              typeof userAns === "boolean" &&
              userAns === q.answer;
          }

          if (q.type === "short") {
            isCorrect =
              typeof userAns === "string" &&
              (q.criteria?.some(c => new RegExp(c.regex, "i").test(userAns)) ?? false);
          }

          return (
            <li key={qid} style={{ marginBottom: 28 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                {idx + 1}. {q.question}
              </div>

              {q.type === "single" || q.type === "multi" ? (() => {
                if (!q.options || q.options.length === 0) return null;
                const order = shuffleOptions(q.options ?? [], seed);
                const selected =
                  typeof userAns === "number"
                    ? [userAns]
                    : Array.isArray(userAns)
                    ? userAns
                    : [];

                const correct =
                  q.type === "single"
                    ? [q.answer as number]
                    : Array.isArray(q.answer)
                    ? q.answer
                    : [];

                return (
                  <>
                    <ul style={{ marginTop: 8, padding: 0 }}>
                      {order.map((optId, i) => {
                        const isUser = selected.includes(i);
                        const isCorrectOpt = correct.includes(optId);

                        let bg = "#1e293b";
                        if (isUser && isCorrectOpt) bg = "#16a34a";
                        else if (isUser && !isCorrectOpt) bg = "#f59e42";
                        else if (!isUser && isCorrectOpt) bg = "#2563eb";

                        return (
                          <li
                            key={i}
                            style={{
                              background: bg,
                              color: "#fff",
                              borderRadius: 6,
                              padding: "6px 12px",
                              marginBottom: 6,
                              display: "inline-block",
                              marginRight: 6,
                            }}
                          >
                            {q.options?.[optId] ?? ""}
                          </li>
                        );
                      })}
                    </ul>
                    <div style={{ marginTop: 6, fontSize: 14, color: '#334155' }}>
                      <b>Helyes válasz:</b>{' '}
                      {(() => {
                        const correctIds = q.type === 'single'
                          ? [q.answer as number]
                          : Array.isArray(q.answer)
                          ? q.answer
                          : [];
                        return correctIds
                          .map((cid: number) => q.options?.[cid])
                          .filter(Boolean)
                          .join(', ');
                      })()}
                    </div>
                  </>
                );
              })() : null}

              {q.type === "short" ? (
                <div style={{ marginTop: 10, fontSize: 14, color: "#334155" }}>
                  <div>
                    <b>Válaszod:</b>{" "}
                    {typeof userAns === "string" && userAns.trim() !== "" ? userAns : "(nincs megadva)"}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <b>Elfogadott minta:</b>{" "}
                    {q.criteria && q.criteria.length > 0
                      ? q.criteria.map(c => c.regex).filter(Boolean).join(" | ")
                      : "(nincs megadva)"}
                  </div>
                </div>
              ) : null}

              {q.type === "tf" ? (
                <div style={{ marginTop: 10, fontSize: 14, color: "#334155" }}>
                  <div>
                    <b>Válaszod:</b>{" "}
                    {typeof userAns === "boolean" ? (userAns ? "IGAZ" : "HAMIS") : "(nincs megadva)"}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <b>Helyes válasz:</b> {(q.answer as boolean) ? "IGAZ" : "HAMIS"}
                  </div>
                </div>
              ) : null}

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
      <div style={{ marginTop: 32, fontSize: 14 }}>
        <div><span style={{ color: "#16a34a", fontWeight: 700 }}>Zöld</span>: helyes válaszod</div>
        <div><span style={{ color: "#f59e42", fontWeight: 700 }}>Narancs</span>: hibásan jelölt válasz</div>
        <div><span style={{ color: "#2563eb", fontWeight: 700 }}>Kék</span>: helyes válasz (nem jelölt)</div>
      </div>
    </main>
  );
}
