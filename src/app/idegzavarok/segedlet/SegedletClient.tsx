"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type Section = { num: number; title: string; body: string };

const subRe = /^(\d+)\.(\d+)\.?\s+(.*)$/;

function renderBody(body: string) {
  // Split body into blocks; treat lines matching subsection pattern as subheadings.
  const lines = body.split("\n");
  const blocks: Array<
    | { kind: "sub"; key: string; title: string }
    | { kind: "p"; key: string; text: string }
  > = [];
  let buf: string[] = [];
  let blockKey = 0;
  const flush = () => {
    if (buf.length) {
      const text = buf.join("\n").trim();
      if (text) blocks.push({ kind: "p", key: `p-${blockKey++}`, text });
      buf = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const sm = line.match(subRe);
    // Only treat as subheading if it starts with N.M and the rest looks like a title (capital letter or known phrasing)
    if (sm && sm[3] && /^[A-ZÁÉÍÓÖŐÚÜŰ]/.test(sm[3])) {
      flush();
      blocks.push({ kind: "sub", key: `sub-${blockKey++}`, title: `${sm[1]}.${sm[2]}. ${sm[3]}` });
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

export default function SegedletClient({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState<number>(sections[0]?.num ?? 1);
  const [search, setSearch] = useState("");

  const current = sections.find((s) => s.num === active) ?? sections[0];

  const filteredSections = useMemo(() => {
    if (!search.trim()) return null;
    const s = search.toLowerCase();
    return sections.filter(
      (sec) => sec.title.toLowerCase().includes(s) || sec.body.toLowerCase().includes(s),
    );
  }, [sections, search]);

  const blocks = useMemo(() => (current ? renderBody(current.body) : []), [current]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #fce7f3 0%, #fef3c7 100%)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/idegzavarok/tanulas" style={{ color: "#9a3412", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #f9a8d4" }}>
          ← Tanuló mód
        </Link>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés a segédletben…"
          style={{ flex: "1 1 200px", maxWidth: 360, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #f9a8d4", fontSize: 14, color: "#831843" }}
        />
      </div>

      <div style={{ width: "100%", maxWidth: 1100, display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: 16, alignItems: "start" }}>
        {/* TOC */}
        <nav
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(120,80,60,0.10)",
            padding: 16,
            position: "sticky",
            top: 16,
            maxHeight: "calc(100vh - 32px)",
            overflow: "auto",
          }}
        >
          <h3 style={{ color: "#831843", fontSize: 14, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Tartalomjegyzék
          </h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {sections.map((s) => (
              <li key={s.num}>
                <button
                  onClick={() => setActive(s.num)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 10px",
                    margin: "2px 0",
                    background: active === s.num ? "linear-gradient(90deg,#fb923c,#f472b6)" : "transparent",
                    color: active === s.num ? "white" : "#831843",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontWeight: active === s.num ? 700 : 500,
                    fontSize: 14,
                    lineHeight: 1.3,
                  }}
                >
                  <b>{s.num}.</b> {s.title}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/idegzavarok/vizsga"
            style={{
              display: "block",
              marginTop: 16,
              padding: "10px 14px",
              background: "linear-gradient(90deg,#f97316,#fb923c)",
              color: "white",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Tovább a kvízhez →
          </Link>
        </nav>

        {/* Content */}
        <article style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 16px rgba(120,80,60,0.10)", padding: "28px 32px", color: "#1f2937", lineHeight: 1.6 }}>
          {filteredSections ? (
            <>
              <h2 style={{ color: "#831843", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                Keresési találatok: „{search}”
              </h2>
              {filteredSections.length === 0 && (
                <div style={{ color: "#64748b" }}>Nincs találat.</div>
              )}
              {filteredSections.map((s) => (
                <div key={s.num} style={{ marginBottom: 18 }}>
                  <button
                    onClick={() => { setActive(s.num); setSearch(""); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#9a3412",
                      fontWeight: 700,
                      fontSize: 18,
                      padding: 0,
                      textDecoration: "underline",
                    }}
                  >
                    {s.num}. {s.title}
                  </button>
                </div>
              ))}
            </>
          ) : current ? (
            <>
              <h2 style={{ color: "#831843", fontSize: 24, fontWeight: 700, marginBottom: 16, borderBottom: "2px solid #fbcfe8", paddingBottom: 10 }}>
                {current.num}. {current.title}
              </h2>
              {blocks.map((b) => {
                if (b.kind === "sub") {
                  return (
                    <h3 key={b.key} style={{ color: "#9a3412", fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8 }}>
                      {b.title}
                    </h3>
                  );
                }
                return (
                  <p key={b.key} style={{ margin: "8px 0", whiteSpace: "pre-wrap", fontSize: 15 }}>
                    {b.text}
                  </p>
                );
              })}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", gap: 12 }}>
                <button
                  onClick={() => setActive((n) => Math.max(1, n - 1))}
                  disabled={active === 1}
                  style={{
                    padding: "10px 18px",
                    background: active === 1 ? "#f1f5f9" : "white",
                    color: active === 1 ? "#94a3b8" : "#9a3412",
                    border: "1.5px solid #fdba74",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: active === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Előző fejezet
                </button>
                <button
                  onClick={() => setActive((n) => Math.min(sections.length, n + 1))}
                  disabled={active === sections.length}
                  style={{
                    padding: "10px 18px",
                    background: active === sections.length ? "#f1f5f9" : "linear-gradient(90deg,#fb923c,#f472b6)",
                    color: active === sections.length ? "#94a3b8" : "white",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: active === sections.length ? "not-allowed" : "pointer",
                  }}
                >
                  Következő fejezet →
                </button>
              </div>
            </>
          ) : null}
        </article>
      </div>
    </main>
  );
}
