// Question types
type QuestionType = 'single' | 'multi' | 'tf' | 'short';

type Difficulty = 'easy' | 'medium' | 'hard';

export interface QuestionBase {
  id: number;
  type: QuestionType;
  question: string;
  difficulty: Difficulty;
}

export interface SingleQuestion extends QuestionBase {
  type: 'single';
  options: string[];
  answer: number;
}

export interface MultiQuestion extends QuestionBase {
  type: 'multi';
  options: string[];
  answer: number[];
}

export interface TFQuestion extends QuestionBase {
  type: 'tf';
  answer: boolean;
}

export interface ShortQuestion extends QuestionBase {
  type: 'short';
  criteria: { regex: string; flags?: string }[];
}

export type Question = SingleQuestion | MultiQuestion | TFQuestion | ShortQuestion;

export interface ExamBlueprint {
  examSize: number;
  blockQuotas: Record<Difficulty, number>;
}

export interface ExamAttempt {
  attemptId: string;
  seed: string;
  questionIds: number[];
  startedAt: string;
  durationSec: number;
}

export type AnswerPayload = {
  attemptId: string;
  answers: Record<number, SingleAnswer | MultiAnswer | TFAnswer | ShortAnswer>;
};

export type SingleAnswer = { type: 'single'; value: number };
export type MultiAnswer = { type: 'multi'; value: number[] };
export type TFAnswer = { type: 'tf'; value: boolean };
export type ShortAnswer = { type: 'short'; value: string };
