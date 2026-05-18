import Link from "next/link";
import casesRaw from "@/data/neuropsyCases.json";

type CaseListEntry = {
  id: number;
  title: string;
  topicTag: string;
  difficulty: "easy" | "medium" | "hard";
  intro: string;
  steps: { question: string }[];
};

const diffLabel: Record<string, string> = { easy: "Könnyű", medium: "Közepes", hard: "Nehéz" };
const diffColor: Record<string, string> = { easy: "#16a34a", medium: "#ca8a04", hard: "#dc2626" };

export default function NeuropsyCaseListPage() {
  const cases = casesRaw as CaseListEntry[];

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(120deg, #ede9fe 0%, #f5f3ff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
    }}>
      <div style={{ width: "100%", maxWidth: 960, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
        <Link href="/neuropsy" style={{ color: "#6d28d9", fontWeight: 600, textDecoration: "none", background: "white", padding: "8px 16px", borderRadius: 10, border: "1.5px solid #c4b5fd" }}>
          ← Vissza
        </Link>
        <div style={{ fontSize: 13, color: "#7c3aed", fontWeight: 500 }}>Klinikai esetelemzés (hipotézis-teszt)</div>
      </div>

      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 6px 24px rgba(139,92,246,0.10)", padding: "24px", maxWidth: 960, width: "100%" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#6d28d9", marginBottom: 4 }}>
          Klinikai esetelemzés
        </h1>
        <div style={{ fontSize: 14, color: "#5b21b6", marginBottom: 18 }}>
          Esetenként 3 lépésben fokozatosan bontakozik ki a kép. Minden lépésnél választasz a hipotézised
          szerint, és csak utána látod a következő információkat. A teljes történet harmonikaszerűen
          összegyűlik — szóbeli vizsgára remek gyakorlás.
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {cases.map((c) => (
            <Link key={c.id} href={`/neuropsy/eset/${c.id}`} style={{
              display: "block",
              padding: "16px 18px",
              background: "#faf5ff",
              border: "1.5px solid #ddd6fe",
              borderRadius: 12,
              textDecoration: "none",
              color: "inherit",
              transition: "transform 0.1s",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                <div style={{ fontWeight: 700, color: "#4c1d95", fontSize: 16 }}>
                  <span style={{ color: "#7c3aed", marginRight: 6 }}>{c.id}.</span>
                  {c.title}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <span style={{ background: "#8b5cf6", color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                    {c.steps.length} lépés
                  </span>
                  <span style={{ background: diffColor[c.difficulty], color: "white", fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>
                    {diffLabel[c.difficulty]}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#7c3aed", marginBottom: 8, fontWeight: 500 }}>
                {c.topicTag}
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                {c.intro.slice(0, 180)}{c.intro.length > 180 ? "…" : ""}
              </div>
            </Link>
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "12px 14px", background: "#f5f3ff", border: "1px dashed #c4b5fd", borderRadius: 10, fontSize: 13, color: "#5b21b6", lineHeight: 1.5 }}>
          <b>Tipp:</b> minden lépésnél előbb gondolkodj a saját hipotézised felől, csak utána válassz választ.
          A magyarázatok részletesek — érdemes a feltett hipotézist összevetni azzal, hogy MIÉRT az adott válasz a megfelelő.
        </div>
      </div>
    </main>
  );
}
