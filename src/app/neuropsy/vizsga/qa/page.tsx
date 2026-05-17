"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import questionsRaw from "@/data/neuropsyQuestionBank.json";

type Q = {
  id: number; topicNum: number; topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "single" | "multi" | "tf" | "matching" | "essay";
  question: string; options: string[];
  answer: number | number[] | boolean | number[][];
  explanation: string;
  leftItems?: string[];
  rightItems?: string[];
  category?: "uj" | "konnyu" | "vizsga" | "tobbletismeret";
  vizsgakerdes?: boolean;
  image?: string | null;
  imageAlt?: string | null;
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

function isAnswerCorrect(q: Q, sel: AnySel): boolean {
  if (sel === null) return false;
  if (q.type === "single") return sel === q.answer;
  if (q.type === "tf") return sel === q.answer;
  if (q.type === "multi" && Array.isArray(sel) && Array.isArray(q.answer))
    return [...sel].sort().join() === [...(q.answer as number[])].sort().join();
  if (q.type === "matching" && typeof sel === "object" && !Array.isArray(sel))
    return isMatchingCorrect(q, sel as MatchingSel);
  return false;
}

function MatchingInput({ q, sel, setSel, revealed }: {
  q: Q; sel: MatchingSel;
  setSel: (s: MatchingSel) => void;
  revealed: boolean;
}) {
  const ans = q.answer as number[][];
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 16, textAlign: "left" }}>
      <thead>
        <tr>
          <th style={{ padding: "5px 8px", background: "#ddd6fe", color: "#4c1d95", borderRadius: "6px 0 0 0" }}>Kategória</th>
          <th style={{ padding: "5px 8px", background: "#ddd6fe", color: "#4c1d95", borderRadius: "0 6px 0 0" }}>Válasz(ok)</th>
        </tr>
      </thead>
      <tbody>
        {(q.leftItems || []).map((left, li) => {
          const correctIdxs = ans[li] || [];
          const chosen = sel[li] || [];
          return (
            <tr key={li} style={{ borderBottom: "1px solid #ddd6fe" }}>
              <td style={{ padding: "6px 8px", fontWeight: 600, color: "#4c1d95", verticalAlign: "top", width: "35%" }}>{left}</td>
              <td style={{ padding: "6px 8px" }}>
                {(q.rightItems || []).map((right, ri) => {
                  const idx1 = ri + 1;
                  const isChosen = chosen.includes(idx1);
                  const isCorrect = correctIdxs.includes(idx1);
                  let bg = "#f9fafb", color = "#374151";
                  if (revealed) {
                    if (isCorrect) { bg = "#ddd6fe"; color = "#166534"; }
                    else if (isChosen) { bg = "#fecaca"; color = "#991b1b"; }
                  } else if (isChosen) { bg = "#ddd6fe"; color = "#4c1d95"; }
                  return (
                    <label key={ri} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 6px", borderRadius: 6, background: bg, color, cursor: revealed ? "default" : "pointer", marginBottom: 3, fontSize: 13 }}>
                      <input type="checkbox" disabled={revealed} checked={isChosen}
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

function QaVizsga() {
  const params = useSearchParams();
  const router = useRouter();
  const topicFilter = params.get("topic") ? Number(params.get("topic")) : null;
  const diffFilter = params.get("diff") || null;
  const typeFilter = params.get("qtype") || null;
  const onlyUj = params.get("uj") === "1";
  const onlyVizsga = params.get("vizsga") === "1";
  const onlyTobblet = params.get("tobblet") === "1";
  const count = Number(params.get("count") || 20);

  const [questions] = useState<Q[]>(() => {
    const pool = (questionsRaw as unknown as Q[]).filter((q) => {
      if (q.type === "essay") return false;
      if (topicFilter && q.topicNum !== topicFilter) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (onlyUj && q.category !== "uj") return false;
      if (onlyVizsga && !q.vizsgakerdes) return false;
      if (onlyTobblet && q.category !== "tobbletismeret") return false;
      return true;
    });
    return shuffle(pool).slice(0, count).map(shuffleOptions);
  });

  const [current, setCurrent] = useState(0);
  const [sel, setSel] = useState<AnySel>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (!questions.length) {
    return <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div>Nincs kérdés a megadott szűrőkkel.</div>
    </main>;
  }

  const q = questions[current];
  const correct = isAnswerCorrect(q, sel);
  const pct = Math.round((100 * score) / questions.length);

  function canReveal(): boolean {
    if (sel === null) return false;
    if (q.type === "multi") return Array.isArray(sel) && (sel as number[]).length > 0;
    if (q.type === "matching") {
      const ms = sel as MatchingSel;
      return (q.leftItems || []).some((_, li) => (ms[li] || []).length > 0);
    }
    return true;
  }

  function reveal() {
    if (!canReveal()) return;
    setRevealed(true);
    if (isAnswerCorrect(q, sel)) setScore(s => s + 1);
  }

  function next() {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSel(null);
      setRevealed(false);
    }
  }

  function toggleMulti(v: number) {
    setSel(prev => {
      const arr = Array.isArray(prev) ? (prev as number[]) : [];
      return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v].sort((a, b) => a - b);
    });
  }

  if (finished) {
    return (
      <main style={{ minHeight: "100vh", background: "linear-gradient(120deg, #ede9fe 0%, #f5f3ff 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "24px" }}>
        <div style={{ background: "white", borderRadius: 24, boxShadow: "0 8px 32px rgba(139,92,246,0.12)", padding: "40px 32px", maxWidth: 500, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#6d28d9", marginBottom: 10 }}>Q&amp;A vizsga vége!</h1>
          <div style={{ fontSize: 20, color: "#7c3aed", fontWeight: 600, marginBottom: 20 }}>
            {score} / {questions.length} helyes ({pct}%)
          </div>
          <div style={{ fontSize: 16, color: pct >= 60 ? "#166534" : "#991b1b", fontWeight: 500, marginBottom: 24 }}>
            {pct >= 60 ? "Szép eredmény! Gratulálunk!" : "Még van mit gyakorolni!"}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => router.push("/neuropsy/vizsga")} style={{ padding: "12px 24px", background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 15 }}>
              Új vizsga
            </button>
            <Link href="/neuropsy/tanulas" style={{ padding: "12px 24px", background: "#f5f3ff", color: "#6d28d9", border: "1.5px solid #c4b5fd", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
              Tanuló mód
            </Link>
          </div>
        </div>
      </main>
    );
  }

  function optStyle(idx1: number) {
    const isAns = q.type === "single" ? q.answer === idx1 : Array.isArray(q.answer) && (q.answer as number[]).includes(idx1);
    const isSel = q.type === "single" ? sel === idx1 : Array.isArray(sel) && (sel as number[]).includes(idx1);
    if (!revealed) return { bg: isSel ? "#ddd6fe" : "#f9fafb", color: isSel ? "#4c1d95" : "#374151", border: isSel ? "2px solid #7c3aed" : "2px solid transparent" };
    if (isAns) return { bg: "#ddd6fe", color: "#166534", border: "2px solid #16a34a" };
    if (isSel) return { bg: "#fecaca", color: "#991b1b", border: "2px solid #dc2626" };
    return { bg: "#f9fafb", color: "#374151", border: "2px solid transparent" };
  }

  function tfStyle(v: boolean) {
    const isAns = q.answer === v;
    const isSel = sel === v;
    if (!revealed) return { bg: isSel ? "#ddd6fe" : "#f9fafb", color: isSel ? "#4c1d95" : "#374151", border: isSel ? "2px solid #7c3aed" : "2px solid transparent" };
    if (isAns) return { bg: "#ddd6fe", color: "#166534", border: "2px solid #16a34a" };
    if (isSel) return { bg: "#fecaca", color: "#991b1b", border: "2px solid #dc2626" };
    return { bg: "#f9fafb", color: "#374151", border: "2px solid transparent" };
  }

  const needsConfirm = q.type === "multi" || q.type === "matching";
  const confirmEnabled = canReveal();

  return (
    <main style={{ minHeight: "100vh", background: "linear-gradient(120deg, #ede9fe 0%, #f5f3ff 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ background: "white", borderRadius: 24, boxShadow: "0 8px 32px rgba(139,92,246,0.12)", padding: "32px 28px", maxWidth: 700, width: "100%", textAlign: "center" }}>
        {/* Progress */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Link href="/neuropsy/vizsga" style={{ color: "#64748b", fontSize: 13, textDecoration: "none" }}>← Kilépés</Link>
          <div style={{ fontSize: 14, color: "#5b21b6", fontWeight: 600 }}>{current + 1} / {questions.length}</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>✓ {score} helyes</div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "#ddd6fe", borderRadius: 3, marginBottom: 20, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", borderRadius: 3, width: `${(current / questions.length) * 100}%`, transition: "width 0.3s" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {q.category && (
            <span style={{ background: catColor[q.category], color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>{catLabel[q.category]}</span>
          )}
          {q.vizsgakerdes && (
            <span style={{ background: "#1d4ed8", color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>Vizsgakérdés</span>
          )}
          <span style={{ background: diffColor[q.difficulty], color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>{diffLabel[q.difficulty]}</span>
          <span style={{ background: "#f3f4f6", color: "#374151", fontSize: 12, padding: "3px 8px", borderRadius: 999 }}>{q.topicNum}. {q.topic}</span>
        </div>

        {q.image && (
          <div style={{ margin: "10px auto 14px auto", padding: "10px", background: "#ede9fe", borderRadius: 10, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={q.image} alt={q.imageAlt || "Kérdéshez tartozó ábra"} style={{ maxWidth: "100%", maxHeight: 450, borderRadius: 8, boxShadow: "0 2px 12px rgba(76,29,149,0.20)" }} />
            {q.imageAlt && <div style={{ fontSize: 12, color: "#7c3aed", fontStyle: "italic", marginTop: 6 }}>{q.imageAlt}</div>}
          </div>
        )}

        <div style={{ fontWeight: 700, color: "#4c1d95", fontSize: 18, marginBottom: 20, lineHeight: 1.4 }}>{q.question}</div>

        {(q.type === "single" || q.type === "multi") && (
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0", textAlign: "left" }}>
            {q.options.map((opt, i) => {
              const idx1 = i + 1;
              const s = optStyle(idx1);
              return (
                <li key={i} style={{ marginBottom: 6 }}>
                  <button
                    disabled={revealed}
                    onClick={() => q.type === "single" ? setSel(idx1) : toggleMulti(idx1)}
                    style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, background: s.bg, color: s.color, border: s.border, cursor: revealed ? "default" : "pointer", fontWeight: 500, fontSize: 15 }}
                  >
                    <b style={{ marginRight: 8 }}>{String.fromCharCode(65 + i)})</b>{opt}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {q.type === "tf" && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
            {([true, false] as const).map((v) => {
              const s = tfStyle(v);
              return (
                <button key={String(v)} disabled={revealed} onClick={() => setSel(v)}
                  style={{ padding: "10px 30px", borderRadius: 10, background: s.bg, color: s.color, border: s.border, cursor: revealed ? "default" : "pointer", fontWeight: 600, fontSize: 16 }}>
                  {v ? "Igaz" : "Hamis"}
                </button>
              );
            })}
          </div>
        )}

        {q.type === "matching" && q.leftItems && q.rightItems && (
          <MatchingInput
            q={q}
            sel={typeof sel === "object" && sel !== null && !Array.isArray(sel) ? sel as MatchingSel : {}}
            setSel={(ms) => setSel(ms)}
            revealed={revealed}
          />
        )}

        {/* Confirm button for multi and matching */}
        {needsConfirm && !revealed && (
          <button onClick={reveal} disabled={!confirmEnabled}
            style={{ marginBottom: 12, padding: "8px 20px", borderRadius: 8, background: "#7c3aed", color: "white", fontWeight: 600, border: "none", cursor: confirmEnabled ? "pointer" : "not-allowed", opacity: confirmEnabled ? 1 : 0.5 }}>
            Válasz beküldése
          </button>
        )}

        {/* Auto-reveal button for single/tf */}
        {!needsConfirm && !revealed && sel !== null && (
          <button onClick={reveal} style={{ marginBottom: 12, padding: "8px 20px", borderRadius: 8, background: "#7c3aed", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}>
            Ellenőrzés
          </button>
        )}

        {/* Feedback */}
        {revealed && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: correct ? "#16a34a" : "#dc2626", marginBottom: 8 }}>
              {correct ? "✓ Helyes!" : "✗ Helytelen"}
            </div>
            {q.explanation && (
              <div style={{ padding: "8px 14px", background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 8, color: "#581c87", fontSize: 14, textAlign: "left" }}>
                <b>Magyarázat:</b> {q.explanation}
              </div>
            )}
            <button onClick={next} style={{ marginTop: 14, padding: "10px 28px", background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", color: "white", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              {current + 1 === questions.length ? "Befejezés" : "Következő kérdés →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function QaVizsgaPage() {
  return <Suspense><QaVizsga /></Suspense>;
}
