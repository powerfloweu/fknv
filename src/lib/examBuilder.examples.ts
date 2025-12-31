import { buildExam } from './examBuilder';
import { Question, ExamBlueprint } from './types';

// Mock data
const questions: Question[] = [
  // 10 easy, 10 medium, 10 hard (id: 1-30)
  ...Array.from({ length: 10 }, (_, i) => ({ id: i + 1, type: 'single', question: 'Q', options: ['A'], answer: 0, difficulty: 'easy' })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: i + 11, type: 'single', question: 'Q', options: ['A'], answer: 0, difficulty: 'medium' })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: i + 21, type: 'single', question: 'Q', options: ['A'], answer: 0, difficulty: 'hard' })),
];

const blueprint: ExamBlueprint = {
  examSize: 9,
  blockQuotas: { easy: 3, medium: 3, hard: 3 }
};

// ---
// 1. Same seed => same question IDs
const seed = 'test-seed';
const exam1 = buildExam(questions, blueprint, seed);
const exam2 = buildExam(questions, blueprint, seed);
console.log('Same seed, same IDs:', JSON.stringify(exam1) === JSON.stringify(exam2)); // true
console.log('IDs:', exam1);

// 2. Different seed => different selection (very likely)
const exam3 = buildExam(questions, blueprint, 'other-seed');
console.log('Different seed, different IDs:', JSON.stringify(exam1) !== JSON.stringify(exam3)); // likely true
console.log('IDs:', exam3);

// 3. Block quotas respected
function countByDifficulty(ids: number[]) {
  const byId = Object.fromEntries(questions.map(q => [q.id, q.difficulty]));
  return ids.reduce((acc, id) => {
    const diff = byId[id];
    acc[diff] = (acc[diff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
console.log('Block quotas:', countByDifficulty(exam1)); // { easy: 3, medium: 3, hard: 3 }
