import { questionBank, Question } from '../data/questionBank';

// Véletlenszerűen kiválaszt 90 kérdést a kérdésbankból
export function getRandomExamQuestions(count = 90): Question[] {
  const shuffled = [...questionBank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Időzítő (1 perc/kérdés) logika váz
export function getQuestionTimerSeconds() {
  return 60; // 1 perc
}
