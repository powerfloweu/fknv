
"use client";

// --- answer normalizer: always map display indexes to optionIds using order ---
function toOptionIds(
  q: Question,
  userAns: number | number[] | boolean | string | undefined,
  order: number[]
): number | number[] | boolean | string | undefined {
  if (q.type === "single" && typeof userAns === "number") {
    return order[userAns];
  }
  if (q.type === "multi" && Array.isArray(userAns)) {
    return userAns
      .map(i => order[i])
      .filter(v => typeof v === "number");
  }
  return userAns;
}

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
    answer: Array.isArray(json.helyes_válaszok)
      ? json.helyes_válaszok.map((v: number) => v - 1)
      : [],
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

function resolveSingleChoice(
  userAns: number,
  order: number[],
  optionCount: number,
  correctOptId: number
): { chosenOptId?: number; chosenDisplayIdx?: number } {
  const fromIndexOptId = userAns >= 0 && userAns < order.length ? order[userAns] : undefined;
  const fromOptIdOptId = userAns >= 0 && userAns < optionCount ? userAns : undefined;

  // If exactly one interpretation matches the correct answer, prefer that.
  const indexMatches = typeof fromIndexOptId === "number" && fromIndexOptId === correctOptId;
  const optIdMatches = typeof fromOptIdOptId === "number" && fromOptIdOptId === correctOptId;

  if (indexMatches && !optIdMatches) {
    return { chosenOptId: fromIndexOptId, chosenDisplayIdx: userAns };
  }
  if (optIdMatches && !indexMatches) {
    return { chosenOptId: fromOptIdOptId, chosenDisplayIdx: order.indexOf(fromOptIdOptId) };
  }

  // Otherwise default to DISPLAY INDEX (this matches how the UI is clicked),
  // but fall back to option id if index is not valid.
  if (typeof fromIndexOptId === "number") {
    return { chosenOptId: fromIndexOptId, chosenDisplayIdx: userAns };
  }
  if (typeof fromOptIdOptId === "number") {
    return { chosenOptId: fromOptIdOptId, chosenDisplayIdx: order.indexOf(fromOptIdOptId) };
  }
  return {};
}

function resolveMultiChoice(
  userAns: number[],
  order: number[],
  optionCount: number,
  correctOptIds: number[]
): { chosenOptIds: number[]; chosenDisplayIdxs: number[] } {
  const correctSet = new Set(correctOptIds);

  const chosenOptIds: number[] = [];
  const chosenDisplayIdxs: number[] = [];

  for (const v of userAns) {
    const fromIndexOptId = v >= 0 && v < order.length ? order[v] : undefined;
    const fromOptIdOptId = v >= 0 && v < optionCount ? v : undefined;

    const indexMatches = typeof fromIndexOptId === "number" && correctSet.has(fromIndexOptId);
    const optIdMatches = typeof fromOptIdOptId === "number" && correctSet.has(fromOptIdOptId);

    // Prefer the interpretation that lands inside the correct set when only one does.
    if (indexMatches && !optIdMatches && typeof fromIndexOptId === "number") {
      chosenOptIds.push(fromIndexOptId);
      chosenDisplayIdxs.push(v);
      continue;
    }
    if (optIdMatches && !indexMatches && typeof fromOptIdOptId === "number") {
      chosenOptIds.push(fromOptIdOptId);
      chosenDisplayIdxs.push(order.indexOf(fromOptIdOptId));
      continue;
    }

    // Otherwise default to display index if valid.
    if (typeof fromIndexOptId === "number") {
      chosenOptIds.push(fromIndexOptId);
      chosenDisplayIdxs.push(v);
      continue;
    }
    // Fallback to option id.
    if (typeof fromOptIdOptId === "number") {
      chosenOptIds.push(fromOptIdOptId);
      chosenDisplayIdxs.push(order.indexOf(fromOptIdOptId));
    }
  }

  // De-duplicate and sort for stable comparisons
  const uniqOpt = Array.from(new Set(chosenOptIds)).sort((a, b) => a - b);
  const uniqIdx = Array.from(new Set(chosenDisplayIdxs)).filter(i => i >= 0).sort((a, b) => a - b);

  return { chosenOptIds: uniqOpt, chosenDisplayIdxs: uniqIdx };
}

/* ---------- page ---------- */

type StoredData = {
  attempt: { questionIds: number[] };
  answers: Record<string, number | number[] | string>;
  orders?: Record<string, number[]>; // qid -> shuffled option id order used during the attempt
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
  const getOrder = (qid: number, q: Question): number[] => {
    if (q.type !== "single" && q.type !== "multi") return [];

    const stored = data.orders?.[String(qid)];
    if (Array.isArray(stored) && stored.length === q.options.length) {
      return stored;
    }

    return shuffleOptions(q.options, scoreSeed(qid));
  };
  const scored: number[] = data.attempt.questionIds.map(qid => {
    let score = 0;

    const q = questionMap.get(qid);
    if (!q) return 0;

    const rawAns = data.answers?.[String(qid)];
    const userAns = normalizeStoredAnswer(rawAns);
    const hasStoredOrder = Array.isArray(data.orders?.[String(qid)]);

    if (q.type === "single") {
      if (typeof userAns === "number" && q.options && q.options.length > 0) {
        if (hasStoredOrder) {
          const chosen = toOptionIds(q, userAns, getOrder(qid, q));
          score = chosen === (q.answer as number) ? 1 : 0;
        } else {
          // Fallback to old logic
          const order = shuffleOptions(q.options, scoreSeed(qid));
          const resolved = resolveSingleChoice(userAns, order, q.options.length, q.answer as number);
          if (resolved.chosenOptId === (q.answer as number)) score = 1;
        }
      }
    } else if (q.type === "multi") {
      if (Array.isArray(userAns) && q.options && q.options.length > 0) {
        if (hasStoredOrder) {
          const correctOptIds = Array.isArray(q.answer)
            ? [...(q.answer as number[])].sort((a,b)=>a-b)
            : [];

          const chosenOptIds = Array.isArray(toOptionIds(q, userAns, getOrder(qid, q)))
            ? [...new Set(toOptionIds(q, userAns, getOrder(qid, q)) as number[])].sort((a,b)=>a-b)
            : [];

          score =
            chosenOptIds.length === correctOptIds.length &&
            chosenOptIds.every((v, i) => v === correctOptIds[i])
              ? 1
              : 0;
        } else {
          // Fallback to old logic
          const order = shuffleOptions(q.options, scoreSeed(qid));
          const correctOptIds = Array.isArray(q.answer) ? [...(q.answer as number[])].sort((a,b)=>a-b) : [];
          const resolved = resolveMultiChoice(userAns, order, q.options.length, correctOptIds);
          const chosenOptIds = resolved.chosenOptIds;
          if (
            chosenOptIds.length === correctOptIds.length &&
            chosenOptIds.every((v, i) => v === correctOptIds[i])
          ) {
            score = 1;
          }
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

  const percentScore = Math.round((totalScore / maxScore) * 100);

  const blockStats = data.attempt.questionIds.reduce<Record<string, { correct: number; total: number }>>(
    (acc, qid, idx) => {
      const q = questionMap.get(qid);
      if (!q) return acc;
      const block = q.blokk ?? "unknown";
      if (!acc[block]) acc[block] = { correct: 0, total: 0 };
      acc[block].total += 1;
      acc[block].correct += scored[idx] ?? 0;
      return acc;
    },
    {}
  );

  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>Vizsgaeredmény</h1>
      <div
        style={{
          marginBottom: 20,
          padding: 16,
          borderRadius: 10,
          background: "#0f172a",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          Pontszám: {totalScore} / {maxScore} ({percentScore}%)
        </div>

        <div
          style={{
            marginTop: 10,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            fontSize: 14,
          }}
        >
          {Object.entries(blockStats).map(([block, s]) => {
            const p = Math.round((s.correct / s.total) * 100);
            return (
              <div
                key={block}
                style={{
                  background: "#020617",
                  borderRadius: 8,
                  padding: "8px 10px",
                }}
              >
                <div style={{ fontWeight: 700 }}>{block}</div>
                <div>
                  {s.correct}/{s.total} ({p}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          marginBottom: 28,
          padding: 14,
          borderRadius: 10,
          background: "#f1f5f9",
          fontSize: 14,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Jelmagyarázat</div>
        <div><span style={{ color: "#16a34a", fontWeight: 700 }}>Zöld</span>: helyes válaszod</div>
        <div><span style={{ color: "#f59e42", fontWeight: 700 }}>Narancs</span>: hibásan jelölt válasz</div>
        <div><span style={{ color: "#2563eb", fontWeight: 700 }}>Kék</span>: helyes válasz (nem jelölt)</div>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {data.attempt.questionIds.map((qid, idx) => {
          const q = questionMap.get(qid);
          if (!q) return null;

          const rawAns = data.answers?.[String(qid)];
          const userAns = normalizeStoredAnswer(rawAns);
          const seed = `${attemptKey}::${qid}`;
          const order = getOrder(qid, q);
          const hasStoredOrder = Array.isArray(data.orders?.[String(qid)]);

          let isCorrect = false;
          if (q.type === "single") {
            if (typeof userAns === "number" && q.options && q.options.length > 0) {
              if (hasStoredOrder) {
                const chosen = toOptionIds(q, userAns, order);
                isCorrect = chosen === (q.answer as number);
              } else {
                const resolved = resolveSingleChoice(userAns, order, q.options.length, q.answer as number);
                isCorrect = resolved.chosenOptId === (q.answer as number);
              }
            } else {
              isCorrect = false;
            }
          }
          if (q.type === "multi") {
            if (Array.isArray(userAns) && q.options && q.options.length > 0) {
              if (hasStoredOrder) {
                const correctOptIds = Array.isArray(q.answer)
                  ? [...(q.answer as number[])].sort((a, b) => a - b)
                  : [];

                const chosenOptIds = Array.isArray(toOptionIds(q, userAns, order))
                  ? [...new Set(toOptionIds(q, userAns, order) as number[])].sort((a, b) => a - b)
                  : [];

                isCorrect =
                  chosenOptIds.length === correctOptIds.length &&
                  chosenOptIds.every((v, i) => v === correctOptIds[i]);
              } else {
                const correctOptIds = Array.isArray(q.answer)
                  ? [...(q.answer as number[])].sort((a, b) => a - b)
                  : [];
                const resolved = resolveMultiChoice(userAns, order, q.options.length, correctOptIds);
                const chosenOptIds = resolved.chosenOptIds;
                isCorrect =
                  chosenOptIds.length === correctOptIds.length &&
                  chosenOptIds.every((v, i) => v === correctOptIds[i]);
              }
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
                // Use order from getOrder
                let selected: number[] = [];
                if (hasStoredOrder) {
                  // New logic: answers are option ids, order is the stored order
                  if (q.type === "single" && typeof userAns === "number") {
                    const displayIdx = order.indexOf(userAns);
                    if (displayIdx >= 0) selected = [displayIdx];
                  } else if (q.type === "multi" && Array.isArray(userAns)) {
                    selected = userAns
                      .map(optId => order.indexOf(optId))
                      .filter(i => i >= 0);
                  }
                } else {
                  // Fallback to old logic
                  if (q.type === "single" && typeof userAns === "number") {
                    const resolved = resolveSingleChoice(userAns, order, q.options.length, q.answer as number);
                    if (typeof resolved.chosenDisplayIdx === "number" && resolved.chosenDisplayIdx >= 0) {
                      selected = [resolved.chosenDisplayIdx];
                    }
                  } else if (q.type === "multi" && Array.isArray(userAns)) {
                    const correctOptIds = Array.isArray(q.answer) ? (q.answer as number[]) : [];
                    const resolved = resolveMultiChoice(userAns, order, q.options.length, correctOptIds);
                    selected = resolved.chosenDisplayIdxs;
                  }
                }

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
    </main>
  );
}
