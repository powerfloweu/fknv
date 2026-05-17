"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import topicsRaw from "@/data/kognitivTopics.json";
import questionsRaw from "@/data/kognitivQuestionBank.json";

const topics = topicsRaw as { num: number; name: string }[];

type QMeta = { topicNum: number; difficulty: string; type: string; category?: "uj" | "konnyu"; vizsgakerdes?: boolean };

export default function KognitivVizsgaPage() {
  const router = useRouter();
  const [topicFilter, setTopicFilter] = useState<number | "">("");
  const [diffFilter, setDiffFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [onlyUj, setOnlyUj] = useState(false);
  const [onlyVizsga, setOnlyVizsga] = useState(false);
  const [count, setCount] = useState(20);
  const [error, setError] = useState<string | null>(null);

  const allQ = questionsRaw as QMeta[];
  const filtered = allQ.filter((q) => {
    if (topicFilter !== "" && q.topicNum !== topicFilter) return false;
    if (diffFilter && q.difficulty !== diffFilter) return false;
    if (typeFilter && q.type !== typeFilter) return false;
    if (onlyUj && q.category !== "uj") return false;
    if (onlyVizsga && !q.vizsgakerdes) return false;
    return true;
  });
  const max = filtered.length;

  function validate() {
    if (count < 1 || count > max) {
      setError(`A kérdések száma 1 és ${max} között legyen!`);
      return false;
    }
    setError(null);
    return true;
  }

  function buildUrl(mode: "normal" | "qa") {
    const params = new URLSearchParams();
    if (topicFilter !== "") params.set("topic", String(topicFilter));
    if (diffFilter) params.set("diff", diffFilter);
    if (typeFilter) params.set("qtype", typeFilter);
    if (onlyUj) params.set("uj", "1");
    if (onlyVizsga) params.set("vizsga", "1");
    params.set("count", String(count));
    return `/kognitiv/vizsga/${mode}?${params.toString()}`;
  }

  function start(mode: "normal" | "qa") {
    if (!validate()) return;
    router.push(buildUrl(mode));
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #d1fae5 0%, #ecfeff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px"
    }}>
      <div style={{ background: "white", borderRadius: 24, boxShadow: "0 8px 32px rgba(16,185,129,0.12)", padding: "40px 32px 32px 32px", maxWidth: 500, width: "100%", textAlign: "center", marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", margin: "0 auto 12px auto" }}>
            <ellipse cx="45" cy="35" rx="40" ry="28" fill="#a7f3d0" />
            <ellipse cx="30" cy="35" rx="16" ry="20" fill="#bbf7d0" />
            <ellipse cx="60" cy="35" rx="16" ry="20" fill="#bbf7d0" />
            <path d="M45 7 Q50 20 45 35 Q40 50 45 63" stroke="#0d9488" strokeWidth="2.5" fill="none" />
            <path d="M30 15 Q35 30 30 50" stroke="#0d9488" strokeWidth="2" fill="none" />
            <path d="M60 15 Q55 30 60 50" stroke="#0d9488" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#047857", marginBottom: 6 }}>
          Vizsga indítása
        </h1>
        <div style={{ fontSize: 15, color: "#0d9488", fontWeight: 500, marginBottom: 22 }}>
          Kognitív pszichológia mesterfokon
        </div>

        {/* Filters */}
        <div style={{ textAlign: "left", marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#064e3b", marginBottom: 4 }}>Témakör szűrő</label>
          <select
            value={topicFilter === "" ? "" : String(topicFilter)}
            onChange={(e) => setTopicFilter(e.target.value === "" ? "" : Number(e.target.value))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white", marginBottom: 12 }}
          >
            <option value="">Minden témakör</option>
            {topics.map((t) => <option key={t.num} value={t.num}>{t.num}. {t.name}</option>)}
          </select>

          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#064e3b", marginBottom: 4 }}>Nehézség szűrő</label>
          <select
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white", marginBottom: 12 }}
          >
            <option value="">Minden nehézség</option>
            <option value="easy">Könnyű</option>
            <option value="medium">Közepes</option>
            <option value="hard">Nehéz</option>
          </select>

          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#064e3b", marginBottom: 4 }}>Kérdéstípus szűrő</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", background: "white", marginBottom: 12 }}
          >
            <option value="">Minden típus</option>
            <option value="single">Egy helyes</option>
            <option value="multi">Több helyes</option>
            <option value="tf">Igaz/Hamis</option>
            <option value="matching">Párosítás / táblázat</option>
          </select>

          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#064e3b", marginBottom: 4 }}>Kategória szűrő</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: onlyUj ? "#d1fae5" : "#ecfeff", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", cursor: "pointer", fontWeight: 500 }}>
              <input type="checkbox" checked={onlyUj} onChange={(e) => setOnlyUj(e.target.checked)} />
              <span><b style={{ color: "#db2777" }}>Új!</b> kérdések — csak a nemrég hozzáadott kérdések (közepes/nehéz)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: onlyVizsga ? "#dbeafe" : "#ecfeff", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 14, color: "#064e3b", cursor: "pointer", fontWeight: 500 }}>
              <input type="checkbox" checked={onlyVizsga} onChange={(e) => setOnlyVizsga(e.target.checked)} />
              <span><b style={{ color: "#1d4ed8" }}>Vizsgakérdés</b> — a két korábbi vizsgából származó kérdések</span>
            </label>
          </div>

          <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#064e3b", marginBottom: 4 }}>
            Kérdések száma (max: {max})
          </label>
          <input
            type="number"
            min={1}
            max={max}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1.5px solid #86efac", fontSize: 16, color: "#064e3b", textAlign: "center", boxSizing: "border-box" }}
          />
        </div>

        {error && <div style={{ color: "#dc2626", marginBottom: 12, fontSize: 14 }}>{error}</div>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => start("normal")}
            style={{
              background: "linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(13,148,136,0.18)",
            }}
          >
            {count} kérdéses normál vizsga
          </button>
          <button
            onClick={() => start("qa")}
            style={{
              background: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(16,185,129,0.18)",
            }}
          >
            {count} kérdéses Q&amp;A vizsga
          </button>
        </div>

        <Link href="/kognitiv" style={{ display: "inline-block", marginTop: 18, color: "#64748b", fontSize: 14, textDecoration: "none" }}>
          ← Vissza
        </Link>
      </div>
    </main>
  );
}
