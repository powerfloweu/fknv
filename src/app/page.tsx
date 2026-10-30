import Link from "next/link";
import { Activity, Brain, Lightbulb, Puzzle, type LucideIcon } from "lucide-react";
import fkiBank from "@/data/questionBank_GOLD.json";
import idegzavarokBank from "@/data/idegzavarokQuestionBank.json";
import idegzavarokTopics from "@/data/idegzavarokTopics.json";
import kognitivBank from "@/data/kognitivQuestionBank.json";
import kognitivTopics from "@/data/kognitivTopics.json";
import neuropsyBank from "@/data/neuropsyQuestionBank.json";
import neuropsyTopics from "@/data/neuropsyTopics.json";
import neuropsyCases from "@/data/neuropsyCases.json";

type Subject = {
  title: string;
  summary: string;
  stats: string;
  icon: LucideIcon;
  accent: string; // gombok és ikon (fehér szöveggel is ≥4.5:1)
  tint: string; // ikon háttér
  study: string;
  exam: string;
  extra?: { href: string; label: string };
};

// A számok build közben az adatfájlokból jönnek, így nem avulnak el
const fkiBlokks = new Set((fkiBank as { blokk?: string }[]).map((q) => q.blokk).filter(Boolean)).size;

const subjects: Subject[] = [
  {
    title: "Fejlődési kognitív idegtudomány",
    summary: "Próbavizsga és témakörönkénti kvíz, tanuló mód blokk, téma és nehézség szerinti szűréssel.",
    stats: `${fkiBank.length} kérdés · ${fkiBlokks} témakör`,
    icon: Brain,
    accent: "#4338ca",
    tint: "#eef2ff",
    study: "/study",
    exam: "/exam",
  },
  {
    title: "Idegrendszer fejlődési zavarai és fejlesztésük",
    summary: "IKZ, tanulási zavarok, ADHD, autizmus, koraszülöttség és fejlesztés, részletes tanulási segédlettel.",
    stats: `${idegzavarokBank.length} kérdés · ${idegzavarokTopics.length} témakör`,
    icon: Puzzle,
    accent: "#c2410c",
    tint: "#fff7ed",
    study: "/idegzavarok/tanulas",
    exam: "/idegzavarok/vizsga",
  },
  {
    title: "Kognitív pszichológia mesterfokon",
    summary: "Arcészlelés, érzelmek, képzelet, séma, reprezentáció, pszicholingvisztika, elmefilozófia, tudat.",
    stats: `${kognitivBank.length} kérdés · ${kognitivTopics.length} témakör`,
    icon: Lightbulb,
    accent: "#047857",
    tint: "#ecfdf5",
    study: "/kognitiv/tanulas",
    exam: "/kognitiv/vizsga",
  },
  {
    title: "Neuropszichológia",
    summary: "Lurija, neglekt, afázia, apraxia, agnózia, memória és demencia, tesztek. Szóbeli felkészülés keresztkérdésekkel.",
    stats: `${neuropsyBank.length} kérdés · ${neuropsyTopics.length} témakör · ${neuropsyCases.length} klinikai eset`,
    icon: Activity,
    accent: "#6d28d9",
    tint: "#f5f3ff",
    study: "/neuropsy/tanulas",
    exam: "/neuropsy/vizsga",
    extra: { href: "/neuropsy/eset", label: "Klinikai esetek" },
  },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--paper)", padding: "48px 16px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1f2937", marginBottom: 6 }}>Tanuló- és Vizsgaplatform</h1>
          <p style={{ fontSize: 17, color: "#475569" }}>Pszichológia MA: válassz tárgyat.</p>
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {subjects.map((s) => {
            const Icon = s.icon;
            return (
              <section
                key={s.title}
                style={{
                  background: "white",
                  border: "1px solid #e7e5e4",
                  borderRadius: 16,
                  boxShadow: "0 1px 2px rgba(28,25,23,0.04), 0 8px 24px rgba(28,25,23,0.05)",
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12 }}>
                  <span
                    aria-hidden="true"
                    style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, background: s.tint, color: s.accent, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Icon size={24} strokeWidth={1.75} />
                  </span>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1f2937", lineHeight: 1.25 }}>{s.title}</h2>
                    <p style={{ fontSize: 14, color: s.accent, fontWeight: 600, marginTop: 4 }}>{s.stats}</p>
                  </div>
                </div>
                <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.55, marginBottom: 20, flexGrow: 1 }}>{s.summary}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Link
                    href={s.study}
                    style={{ flex: "1 1 140px", textAlign: "center", padding: "11px 16px", background: s.accent, color: "white", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}
                  >
                    Tanuló mód
                  </Link>
                  <Link
                    href={s.exam}
                    style={{ flex: "1 1 140px", textAlign: "center", padding: "10px 16px", background: "white", color: s.accent, border: `1.5px solid ${s.accent}`, borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none" }}
                  >
                    Vizsga és kvíz
                  </Link>
                  {s.extra && (
                    <Link
                      href={s.extra.href}
                      style={{ flex: "1 1 100%", textAlign: "center", padding: "8px 16px", color: s.accent, fontWeight: 600, fontSize: 15, textDecoration: "underline", textUnderlineOffset: 3 }}
                    >
                      {s.extra.label} →
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
