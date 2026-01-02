import { NextRequest, NextResponse } from 'next/server';
import { attempts } from '../../start/route';
import questionBank from '@/data/questionBank.json';
import { ExamAttempt } from '@/lib/types';
import fs from 'fs';

// ---- scoring helpers ----
function scoreSingle(q: any, a: any): number {
  // helyes_válasz: 1-based index, answers: 0-based index
  if (typeof q.helyes_válasz === 'number') {
    return a?.value === (q.helyes_válasz - 1) ? (q.pont || 1) : 0;
  }
  return 0;
}

function scoreMulti(q: any, a: any): number {
  // helyes_válaszok: 1-based index, answers: 0-based index
  const correct = (q.helyes_válaszok || []).map((n: number) => n - 1).sort((a: number, b: number) => a - b).join(',');
  const given = (Array.isArray(a?.value) ? a.value : []).map(Number).sort((a: number, b: number) => a - b).join(',');
  return correct === given ? (q.pont || 1) : 0;
}

// Regex scoring helper
function scoreRegex(q: any, a: any): number {
  const val = (a?.value || '').toString();
  const pattern = q.helyes_regex;
  if (!pattern) return 0;
  try {
    const re = new RegExp(pattern, 'i');
    return re.test(val) ? (q.pont || 1) : 0;
  } catch {
    return 0;
  }
}
// ...existing code...
function scoreTF(q: any, a: any): number {
  return a?.value === q.answerKey.correctBool ? q.scoring.points : 0;
}

function scoreShort(q: any, a: any): number {
  const val = (a?.value || '').toString();
  const rules = q.answerKey.rules || [];
  if (!rules.length) return 0;
  const ok = rules.every((r: any) => {
    try {
      const re = new RegExp(r.pattern, r.flags || 'i');
      return re.test(val);
    } catch {
      return false;
    }
  });
  return ok ? q.scoring.points : 0;
}

// ---- submit handler ----
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {


  const { attemptId } = await context.params;
  let attempt: ExamAttempt | undefined = attempts.get(attemptId);

  // Always parse the body ONCE
  let payload: any = undefined;
  try {
    payload = await req.json();
  } catch {}

  // DEV fallback: próbáljuk localStorage-ből (ha frontend elküldi)
  if (!attempt && payload && payload.attempt) {
    attempt = payload.attempt;
  }
  if (!attempt) {
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 404 });
  }

  if (!payload || payload.attemptId !== attemptId || typeof payload.answers !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const byId = Object.fromEntries(
    (questionBank as any[]).map((q: any) => [q.id, q])
  );

  let total = 0;
  const breakdown: Record<string, number> = {};
  const blockBreakdown: Record<string, number> = {};

  for (const qid of attempt.questionIds) {
    const q = byId[qid];
    const a = payload.answers[qid];

    if (!q || !a) {
      breakdown[qid] = 0;
      continue;
    }

    let score = 0;
    if (q.típus === 'single') score = scoreSingle(q, a);
    else if (q.típus === 'multiple') score = scoreMulti(q, a);
    else if (q.típus === 'regex') score = scoreRegex(q, a);
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
