import fs from "fs";
import path from "path";

interface Question {
  id: number;
  típus: "single" | "multiple" | "regex";
  válaszlehetőségek?: string[];
  helyes_válasz?: number;
  helyes_válaszok?: number[];
  helyes_valasz_szoveg?: string;
  helyes_valasz_szovegek?: string[];
}

const RUNTIME_PATH = "src/data/questionBank.json";
const GOLD_PATH = "src/data/questionBank_GOLD.json";

function load(file: string): Question[] {
  const abs = path.resolve(process.cwd(), file);
  return JSON.parse(fs.readFileSync(abs, "utf-8"));
}

function save(file: string, data: Question[]) {
  const abs = path.resolve(process.cwd(), file);
  fs.writeFileSync(abs, JSON.stringify(data, null, 2), "utf-8");
}

const runtime = load(RUNTIME_PATH);
const gold = load(GOLD_PATH);

const goldById = new Map<number, Question>();
gold.forEach(q => goldById.set(q.id, q));

let updated = 0;

for (const q of runtime) {
  const g = goldById.get(q.id);
  if (!g) continue;

  if (
    q.típus === "single" &&
    typeof q.helyes_válasz === "number" &&
    Array.isArray(q.válaszlehetőségek)
  ) {
    g.helyes_valasz_szoveg =
      q.válaszlehetőségek[q.helyes_válasz - 1];
    updated++;
  }

  if (
    q.típus === "multiple" &&
    Array.isArray(q.helyes_válaszok) &&
    Array.isArray(q.válaszlehetőségek)
  ) {
    g.helyes_valasz_szovegek =
      q.helyes_válaszok.map(
        i => q.válaszlehetőségek![i - 1]
      );
    updated++;
  }
}

save(GOLD_PATH, gold);

console.log("GOLD updated.");
console.log("Questions enriched:", updated);