"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

export type Q = {
  id: number;
  topicNum: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "single" | "multi" | "tf" | "matching";
  question: string;
  options: string[];
  answer: number | number[] | boolean | number[][];
  explanation: string;
  leftItems?: string[];
  rightItems?: string[];
  category?: "uj" | "konnyu";
  vizsgakerdes?: boolean;
};

const diffLabel: Record<string, string> = { easy: "Könnyű", medium: "Közepes", hard: "Nehéz" };
const diffColor: Record<string, string> = { easy: "#16a34a", medium: "#ca8a04", hard: "#dc2626" };
const typeLabel: Record<string, string> = { single: "Egy helyes", multi: "Több helyes", tf: "Igaz/Hamis", matching: "Párosítás" };
const catLabel: Record<string, string> = { uj: "Új!", konnyu: "Könnyű" };
const catColor: Record<string, string> = { uj: "#db2777", konnyu: "#0891b2" };

export default function TanulasClient({
  questions,
  topics,
}: {
  questions: Q[];
  topics: { num: number; name: string }[];
}) {
  const [tab, setTab] = useState<"kerdesek" | "segedlet">("kerdesek");
  const [topicFilter, setTopicFilter] = useState<number | "">("");
  const [diffFilter, setDiffFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [catFilter, setCatFilter] = useState<"" | "uj" | "konnyu" | "vizsga">("");
  const [search, setSearch] = useState("");
  const [hideAnswer, setHideAnswer] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const filtered = useMemo(() => {
    return questions.filter((q) => {
      if (topicFilter !== "" && q.topicNum !== topicFilter) return false;
      if (diffFilter && q.difficulty !== diffFilter) return false;
      if (typeFilter && q.type !== typeFilter) return false;
      if (catFilter === "uj" && q.category !== "uj") return false;
      if (catFilter === "konnyu" && q.category !== "konnyu") return false;
      if (catFilter === "vizsga" && !q.vizsgakerdes) return false;
      if (search) {
        const s = search.toLowerCase();
        if (!q.question.toLowerCase().includes(s) && !String(q.id).includes(s)) return false;
      }
      return true;
    });
  }, [questions, topicFilter, diffFilter, typeFilter, catFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetPage() { setPage(1); }

  function isCorrectOption(q: Q, idx1: number): boolean {
    if (q.type === "single") return q.answer === idx1;
    if (q.type === "multi") return Array.isArray(q.answer) && (q.answer as number[]).includes(idx1);
    return false;
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #d1fae5 0%, #ecfeff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
    }}>
      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/kognitiv" style={{ color: "#047857", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #86efac" }}>
          ← Vissza
        </Link>
        <Link href="/kognitiv/vizsga" style={{ padding: "8px 18px", background: "linear-gradient(90deg,#0d9488,#14b8a6)", color: "white", border: "none", borderRadius: 10, fontWeight: 600, textDecoration: "none" }}>
          Vizsga mód →
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(16,185,129,0.10)", padding: "24px", maxWidth: 960, width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#047857", marginBottom: 4 }}>
          Tanuló mód
        </h1>
        <div style={{ fontSize: 14, color: "#065f46", marginBottom: 16 }}>
          Kognitív pszichológia mesterfokon
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #bbf7d0" }}>
          {(["kerdesek", "segedlet"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                background: tab === t ? "linear-gradient(90deg,#10b981,#34d399)" : "transparent",
                color: tab === t ? "white" : "#047857",
                border: "none",
                borderBottom: tab === t ? "2px solid transparent" : "2px solid transparent",
                borderRadius: "8px 8px 0 0",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 15,
                marginBottom: -2,
              }}
            >
              {t === "kerdesek" ? "Kérdések böngészése" : "Tanulási segédlet"}
            </button>
          ))}
        </div>

        {tab === "kerdesek" && (
          <>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Keresés szövegre vagy ID-re…"
                style={{ flex: "1 1 180px", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b" }}
              />
              <select
                value={topicFilter === "" ? "" : String(topicFilter)}
                onChange={(e) => { setTopicFilter(e.target.value === "" ? "" : Number(e.target.value)); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white" }}
              >
                <option value="">Minden témakör</option>
                {topics.map((t) => <option key={t.num} value={t.num}>{t.num}. {t.name}</option>)}
              </select>
              <select
                value={diffFilter}
                onChange={(e) => { setDiffFilter(e.target.value); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white" }}
              >
                <option value="">Minden nehézség</option>
                <option value="easy">Könnyű</option>
                <option value="medium">Közepes</option>
                <option value="hard">Nehéz</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white" }}
              >
                <option value="">Minden típus</option>
                <option value="single">Egy helyes</option>
                <option value="multi">Több helyes</option>
                <option value="tf">Igaz/Hamis</option>
                <option value="matching">Párosítás / táblázat</option>
              </select>
              <select
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value as "" | "uj" | "konnyu" | "vizsga"); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white" }}
              >
                <option value="">Minden kategória</option>
                <option value="uj">Új!</option>
                <option value="konnyu">Könnyű</option>
                <option value="vizsga">Vizsgakérdés</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#d1fae5", borderRadius: 8, fontSize: 13, color: "#065f46", fontWeight: 500, cursor: "pointer" }}>
                <input type="checkbox" checked={hideAnswer} onChange={(e) => setHideAnswer(e.target.checked)} />
                Válasz elrejtése
              </label>
            </div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>{filtered.length} kérdés</div>

            <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
              {paginated.map((q) => (
                <li key={q.id} style={{ background: "#f0fdfa", border: "1.5px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, color: "#064e3b", fontSize: 15 }}>
                      <span style={{ color: "#0d9488", marginRight: 6 }}>{q.id}.</span>
                      {q.question}
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
                      <span style={{ background: "#7c3aed", color: "white", fontSize: 11, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                        {typeLabel[q.type]}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#065f46", marginBottom: 8 }}>{q.topicNum}. {q.topic}</div>

                  {(q.type === "single" || q.type === "multi") && (
                    <ul style={{ listStyle: "none", paddingLeft: 0, margin: "6px 0 0 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {q.options.map((opt, i) => {
                        const idx1 = i + 1;
                        const isCorrect = isCorrectOption(q, idx1);
                        if (hideAnswer && isCorrect) return (
                          <li key={i} style={{ padding: "4px 10px", borderRadius: 6, background: "#e0e7ff", color: "#a5b4fc", fontSize: 13 }}>
                            {String.fromCharCode(65 + i)}) <i>elrejtve</i>
                          </li>
                        );
                        return (
                          <li key={i} style={{ padding: "4px 10px", borderRadius: 6, background: isCorrect ? "#bbf7d0" : "#f3f4f6", color: isCorrect ? "#166534" : "#374151", fontWeight: isCorrect ? 700 : 400, fontSize: 13 }}>
                            {String.fromCharCode(65 + i)}) {opt}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {q.type === "tf" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      {[true, false].map((v) => {
                        const isCorrect = q.answer === v;
                        if (hideAnswer && isCorrect) return (
                          <span key={String(v)} style={{ padding: "4px 14px", borderRadius: 6, background: "#e0e7ff", color: "#a5b4fc", fontSize: 13 }}><i>elrejtve</i></span>
                        );
                        return (
                          <span key={String(v)} style={{ padding: "4px 14px", borderRadius: 6, background: isCorrect ? "#bbf7d0" : "#f3f4f6", color: isCorrect ? "#166534" : "#374151", fontWeight: isCorrect ? 700 : 400, fontSize: 13 }}>
                            {v ? "Igaz" : "Hamis"}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "matching" && q.leftItems && q.rightItems && (
                    <div style={{ marginTop: 8 }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "4px 8px", background: "#bbf7d0", borderRadius: "6px 0 0 0", color: "#064e3b" }}>Kategória</th>
                            <th style={{ textAlign: "left", padding: "4px 8px", background: "#bbf7d0", borderRadius: "0 6px 0 0", color: "#064e3b" }}>Helyes párok</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.leftItems.map((left, li) => {
                            const ansArr = Array.isArray(q.answer) && Array.isArray((q.answer as number[][])[li])
                              ? (q.answer as number[][])[li]
                              : [];
                            const rights = ansArr.map((idx1: number) => q.rightItems![idx1 - 1]).filter(Boolean);
                            return (
                              <tr key={li} style={{ borderBottom: "1px solid #bbf7d0" }}>
                                <td style={{ padding: "5px 8px", fontWeight: 600, color: "#064e3b", verticalAlign: "top", width: "40%" }}>{left}</td>
                                <td style={{ padding: "5px 8px", color: hideAnswer ? "#a5b4fc" : "#166534", fontWeight: hideAnswer ? 400 : 600 }}>
                                  {hideAnswer ? <i>elrejtve</i> : rights.join(" / ")}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!hideAnswer && q.explanation && (
                    <div style={{ marginTop: 8, padding: "6px 10px", background: "#ecfeff", border: "1px solid #67e8f9", borderRadius: 7, color: "#155e75", fontSize: 12 }}>
                      <b>Magyarázat:</b> {q.explanation}
                    </div>
                  )}
                </li>
              ))}
            </ol>

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 20 }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: page === 1 ? "#e0e7ff" : "#0d9488", color: page === 1 ? "#a5b4fc" : "#fff", fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer" }}>Előző</button>
                <span style={{ fontWeight: 500, color: "#064e3b", fontSize: 14 }}>Oldal {page} / {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: page === totalPages ? "#e0e7ff" : "#0d9488", color: page === totalPages ? "#a5b4fc" : "#fff", fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer" }}>Következő</button>
              </div>
            )}
          </>
        )}

        {tab === "segedlet" && <SegedletEmbed />}
      </div>
    </main>
  );
}

function SegedletEmbed() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 16, color: "#065f46", marginBottom: 20 }}>
        A tanulási segédlet 13 fejezetes interaktív anyag — a 2026-os program teljes vázlata az előadás-, irodalmi és önállóan feldolgozandó anyagokból szintetizálva.
      </div>
      <Link
        href="/kognitiv/segedlet"
        style={{
          display: "inline-block",
          padding: "13px 28px",
          background: "linear-gradient(90deg,#10b981,#34d399)",
          color: "white",
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(16,185,129,0.18)",
        }}
      >
        Tanulási segédlet megnyitása →
      </Link>
    </div>
  );
}
