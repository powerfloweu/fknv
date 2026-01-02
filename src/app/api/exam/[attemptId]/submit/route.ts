// Helper to map JSON question to internal Question type
function mapJsonToQuestion(json: any): Question {
  if (json.típus === 'single') {
    return {
      id: json.id,
      type: 'single',
      question: json.kérdés,
      options: json.válaszlehetőségek,
      answer: json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'multi' || json.típus === 'multiple') {
    return {
      id: json.id,
      type: 'multi',
      question: json.kérdés,
      options: json.válaszlehetőségek,
      answer: json.helyes_válaszok,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'tf') {
    return {
      id: json.id,
      type: 'tf',
      question: json.kérdés,
      answer: json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  } else if (json.típus === 'short' || json.típus === 'regex') {
    return {
      id: json.id,
      type: 'short',
      question: json.kérdés,
      criteria: json.helyes_regex ? [{ regex: json.helyes_regex }] : [],
      difficulty: json.nehézség,
      blokk: json.blokk,
    };
  }
  throw new Error('Ismeretlen kérdés típus: ' + json.típus);
}

// Simple scoring functions for demo (adjust as needed)
function scoreSingle(q: Question, a: any): number {
  if (q.type !== 'single') return 0;
  return a === q.answer ? 1 : 0;
}
function scoreMulti(q: Question, a: any): number {
  if (q.type !== 'multi') return 0;
  if (!Array.isArray(a) || !Array.isArray(q.answer)) return 0;
  // Full point only if all correct and only correct marked
  const correct = q.answer.sort().join(',');
  const user = a.sort().join(',');
  return correct === user ? 1 : 0;
}
import { NextRequest, NextResponse } from 'next/server';
import { attempts } from '../../start/route';
import questionBank from '@/data/questionBank.json';
import { ExamAttempt, Question } from '@/lib/types';

// ---- submit handler ----
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {


  const { attemptId } = await context.params;
  let attempt: ExamAttempt | undefined = attempts.get(attemptId);

  // Always parse the body ONCE
  let payload: Record<string, unknown> | undefined = undefined;
  try {
    payload = await req.json();
  } catch {}

  // DEV fallback: próbáljuk localStorage-ből (ha frontend elküldi)
  if (!attempt && payload && payload.attempt) {
    attempt = payload.attempt as ExamAttempt;
  }
  if (!attempt) {
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 404 });
  }

  if (!payload || payload.attemptId !== attemptId || typeof payload.answers !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const byId = Object.fromEntries(
    (questionBank as any[]).map(mapJsonToQuestion).map((q: Question) => [q.id, q])
  );

  let total = 0;
  const breakdown: Record<string, number> = {};
  const blockBreakdown: Record<string, number> = {};

  const answers: Record<number, any> = payload.answers as Record<number, any>;
  for (const qid of attempt.questionIds) {
    const q = byId[qid];
    const a = answers?.[qid];

    if (!q || !a) {
      breakdown[qid] = 0;
      continue;
    }

    let score = 0;
    if (q.type === 'single') score = scoreSingle(q, a);
    else if (q.type === 'multi') score = scoreMulti(q, a);
    // (tf, short: not used)

    breakdown[qid] = score;
    total += score;

    const block = q.blokk;
    if (block) {
      if (!blockBreakdown[block]) blockBreakdown[block] = 0;
      blockBreakdown[block] += score;
    }
  }

  return NextResponse.json({
    total,
    breakdown,
    blockBreakdown
  });
}
