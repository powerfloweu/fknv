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
): number[] {
  // Seed stringből szám generálása
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) + seed.charCodeAt(i);
  }
  const random = mulberry32(hash);

  // Kérdések csoportosítása nehézség szerint
  const byDifficulty: Record<string, Question[]> = {
    easy: [],
    medium: [],
    hard: []
  };
  for (const q of questions) {
    byDifficulty[q.difficulty].push(q);
  }

  // Kvóták alkalmazása (itt történik a quotas logika)
  const selected: number[] = [];
  (Object.keys(blueprint.blockQuotas) as Array<keyof typeof byDifficulty>).forEach(diff => {
    const quota = blueprint.blockQuotas[diff];
    const pool = shuffle(byDifficulty[diff], random);
    selected.push(...pool.slice(0, quota).map(q => q.id));
  });

  // Ha a kvóták összege kisebb, mint examSize, véletlenszerűen pótoljuk
  if (selected.length < blueprint.examSize) {
    const remaining = questions.filter(q => !selected.includes(q.id));
    selected.push(...shuffle(remaining, random).slice(0, blueprint.examSize - selected.length).map(q => q.id));
  }

  // Végső sorrend is legyen random
  return shuffle(selected, random).slice(0, blueprint.examSize);
}

// ---
// A regex scoring logika a válaszok értékelésénél lesz implementálva, nem itt.
// ---
