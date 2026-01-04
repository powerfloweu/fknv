import fs from 'fs';
import path from 'path';

interface Question {
  id: number;
  típus: 'single' | 'multiple' | 'regex';
  válaszlehetőségek?: string[];
  helyes_válasz?: number;
  helyes_válaszok?: number[];
  helyes_valasz_szoveg?: string;
  helyes_valasz_szovegek?: string[];
}

function loadJson(filePath: string): Question[] {
  const absPath = path.resolve(process.cwd(), filePath);
  return JSON.parse(fs.readFileSync(absPath, 'utf-8'));
}

const goldQuestions = loadJson('src/data/questionBank_GOLD.json');
const runtimeQuestions = loadJson('src/data/questionBank.json');

console.log('Loaded GOLD:', goldQuestions.length);
console.log('Loaded CURRENT:', runtimeQuestions.length);

const goldById = new Map<number, Question>();
goldQuestions.forEach(q => goldById.set(q.id, q));

let total = 0;
let mismatches: {
  id: number;
  expected: string | string[];
  actual: string | string[];
}[] = [];

for (const q of runtimeQuestions) {
  const gold = goldById.get(q.id);
  if (!gold) continue;

  if (
    q.típus === 'single' &&
    typeof q.helyes_válasz === 'number' &&
    Array.isArray(q.válaszlehetőségek)
  ) {
    total++;
    const actual = q.válaszlehetőségek[q.helyes_válasz - 1];
    const expected = gold.helyes_valasz_szoveg;
    if (actual !== expected) {
      mismatches.push({
        id: q.id,
        expected: expected ?? '',
        actual: actual ?? ''
      });
    }
  }

  if (
    q.típus === 'multiple' &&
    Array.isArray(q.helyes_válaszok) &&
    Array.isArray(q.válaszlehetőségek)
  ) {
    total++;
    const actualArr = q.helyes_válaszok.map(i => q.válaszlehetőségek![i - 1]);
    const expectedArr = gold.helyes_valasz_szovegek ?? [];
    const a = [...actualArr].sort();
    const e = [...expectedArr].sort();
    if (
      a.length !== e.length ||
      !a.every((v, i) => v === e[i])
    ) {
      mismatches.push({
        id: q.id,
        expected: expectedArr,
        actual: actualArr
      });
    }
  }
}

console.log('Validation Report');
console.log('-----------------');
console.log(`Total questions checked: ${total}`);
console.log(`Mismatches found: ${mismatches.length}`);

if (mismatches.length > 0) {
  console.log('Mismatched IDs:');
  for (const m of mismatches) {
    console.log(`ID ${m.id}`);
    console.log('  Expected:', m.expected);
    console.log('  Actual:  ', m.actual);
  }
}
