"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type SingleQ = {
  id: number;
  topicNum: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "single";
  question: string;
  options: string[];
  answer: number; // 1-indexed
  explanation: string;
};
type MultiQ = {
  id: number;
  topicNum: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "multi";
  question: string;
  options: string[];
  answer: number[]; // 1-indexed
  explanation: string;
};
type TfQ = {
  id: number;
  topicNum: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "tf";
  question: string;
  options: string[];
  answer: boolean;
  explanation: string;
};
export type Q = SingleQ | MultiQ | TfQ;

const diffLabel: Record<string, string> = {
  easy: "Könnyű",
  medium: "Közepes",
  hard: "Nehéz",
};
const diffColor: Record<string, string> = {
  easy: "#16a34a",
  medium: "#ca8a04",
  hard: "#dc2626",
};
const typeLabel: Record<string, string> = {
  single: "Egy helyes",
  multi: "Több helyes",
  tf: "Igaz/Hamis",
};

type Mode = "browse" | "test";

export default function KvizClient({
  questions,
  topics,
}: {
  questions: Q[];
  topics: { num: number; name: string }[];
}) {
  const [mode, setMode] = useState<Mode>("browse");
  const [topicFilter, setTopicFilter] = useState<number | "">("");
  const [diffFilter, setDiffFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [hideAnswer, setHideAnswer] = useState(false);

  // For test mode
  type Selection = number | number[] | boolean | null;
  const [selections, setSelections] = useState<Record<number, Selection>>({});
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (topicFilter !== "" && q.topicNum !== topicFilter) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!q.question.toLowerCase().includes(s) && !String(q.id).includes(s)) return false;
      }
      return true;
    });
  }, [questions, topicFilter, diffFilter, typeFilter, search]);

  const score = useMemo(() => {
    if (!submitted) return null;
    let correct = 0;
    for (const q of filtered) {
      const sel = selections[q.id];
      if (q.type === "single") {
        if (typeof sel === "number" && sel === (q as SingleQ).answer) correct++;
        else if (Array.isArray(sel) && sel.length === 1 && sel[0] === (q as SingleQ).answer) correct++;
      } else if (q.type === "multi") {
        const correctSet = new Set((q as MultiQ).answer);
        const selSet = new Set(Array.isArray(sel) ? sel : []);
        if (correctSet.size === selSet.size && [...correctSet].every((x) => selSet.has(x))) correct++;
      } else if (q.type === "tf") {
        if (typeof sel === "boolean" && sel === (q as TfQ).answer) correct++;
      }
    }
    return { correct, total: filtered.length };
  }, [submitted, filtered, selections]);

  function setSingleSel(qid: number, idx1: number) {
    setSelections((p) => ({ ...p, [qid]: idx1 }));
  }
  function toggleMultiSel(qid: number, idx1: number) {
    setSelections((p) => {
      const arr = Array.isArray(p[qid]) ? (p[qid] as number[]) : [];
      const next = arr.includes(idx1) ? arr.filter((x) => x !== idx1) : [...arr, idx1];
      return { ...p, [qid]: next.sort((a, b) => a - b) };
    });
  }
  function setTfSel(qid: number, v: boolean) {
    setSelections((p) => ({ ...p, [qid]: v }));
  }

  function resetTest() {
    setSelections({});
    setSubmitted(false);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #fef3c7 0%, #fce7f3 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/idegzavarok" style={{ color: "#9a3412", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #fdba74" }}>
          ← Vissza
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => { setMode("browse"); resetTest(); }}
            style={{
              padding: "8px 18px",
              background: mode === "browse" ? "linear-gradient(90deg,#f97316,#fb923c)" : "white",
              color: mode === "browse" ? "white" : "#9a3412",
              border: "1.5px solid #fdba74",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tanuló mód
          </button>
          <button
            onClick={() => { setMode("test"); resetTest(); }}
            style={{
              padding: "8px 18px",
              background: mode === "test" ? "linear-gradient(90deg,#ec4899,#f472b6)" : "white",
              color: mode === "test" ? "white" : "#9a3412",
              border: "1.5px solid #f9a8d4",
              borderRadius: 10,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Önellenőrző mód
          </button>
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(120,80,60,0.10)", padding: "24px", maxWidth: 960, width: "100%" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#9a3412", marginBottom: 6 }}>
          Idegrendszer fejlődési zavarai – Gyakorló kvíz
        </h1>
        <div style={{ fontSize: 14, color: "#92400e", marginBottom: 16 }}>
          {mode === "browse"
            ? "Böngészd a kérdéseket; a helyes válasz színesen jelenik meg, az indoklás alatta olvasható."
            : "Válaszolj a kérdésekre, majd a végén kérj kiértékelést. A kiértékelésnél láthatóak lesznek a helyes válaszok és magyarázatok."}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Keresés szövegre vagy ID-re…"
            style={{ flex: "1 1 200px", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fdba74", fontSize: 15, color: "#7c2d12" }}
          />
          <select
            value={topicFilter === "" ? "" : String(topicFilter)}
            onChange={(e) => setTopicFilter(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fdba74", fontSize: 15, color: "#7c2d12", background: "white" }}
          >
            <option value="">Minden témakör</option>
            {topics.map((t) => (
              <option key={t.num} value={t.num}>
                {t.num}. {t.name}
              </option>
            ))}
          </select>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fdba74", fontSize: 15, color: "#7c2d12", background: "white" }}
          >
            <option value="">Bármilyen nehézség</option>
            <option value="easy">Könnyű</option>
            <option value="medium">Közepes</option>
            <option value="hard">Nehéz</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fdba74", fontSize: 15, color: "#7c2d12", background: "white" }}
          >
            <option value="">Minden típus</option>
            <option value="single">Egy helyes válasz</option>
            <option value="multi">Több helyes válasz</option>
            <option value="tf">Igaz/Hamis</option>
          </select>
          {mode === "browse" && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#fef3c7", borderRadius: 8, fontSize: 14, color: "#92400e", fontWeight: 500, cursor: "pointer" }}>
              <input type="checkbox" checked={hideAnswer} onChange={(e) => setHideAnswer(e.target.checked)} />
              Válasz elrejtése
            </label>
          )}
        </div>

        <div style={{ fontSize: 14, color: "#64748b", marginBottom: 12 }}>
          {filtered.length} kérdés
          {mode === "test" && score && (
            <span style={{ marginLeft: 12, color: "#9a3412", fontWeight: 700 }}>
              Eredmény: {score.correct} / {score.total} ({Math.round((100 * score.correct) / Math.max(1, score.total))}%)
            </span>
          )}
        </div>

        {/* Questions */}
        <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
          {filtered.map((q) => {
            const sel = selections[q.id];
            const revealAnswer = mode === "browse" ? !hideAnswer : submitted;
            return (
              <li
                key={q.id}
                style={{
                  background: "#fffbeb",
                  border: "1.5px solid #fde68a",
                  borderRadius: 12,
                  padding: "16px",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "#7c2d12", fontSize: 16 }}>
                    <span style={{ color: "#b45309", marginRight: 6 }}>{q.id}.</span>
                    {q.question}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                    <span style={{ background: diffColor[q.difficulty], color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>
                      {diffLabel[q.difficulty]}
                    </span>
                    <span style={{ background: "#9333ea", color: "white", fontSize: 12, padding: "3px 8px", borderRadius: 999, fontWeight: 600 }}>
                      {typeLabel[q.type]}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>
                  {q.topicNum}. {q.topic}
                </div>

                {/* Options for single / multi */}
                {(q.type === "single" || q.type === "multi") && (
                  <ul style={{ listStyle: "none", paddingLeft: 0, margin: "8px 0 0 0" }}>
                    {q.options.map((opt, i) => {
                      const idx1 = i + 1;
                      const isAnswer =
                        q.type === "single"
                          ? (q as SingleQ).answer === idx1
                          : (q as MultiQ).answer.includes(idx1);
                      const selectedHere =
                        q.type === "single"
                          ? sel === idx1
                          : Array.isArray(sel) && sel.includes(idx1);
                      let bg = "#fff";
                      let color = "#3f3f46";
                      let border = "1px solid #e5e7eb";
                      if (revealAnswer && isAnswer) { bg = "#bbf7d0"; color = "#166534"; border = "1px solid #16a34a"; }
                      if (mode === "test" && submitted && selectedHere && !isAnswer) { bg = "#fecaca"; color = "#991b1b"; border = "1px solid #dc2626"; }
                      const interactive = mode === "test" && !submitted;
                      return (
                        <li key={i} style={{ marginBottom: 4 }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 8,
                              padding: "8px 12px",
                              borderRadius: 8,
                              cursor: interactive ? "pointer" : "default",
                              background: bg,
                              color,
                              border,
                              fontWeight: revealAnswer && isAnswer ? 700 : 400,
                            }}
                          >
                            {mode === "test" && (
                              <input
                                type={q.type === "single" ? "radio" : "checkbox"}
                                name={`q-${q.id}`}
                                disabled={submitted}
                                checked={selectedHere || false}
                                onChange={() => {
                                  if (q.type === "single") setSingleSel(q.id, idx1);
                                  else toggleMultiSel(q.id, idx1);
                                }}
                                style={{ marginTop: 3 }}
                              />
                            )}
                            <span>
                              <b style={{ marginRight: 6 }}>{String.fromCharCode(65 + i)})</b>
                              {opt}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* TF */}
                {q.type === "tf" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {[true, false].map((v) => {
                      const isAnswer = (q as TfQ).answer === v;
                      const selectedHere = sel === v;
                      let bg = "#fff";
                      let color = "#3f3f46";
                      let border = "1px solid #e5e7eb";
                      if (revealAnswer && isAnswer) { bg = "#bbf7d0"; color = "#166534"; border = "1px solid #16a34a"; }
                      if (mode === "test" && submitted && selectedHere && !isAnswer) { bg = "#fecaca"; color = "#991b1b"; border = "1px solid #dc2626"; }
                      const interactive = mode === "test" && !submitted;
                      return (
                        <label
                          key={String(v)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 16px",
                            borderRadius: 8,
                            cursor: interactive ? "pointer" : "default",
                            background: bg,
                            color,
                            border,
                            fontWeight: revealAnswer && isAnswer ? 700 : 500,
                            minWidth: 90,
                            justifyContent: "center",
                          }}
                        >
                          {mode === "test" && (
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              disabled={submitted}
                              checked={selectedHere || false}
                              onChange={() => setTfSel(q.id, v)}
                            />
                          )}
                          {v ? "Igaz" : "Hamis"}
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Explanation */}
                {revealAnswer && q.explanation && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "#ecfeff", border: "1px solid #67e8f9", borderRadius: 8, color: "#155e75", fontSize: 14 }}>
                    <b>Magyarázat:</b> {q.explanation}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {mode === "test" && (
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center" }}>
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                style={{
                  padding: "12px 28px",
                  background: "linear-gradient(90deg,#ec4899,#f472b6)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(236,72,153,0.18)",
                }}
              >
                Kiértékelés
              </button>
            ) : (
              <button
                onClick={resetTest}
                style={{
                  padding: "12px 28px",
                  background: "white",
                  color: "#9a3412",
                  border: "1.5px solid #fdba74",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Új próba
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
