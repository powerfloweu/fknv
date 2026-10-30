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
const diffColor: Record<string, string> = { easy: "#15803d", medium: "#854d0e", hard: "#dc2626" };
const typeLabel: Record<string, string> = { single: "Egy helyes", multi: "Több helyes", tf: "Igaz/Hamis", matching: "Párosítás" };
const catLabel: Record<string, string> = { uj: "Új!", konnyu: "Könnyű" };
const catColor: Record<string, string> = { uj: "#be185d", konnyu: "#0e7490" };

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
      background: "var(--paper)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
    }}>
      {/* Top bar */}
      <div style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/idegzavarok" style={{ color: "#9a3412", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #fdba74" }}>
          ← Vissza
        </Link>
        <Link href="/idegzavarok/vizsga" style={{ padding: "8px 18px", background: "#c2410c", color: "white", border: "none", borderRadius: 10, fontWeight: 600, textDecoration: "none" }}>
          Vizsga mód →
        </Link>
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(120,80,60,0.10)", padding: "24px", maxWidth: 960, width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#9a3412", marginBottom: 4 }}>
          Tanuló mód
        </h1>
        <div style={{ fontSize: 14, color: "#92400e", marginBottom: 16 }}>
          Idegrendszer fejlődési zavarai és fejlesztésük
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Tanuló mód nézetei" style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "2px solid #fde68a" }}>
          {(["kerdesek", "segedlet"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                background: tab === t ? "#c2410c" : "transparent",
                color: tab === t ? "white" : "#9a3412",
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
                type="search"
                aria-label="Keresés a kérdések között"
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Keresés szövegre vagy ID-re…"
                style={{ flex: "1 1 180px", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #fdba74", fontSize: 14, color: "#7c2d12" }}
              />
              <select
                aria-label="Témakör"
                value={topicFilter === "" ? "" : String(topicFilter)}
                onChange={(e) => { setTopicFilter(e.target.value === "" ? "" : Number(e.target.value)); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, maxWidth: "100%", border: "1.5px solid #fdba74", fontSize: 14, color: "#7c2d12", background: "white" }}
              >
                <option value="">Minden témakör</option>
                {topics.map((t) => <option key={t.num} value={t.num}>{t.num}. {t.name}</option>)}
              </select>
              <select
                aria-label="Nehézség"
                value={diffFilter}
                onChange={(e) => { setDiffFilter(e.target.value); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, maxWidth: "100%", border: "1.5px solid #fdba74", fontSize: 14, color: "#7c2d12", background: "white" }}
              >
                <option value="">Minden nehézség</option>
                <option value="easy">Könnyű</option>
                <option value="medium">Közepes</option>
                <option value="hard">Nehéz</option>
              </select>
              <select
                aria-label="Kérdéstípus"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, maxWidth: "100%", border: "1.5px solid #fdba74", fontSize: 14, color: "#7c2d12", background: "white" }}
              >
                <option value="">Minden típus</option>
                <option value="single">Egy helyes</option>
                <option value="multi">Több helyes</option>
                <option value="tf">Igaz/Hamis</option>
                <option value="matching">Párosítás / táblázat</option>
              </select>
              <select
                aria-label="Kategória"
                value={catFilter}
                onChange={(e) => { setCatFilter(e.target.value as "" | "uj" | "konnyu" | "vizsga"); resetPage(); }}
                style={{ padding: "8px 12px", borderRadius: 8, maxWidth: "100%", border: "1.5px solid #fdba74", fontSize: 14, color: "#7c2d12", background: "white" }}
              >
                <option value="">Minden kategória</option>
                <option value="uj">Új!</option>
                <option value="konnyu">Könnyű</option>
                <option value="vizsga">Vizsgakérdés</option>
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fef3c7", borderRadius: 8, fontSize: 13, color: "#92400e", fontWeight: 500, cursor: "pointer" }}>
                <input type="checkbox" checked={hideAnswer} onChange={(e) => setHideAnswer(e.target.checked)} />
                Válasz elrejtése
              </label>
            </div>
            <div style={{ fontSize: 13, color: "#52606d", marginBottom: 12 }}>{filtered.length} kérdés</div>

            <ol style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
              {paginated.map((q) => (
                <li key={q.id} style={{ background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div className="flex flex-col-reverse gap-1.5 md:flex-row md:items-start md:justify-between md:gap-2" style={{ marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, color: "#7c2d12", fontSize: 15 }}>
                      <span style={{ color: "#b45309", marginRight: 6 }}>{q.id}.</span>
                      {q.question}
                    </div>
                    <div className="flex flex-wrap gap-[5px] md:shrink-0 md:justify-end">
                      {q.category && (
                        <span style={{ background: catColor[q.category], color: "white", fontSize: 12, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                          {catLabel[q.category]}
                        </span>
                      )}
                      {q.vizsgakerdes && (
                        <span style={{ background: "#1d4ed8", color: "white", fontSize: 12, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                          Vizsgakérdés
                        </span>
                      )}
                      <span style={{ background: diffColor[q.difficulty], color: "white", fontSize: 12, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                        {diffLabel[q.difficulty]}
                      </span>
                      <span style={{ background: "#7c3aed", color: "white", fontSize: 12, padding: "2px 7px", borderRadius: 999, fontWeight: 600 }}>
                        {typeLabel[q.type]}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#92400e", marginBottom: 8 }}>{q.topicNum}. {q.topic}</div>

                  {(q.type === "single" || q.type === "multi") && (
                    <ul style={{ listStyle: "none", paddingLeft: 0, margin: "6px 0 0 0", display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {q.options.map((opt, i) => {
                        const idx1 = i + 1;
                        const isCorrect = isCorrectOption(q, idx1);
                        if (hideAnswer && isCorrect) return (
                          <li key={i} style={{ padding: "4px 10px", borderRadius: 6, background: "#f1f5f9", color: "#334155", fontSize: 13 }}>
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
                          <span key={String(v)} style={{ padding: "4px 14px", borderRadius: 6, background: "#f1f5f9", color: "#334155", fontSize: 13 }}><i>elrejtve</i></span>
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
                      <table className="match-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, tableLayout: "fixed", overflowWrap: "anywhere" }}>
                        <thead>
                          <tr>
                            <th style={{ textAlign: "left", padding: "4px 8px", background: "#fde68a", borderRadius: "6px 0 0 0", color: "#7c2d12" }}>Kategória</th>
                            <th style={{ textAlign: "left", padding: "4px 8px", background: "#fde68a", borderRadius: "0 6px 0 0", color: "#7c2d12" }}>Helyes párok</th>
                          </tr>
                        </thead>
                        <tbody>
                          {q.leftItems.map((left, li) => {
                            const ansArr = Array.isArray(q.answer) && Array.isArray((q.answer as number[][])[li])
                              ? (q.answer as number[][])[li]
                              : [];
                            const rights = ansArr.map((idx1: number) => q.rightItems![idx1 - 1]).filter(Boolean);
                            return (
                              <tr key={li} style={{ borderBottom: "1px solid #fde68a" }}>
                                <td style={{ padding: "5px 8px", fontWeight: 600, color: "#7c2d12", verticalAlign: "top", width: "40%" }}>{left}</td>
                                <td style={{ padding: "5px 8px", color: hideAnswer ? "#52606d" : "#166534", fontWeight: hideAnswer ? 400 : 600 }}>
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
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: page === 1 ? "#ffedd5" : "#c2410c", color: page === 1 ? "#9a3412" : "#fff", fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer" }}>Előző</button>
                <span style={{ fontWeight: 500, color: "#7c2d12", fontSize: 14 }}>Oldal {page} / {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: page === totalPages ? "#ffedd5" : "#c2410c", color: page === totalPages ? "#9a3412" : "#fff", fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer" }}>Következő</button>
              </div>
            )}
          </>
        )}

        {tab === "segedlet" && <SegedletEmbed />}
      </div>
    </main>
  );
}

// Inline embed — navigates to the full segedlet page in the same tab panel
function SegedletEmbed() {
  return (
    <div style={{ textAlign: "center", padding: "32px 0" }}>
      <div style={{ fontSize: 16, color: "#92400e", marginBottom: 20 }}>
        A tanulási segédlet 11 fejezetes interaktív anyag, tartalomjegyzékkel és szövegkereséssel.
      </div>
      <Link
        href="/idegzavarok/segedlet"
        style={{
          display: "inline-block",
          padding: "13px 28px",
          background: "#c2410c",
          color: "white",
          borderRadius: 12,
          fontWeight: 600,
          fontSize: 16,
          textDecoration: "none",
          boxShadow: "0 2px 8px rgba(236,72,153,0.18)",
        }}
      >
        Tanulási segédlet megnyitása →
      </Link>
    </div>
  );
}
