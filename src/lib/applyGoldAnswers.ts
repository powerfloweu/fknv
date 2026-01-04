import questionBank from "@/data/questionBank.json";
import examBlueprint from "@/data/examBlueprint.json";

/**
 * Centralized data loading for API routes and server logic.
 * These exports are REQUIRED by app/api/exam/start/route.ts
 */

export function loadQuestionBank() {
  return questionBank;
}

export function loadExamBlueprint() {
  // Placeholder until blueprint logic is finalized
  return examBlueprint ?? null;
}