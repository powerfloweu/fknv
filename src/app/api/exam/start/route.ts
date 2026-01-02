import { NextRequest, NextResponse } from 'next/server';
import { loadQuestionBank, loadExamBlueprint } from '@/lib/dataLoader';
import { buildExam } from '@/lib/examBuilder';
import { ExamAttempt } from '@/lib/types';

// In-memory attempt store (MVP, not persistent)
const attempts = new Map<string, ExamAttempt>();

export async function POST(req: NextRequest) {
  const { seed, count } = await req.json();
  if (!seed || typeof seed !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid seed' }, { status: 400 });
  }
  const questions = await loadQuestionBank();
  const blueprint = await loadExamBlueprint();
  // Use user-selected count if provided and valid
  const examSize = typeof count === 'number' && count >= 9 && count % 9 === 0 ? count : blueprint.examSize;
  // Distribute quotas evenly across unique blocks in questionBank
  const blockSet = new Set<string>();
  for (const q of questions) {
    if (q.blokk) blockSet.add(q.blokk);
  }
  const blockNames = Array.from(blockSet);
  const perBlock = Math.floor(examSize / blockNames.length);
  const blockQuotas: Record<string, number> = {};
  blockNames.forEach(b => { blockQuotas[b] = perBlock; });
  const customBlueprint = { ...blueprint, examSize, blockQuotas };
  const questionIds = buildExam(questions, customBlueprint, seed);
  const attemptId = seed;
  const startedAt = new Date().toISOString();
  const durationSec = examSize * 60; // 1 perc/kérdés
  const attempt: ExamAttempt = { attemptId, seed, questionIds, startedAt, durationSec };
  attempts.set(attemptId, attempt);
  return NextResponse.json({ attemptId, seed, questionIds, startedAt, durationSec });
}

// Export for test/dev
export { attempts };
