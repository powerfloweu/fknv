import { Question, ExamBlueprint } from './types';

// Egyszerű seedelt random generátor (pl. mulberry32)
function mulberry32(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle seedelt randommal
function shuffle<T>(array: T[], random: () => number): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Exam builder: quotas és seed alapján választ kérdéseket
export function buildExam(
  questions: Question[],
  blueprint: ExamBlueprint,
  seed: string
): string[] {
  // Seed stringből szám generálása
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
  }
  const random = mulberry32(hash);

  // Kérdések csoportosítása blokk szerint (A/B/C/...) – a blueprint.blockQuotas is blokkokra vonatkozik
  const byBlock: Record<string, Question[]> = {};
  for (const q of questions) {
    const b = (q as any).block;
    if (!b) continue;
    if (!byBlock[b]) byBlock[b] = [];
    byBlock[b].push(q);
  }

  const selected: number[] = [];

  // Kvóták alkalmazása blokk szerint
  for (const block of Object.keys(blueprint.blockQuotas) as Array<keyof typeof blueprint.blockQuotas>) {
    const quota = blueprint.blockQuotas[block];
    const pool = shuffle(byBlock[block] ?? [], random);
    selected.push(...pool.slice(0, quota).map(q => q.id));
  }

  // Duplikációk kiszűrése (biztonsági)
  const uniqueSelected = Array.from(new Set(selected));

  // Ha a kvóták összege kisebb, mint examSize, véletlenszerűen pótoljuk a maradékból
  if (uniqueSelected.length < blueprint.examSize) {
    const remaining = questions.filter(q => !uniqueSelected.includes(q.id));
    const needed = blueprint.examSize - uniqueSelected.length;
    uniqueSelected.push(...shuffle(remaining, random).slice(0, needed).map(q => q.id));
  }

  // Végső sorrend is legyen random, és pontosan examSize hosszú
  return shuffle(uniqueSelected, random).slice(0, blueprint.examSize);
}

// ---
// A regex scoring logika a válaszok értékelésénél lesz implementálva, nem itt.
// ---
