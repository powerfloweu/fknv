import { NextRequest, NextResponse } from 'next/server';
import { loadQuestionBank, loadExamBlueprint } from '@/lib/dataLoader';
import { buildExam } from '@/lib/examBuilder';
import { ExamAttempt, Question } from '@/lib/types';

// In-memory attempt store (MVP, not persistent)
const attempts = new Map<string, ExamAttempt>();

export async function POST(req: NextRequest) {
  const { seed, count, hardMode } = await req.json();
  if (!seed || typeof seed !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid seed' }, { status: 400 });
  }
  const questions = await loadQuestionBank();
  const blueprint = await loadExamBlueprint();
  // Use user-selected count if provided and valid
  const examSize = typeof count === 'number' && count >= 9 && count % 9 === 0 ? count : blueprint.examSize;

  let filteredQuestions: Question[] = questions;
  let customBlueprint;
  if (hardMode) {
    // Only use hard questions, ignore block quotas
    filteredQuestions = questions.filter(q => {
      if ((q as Question).difficulty === 'hard') return true;
      // For legacy/JSON questions with 'nehézség' property
      if (
        typeof q === 'object' &&
        q !== null &&
        'nehézség' in q &&
        typeof (q as Record<string, unknown>)["nehézség"] === 'string' &&
        (q as Record<string, unknown>)["nehézség"] === 'hard'
      ) {
        return true;
      }
      return false;
    });
    // All questions from one pool, no block quotas
    customBlueprint = { ...blueprint, examSize, blockQuotas: {} };
  } else {
    // Distribute quotas evenly across unique blocks in questionBank
    const blockSet = new Set<string>();
    for (const q of questions) {
      const block = (q as Question & { blokk?: string }).blokk;
      if (block) blockSet.add(block);
    }
    const blockNames = Array.from(blockSet);
    const perBlock = Math.floor(examSize / blockNames.length);
    const blockQuotas: Record<string, number> = {};
    blockNames.forEach(b => { blockQuotas[b] = perBlock; });
    customBlueprint = { ...blueprint, examSize, blockQuotas };
  }

  const questionIds = buildExam(filteredQuestions, customBlueprint, seed);
  const attemptId = seed;
  const startedAt = new Date().toISOString();
  const durationSec = examSize * 60; // 1 perc/kérdés
  const attempt: ExamAttempt = { attemptId, seed, questionIds, startedAt, durationSec };
  attempts.set(attemptId, attempt);
  return NextResponse.json({ attemptId, seed, questionIds, startedAt, durationSec });
}

// Export for test/dev
export { attempts };
