"use client";
import { useMemo, useRef, useState } from "react";
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
  const mobileTocRef = useRef<HTMLDetailsElement>(null);

  // Fejezetváltáskor a fejezet elejére ugrunk, mobilon a lenyíló tartalomjegyzéket is bezárjuk
  function goTo(num: number) {
    setActive(num);
    if (mobileTocRef.current) mobileTocRef.current.open = false;
    window.scrollTo({ top: 0 });
  }

  const current = sections.find((s) => s.num === active) ?? sections[0];

  const filteredSections = useMemo(() => {
    if (!search.trim()) return null;
    const s = search.toLowerCase();
    return sections.filter(
      (sec) => sec.title.toLowerCase().includes(s) || sec.body.toLowerCase().includes(s),
    );
  }, [sections, search]);

  const blocks = useMemo(() => (current ? renderBody(current.body) : []), [current]);

  // A tartalomjegyzék elemei: asztalon az oldalsávban, mobilon a lenyíló blokkban jelennek meg
  const tocItems = (
    <>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {sections.map((s) => (
          <li key={s.num}>
            <button
              onClick={() => goTo(s.num)}
              aria-current={active === s.num ? "true" : undefined}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                margin: "2px 0",
                background: active === s.num ? "#047857" : "transparent",
                color: active === s.num ? "white" : "#065f46",
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
        href="/kognitiv/vizsga"
        style={{
          display: "block",
          marginTop: 16,
          padding: "10px 14px",
          background: "#047857",
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
    </>
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1100, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/kognitiv/tanulas" style={{ color: "#047857", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #86efac" }}>
          ← Tanuló mód
        </Link>
        <input
          type="search"
          aria-label="Keresés a segédletben"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Keresés a segédletben…"
          style={{ flex: "1 1 200px", maxWidth: 360, padding: "8px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#065f46" }}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(220px,280px)_1fr]" style={{ width: "100%", maxWidth: 1100 }}>
        {/* Tartalomjegyzék: mobilon lenyíló blokk a szöveg fölött */}
        <details
          ref={mobileTocRef}
          className="md:hidden"
          style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 16px rgba(16,185,129,0.10)", padding: "12px 16px" }}
        >
          <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 15, color: "#065f46", padding: "6px 0" }}>
            Tartalomjegyzék{current ? ` · ${current.num}. ${current.title}` : ""}
          </summary>
          <div style={{ marginTop: 8 }}>{tocItems}</div>
        </details>

        {/* Tartalomjegyzék: asztalon ragadós oldalsáv */}
        <nav
          className="hidden md:block"
          aria-label="Tartalomjegyzék"
          style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(16,185,129,0.10)",
            padding: 16,
            position: "sticky",
            top: 16,
            maxHeight: "calc(100vh - 32px)",
            overflow: "auto",
          }}
        >
          <p style={{ color: "#065f46", fontSize: 14, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Tartalomjegyzék
          </p>
          {tocItems}
        </nav>

        {/* Content */}
        <article className="reading px-5 py-6 md:px-8 md:py-7" style={{ background: "white", borderRadius: 16, boxShadow: "0 4px 16px rgba(16,185,129,0.10)", color: "#1f2937", lineHeight: 1.6, minWidth: 0, overflowWrap: "break-word" }}>
          {filteredSections ? (
            <>
              <h1 style={{ color: "#065f46", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                Keresési találatok: „{search}”
              </h1>
              {filteredSections.length === 0 && (
                <div style={{ color: "#52606d" }}>Nincs találat.</div>
              )}
              {filteredSections.map((s) => (
                <div key={s.num} style={{ marginBottom: 18 }}>
                  <button
                    onClick={() => { goTo(s.num); setSearch(""); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "#047857",
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
              <h1 style={{ color: "#065f46", fontSize: 24, fontWeight: 700, marginBottom: 16, borderBottom: "2px solid #a7f3d0", paddingBottom: 10 }}>
                {current.num}. {current.title}
              </h1>
              {blocks.map((b) => {
                if (b.kind === "sub") {
                  return (
                    <h2 key={b.key} style={{ color: "#047857", fontSize: 17, fontWeight: 700, marginTop: 20, marginBottom: 8, maxWidth: "70ch" }}>
                      {b.title}
                    </h2>
                  );
                }
                return (
                  <p key={b.key} style={{ margin: "8px 0", whiteSpace: "pre-wrap", fontSize: 16, maxWidth: "70ch" }}>
                    {b.text}
                  </p>
                );
              })}
              <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <button
                  onClick={() => goTo(Math.max(1, active - 1))}
                  disabled={active === 1}
                  style={{
                    padding: "10px 18px",
                    background: active === 1 ? "#f1f5f9" : "white",
                    color: active === 1 ? "#52606d" : "#047857",
                    border: "1.5px solid #86efac",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: active === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  ← Előző fejezet
                </button>
                <button
                  onClick={() => goTo(Math.min(sections.length, active + 1))}
                  disabled={active === sections.length}
                  style={{
                    padding: "10px 18px",
                    background: active === sections.length ? "#f1f5f9" : "#047857",
                    color: active === sections.length ? "#52606d" : "white",
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
