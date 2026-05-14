"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import questionsRaw from "@/data/idegzavarokQuestionBank.json";

type Q = {
  id: number; topicNum: number; topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "single" | "multi" | "tf" | "matching";
  question: string; options: string[];
  answer: number | number[] | boolean | number[][];
  explanation: string;
  leftItems?: string[];
  rightItems?: string[];
  category?: "uj" | "konnyu";
  vizsgakerdes?: boolean;
};

const diffLabel: Record<string, string> = { easy: "Könnyű", medium: "Közepes", hard: "Nehéz" };
const diffColor: Record<string, string> = { easy: "#16a34a", medium: "#ca8a04", hard: "#dc2626" };
const catLabel: Record<string, string> = { uj: "Új!", konnyu: "Könnyű" };
const catColor: Record<string, string> = { uj: "#db2777", konnyu: "#0891b2" };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q: Q): Q {
  if (q.type !== "single" && q.type !== "multi") return q;
  const n = q.options.length;
  const perm = shuffle(Array.from({ length: n }, (_, i) => i));
  const inv = new Array<number>(n);
  for (let i = 0; i < n; i++) inv[perm[i]] = i;
  const newOptions = perm.map(oi => q.options[oi]);
  const newAnswer = q.type === "single"
    ? inv[(q.answer as number) - 1] + 1
    : (q.answer as number[]).map(a => inv[a - 1] + 1).sort((a, b) => a - b);
  return { ...q, options: newOptions, answer: newAnswer };
}

// matching sel: Record<leftIndex, rightIndex[]>  (1-based rightItems indices)
type MatchingSel = Record<number, number[]>;
type AnySel = number | number[] | boolean | MatchingSel | null;

function isMatchingCorrect(q: Q, sel: MatchingSel): boolean {
  const ans = q.answer as number[][];
  if (!q.leftItems) return false;
  for (let li = 0; li < q.leftItems.length; li++) {
    const expected = [...(ans[li] || [])].sort().join(",");
    const got = [...(sel[li] || [])].sort().join(",");
    if (expected !== got) return false;
  }
  return true;
}

function isAnyCorrect(q: Q, sel: AnySel): boolean {
  if (sel === null) return false;
  if (q.type === "single") return sel === q.answer;
  if (q.type === "tf") return sel === q.answer;
  if (q.type === "multi" && Array.isArray(sel) && Array.isArray(q.answer))
    return [...sel].sort().join() === [...(q.answer as number[])].sort().join();
  if (q.type === "matching" && typeof sel === "object" && !Array.isArray(sel))
    return isMatchingCorrect(q, sel as MatchingSel);
  return false;
}

function MatchingInput({ q, sel, setSel, submitted }: {
  q: Q; sel: MatchingSel;
  setSel: (s: MatchingSel) => void;
  submitted: boolean;
}) {
  const ans = q.answer as number[][];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginTop: 8 }}>
      <thead>
        <tr>
          <th style={{ textAlign: "left", padding: "5px 8px", background: "#fde68a", color: "#7c2d12", borderRadius: "6px 0 0 0" }}>Kategória</th>
          <th style={{ textAlign: "left", padding: "5px 8px", background: "#fde68a", color: "#7c2d12", borderRadius: "0 6px 0 0" }}>Válasz(ok)</th>
        </tr>
      </thead>
      <tbody>
        {(q.leftItems || []).map((left, li) => {
          const correctIdxs = ans[li] || [];
          const chosen = sel[li] || [];
          return (
            <tr key={li} style={{ borderBottom: "1px solid #fde68a" }}>
              <td style={{ padding: "6px 8px", fontWeight: 600, color: "#7c2d12", verticalAlign: "top", width: "35%" }}>{left}</td>
              <td style={{ padding: "6px 8px" }}>
                {(q.rightItems || []).map((right, ri) => {
                  const idx1 = ri + 1;
                  const isChosen = chosen.includes(idx1);
                  const isCorrect = correctIdxs.includes(idx1);
                  let bg = "#f9fafb", color = "#374151";
                  if (submitted) {
                    if (isCorrect) { bg = "#bbf7d0"; color = "#166534"; }
                    else if (isChosen) { bg = "#fecaca"; color = "#991b1b"; }
                  } else if (isChosen) { bg = "#fde68a"; color = "#7c2d12"; }
                  return (
                    <label key={ri} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 6, background: bg, color, cursor: submitted ? "default" : "pointer", marginBottom: 3, fontSize: 13 }}>
                      <input type="checkbox" disabled={submitted} checked={isChosen}
                        onChange={() => {
                          const arr = [...chosen];
                          const pos = arr.indexOf(idx1);
                          if (pos >= 0) arr.splice(pos, 1); else arr.push(idx1);
                          setSel({ ...sel, [li]: arr.sort((a, b) => a - b) });
                        }} />
                      {right}
                    </label>
                  );
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function NormalVizsga() {
  const params = useSearchParams();
  const router = useRouter();
  const topicFilter = params.get("topic") ? Number(params.get("topic")) : null;
  const diffFilter = params.get("diff") || null;
  const typeFilter = params.get("qtype") || null;
  const onlyUj = params.get("uj") === "1";
  const onlyVizsga = params.get("vizsga") === "1";
  const count = Number(params.get("count") || 20);

  const questions: Q[] = useState<Q[]>(() => {
    const pool = (questionsRaw as unknown as Q[]).filter((q) => {
      if (topicFilter && q.topicNum !== topicFilter) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (onlyUj && q.category !== "uj") return false;
      if (onlyVizsga && !q.vizsgakerdes) return false;
      return true;
    });
    return shuffle(pool).slice(0, count).map(shuffleOptions);
  })[0];

  const [selections, setSelections] = useState<Record<number, AnySel>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of questions) {
      if (isAnyCorrect(q, selections[q.id] ?? null)) correct++;
    }
    return { correct, total: questions.length };
  }, [submitted, questions, selections]);

  const pct = score ? Math.round((100 * score.correct) / Math.max(1, score.total)) : 0;

  function setSingle(qid: number, v: number) { setSelections(p => ({ ...p, [qid]: v })); }
  function toggleMulti(qid: number, v: number) {
    setSelections(p => {
      const arr = Array.isArray(p[qid]) ? (p[qid] as number[]) : [];
      return { ...p, [qid]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v].sort((a, b) => a - b) };
    });
  }
  function setTf(qid: number, v: boolean) { setSelections(p => ({ ...p, [qid]: v })); }
  function setMatching(qid: number, ms: MatchingSel) { setSelections(p => ({ ...p, [qid]: ms })); }

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(120deg, #fef3c7 0%, #fce7f3 100%)", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12 }}>
        <Link href="/idegzavarok/vizsga" style={{ color: "#9a3412", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #fdba74" }}>
          ← Vizsga beállítások
        </Link>
        {submitted && score && (
          <div style={{ fontWeight: 700, color: "#9a3412", fontSize: 16 }}>
            Eredmény: {score.correct} / {score.total} ({pct}%)
          </div>
        )}
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(120,80,60,0.10)", padding: "24px", maxWidth: 860, width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#9a3412", marginBottom: 4 }}>Normál vizsga</h1>
        <div style={{ fontSize: 14, color: "#92400e", marginBottom: 20 }}>{questions.length} kérdés — jelöld be a válaszokat, majd kérj kiértékelést</div>

        {submitted && score && (
          <div style={{ background: pct >= 60 ? "#dcfce7" : "#fee2e2", border: `1.5px solid ${pct >= 60 ? "#16a34a" : "#dc2626"}`, borderRadius: 12, padding: "14px 20px", marginBottom: 20, textAlign: "center", fontSize: 18, fontWeight: 700, color: pct >= 60 ? "#166534" : "#991b1b" }}>
            {score.correct} / {score.total} helyes válasz ({pct}%)
            {pct >= 60 ? " — Gratulálunk!" : " — Még gyakorolj!"}
          </div>
        )}

        <ol style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
          {questions.map((q, qi) => {
            const sel = selections[q.id] ?? null;
            const reveal = submitted;

            function optBg(idx1: number) {
              const isAns = q.type === "single" ? q.answer === idx1 : Array.isArray(q.answer) && (q.answer as number[]).includes(idx1);
              const isSel = q.type === "single" ? sel === idx1 : Array.isArray(sel) && (sel as number[]).includes(idx1);
              if (!reveal) return isSel ? "#fde68a" : "#f9fafb";
              if (isAns) return "#bbf7d0";
              if (isSel && !isAns) return "#fecaca";
              return "#f9fafb";
            }
            function optColor(idx1: number) {
              const isAns = q.type === "single" ? q.answer === idx1 : Array.isArray(q.answer) && (q.answer as number[]).includes(idx1);
              const isSel = q.type === "single" ? sel === idx1 : Array.isArray(sel) && (sel as number[]).includes(idx1);
              if (!reveal) return isSel ? "#7c2d12" : "#374151";
              if (isAns) return "#166534";
              if (isSel && !isAns) return "#991b1b";
              return "#374151";
            }
            function tfBg(v: boolean) {
              if (!reveal) return sel === v ? "#fde68a" : "#f9fafb";
              if (q.answer === v) return "#bbf7d0";
              if (sel === v) return "#fecaca";
              return "#f9fafb";
            }

            return (
              <li key={q.id} style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: "#7c2d12", fontSize: 15 }}>
                    <span style={{ color: "#b45309", marginRight: 6 }}>{qi + 1}.</span>{q.question}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {q.category && (
                      <span style={{ background: catColor[q.category], color: "white", fontSize: 11, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                        {catLabel[q.category]}
                      </span>
                    )}
                    {q.vizsgakerdes && (
                      <span style={{ background: "#1d4ed8", color: "white", fontSize: 11, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                        Vizsgakérdés
                      </span>
                    )}
                    <span style={{ background: diffColor[q.difficulty], color: "white", fontSize: 11, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                      {diffLabel[q.difficulty]}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>{q.topicNum}. {q.topic}</div>

                {(q.type === "single" || q.type === "multi") && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0 0" }}>
                    {q.options.map((opt, i) => {
                      const idx1 = i + 1;
                      const isSel = q.type === "single" ? sel === idx1 : Array.isArray(sel) && (sel as number[]).includes(idx1);
                      return (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", borderRadius: 8, cursor: submitted ? "default" : "pointer", background: optBg(idx1), color: optColor(idx1), fontSize: 14 }}>
                            <input type={q.type === "single" ? "radio" : "checkbox"} name={`q-${q.id}`} disabled={submitted} checked={isSel || false}
                              onChange={() => q.type === "single" ? setSingle(q.id, idx1) : toggleMulti(q.id, idx1)}
                              style={{ marginTop: 2 }} />
                            <span><b>{String.fromCharCode(65 + i)})</b> {opt}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {q.type === "tf" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    {([true, false] as const).map((v) => (
                      <label key={String(v)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, cursor: submitted ? "default" : "pointer", background: tfBg(v), color: tfBg(v) === "#bbf7d0" ? "#166534" : tfBg(v) === "#fecaca" ? "#991b1b" : "#374151", fontSize: 14 }}>
                        <input type="radio" name={`q-${q.id}`} disabled={submitted} checked={sel === v} onChange={() => setTf(q.id, v)} />
                        {v ? "Igaz" : "Hamis"}
                      </label>
                    ))}
                  </div>
                )}

                {q.type === "matching" && q.leftItems && q.rightItems && (
                  <MatchingInput q={q}
                    sel={typeof sel === "object" && sel !== null && !Array.isArray(sel) ? sel as MatchingSel : {}}
                    setSel={(ms) => setMatching(q.id, ms)}
                    submitted={submitted} />
                )}

                {reveal && q.explanation && (
                  <div style={{ marginTop: 8, padding: "6px 10px", background: "#ecfeff", border: "1px solid #67e8f9", borderRadius: 7, color: "#155e75", fontSize: 12 }}>
                    <b>Magyarázat:</b> {q.explanation}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          {!submitted ? (
            <button onClick={() => setSubmitted(true)} style={{ padding: "12px 28px", background: "linear-gradient(90deg,#f97316,#fb923c)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Kiértékelés
            </button>
          ) : (
            <button onClick={() => router.push("/idegzavarok/vizsga")} style={{ padding: "12px 28px", background: "white", color: "#9a3412", border: "1.5px solid #fdba74", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Új vizsga
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function NormalVizsgaPage() {
  return <Suspense><NormalVizsga /></Suspense>;
}
