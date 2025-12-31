import { NextRequest, NextResponse } from 'next/server';
import { loadQuestionBank, loadExamBlueprint } from '@/lib/dataLoader';
import { buildExam } from '@/lib/examBuilder';
import { ExamAttempt } from '@/lib/types';

// In-memory attempt store (MVP, not persistent)
const attempts = new Map<string, ExamAttempt>();

export async function POST(req: NextRequest) {
  const { seed } = await req.json();
  if (!seed || typeof seed !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid seed' }, { status: 400 });
  }
  const questions = await loadQuestionBank();
  const blueprint = await loadExamBlueprint();
  const questionIds = buildExam(questions, blueprint, seed);
  const attemptId = Math.random().toString(36).slice(2, 10);
  const startedAt = new Date().toISOString();
  const durationSec = blueprint.examSize * 60; // 1 perc/kérdés
  const attempt: ExamAttempt = { attemptId, seed, questionIds, startedAt, durationSec };
  attempts.set(attemptId, attempt);
  return NextResponse.json({ attemptId, seed, questionIds, startedAt, durationSec });
}

// Export for test/dev
export { attempts };
