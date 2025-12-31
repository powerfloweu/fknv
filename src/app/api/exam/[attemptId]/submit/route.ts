import { NextRequest, NextResponse } from 'next/server';
import { attempts } from '../../start/route';
import { loadQuestionBank } from '@/lib/dataLoader';
import { ExamAttempt, AnswerPayload, Question } from '@/lib/types';

// Scoring helpers
function scoreSingle(q: Question, a: any) {
  return a.value === (q as any).answer ? 1 : 0;
}
function scoreMulti(q: Question, a: any) {
  const correct = (q as any).answer.sort().join(',');
  const given = (a.value || []).sort().join(',');
  return correct === given ? 1 : 0;
}
function scoreTF(q: Question, a: any) {
  return a.value === (q as any).answer ? 1 : 0;
}
function scoreShort(q: Question, a: any) {
  // --- Regex scoring logika itt ---
  const val = (a.value || '').toString();
  const rules = (q as any).criteria || [];
  if (!rules.length) return 0;
  return rules.every((r: any) => {
    try {
      const re = new RegExp(r.regex, r.flags || 'i');
      return re.test(val);
    } catch {
      return false;
    }
  }) ? 1 : 0;
}

export async function POST(req: NextRequest, context: { params: { attemptId: string } }) {
  const { attemptId } = context.params;
  const attempt: ExamAttempt | undefined = attempts.get(attemptId);
  if (!attempt) {
    return NextResponse.json({ error: 'Invalid attemptId' }, { status: 404 });
  }
  const payload: AnswerPayload = await req.json();
  if (!payload || payload.attemptId !== attemptId || typeof payload.answers !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const questions = await loadQuestionBank();
  const byId = Object.fromEntries(questions.map(q => [q.id, q]));
  let total = 0;
  let breakdown: Record<number, number> = {};
  for (const qid of attempt.questionIds) {
    const q = byId[qid];
    const a = payload.answers[qid];
    if (!q || !a) { breakdown[qid] = 0; continue; }
    let score = 0;
    if (q.type === 'single') score = scoreSingle(q, a);
    else if (q.type === 'multi') score = scoreMulti(q, a);
    else if (q.type === 'tf') score = scoreTF(q, a);
    else if (q.type === 'short') score = scoreShort(q, a); // regex scoring
    breakdown[qid] = score;
    total += score;
  }
  return NextResponse.json({ total, breakdown });
}
