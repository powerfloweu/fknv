// Helper to map JSON question to internal Question type
function mapJsonToQuestion(json: any): import("@/lib/types").Question {
  if (json.típus === 'single') {
    return {
      id: json.id,
      type: 'single',
      question: json.kérdés,
      options: json.válaszlehetőségek,
      answer: json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
      topic: json.téma,
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
      topic: json.téma,
    };
  } else if (json.típus === 'tf') {
    return {
      id: json.id,
      type: 'tf',
      question: json.kérdés,
      answer: json.helyes_válasz,
      difficulty: json.nehézség,
      blokk: json.blokk,
      topic: json.téma,
    };
  } else if (json.típus === 'short' || json.típus === 'regex') {
    return {
      id: json.id,
      type: 'short',
      question: json.kérdés,
      criteria: json.helyes_regex ? [{ regex: json.helyes_regex }] : [],
      difficulty: json.nehézség,
      blokk: json.blokk,
      topic: json.téma,
    };
  }
  throw new Error('Ismeretlen kérdés típus: ' + json.típus);
}

import { promises as fs } from "fs";
import path from "path";

import ClientStudyPage from "./client/ClientStudyPage";

export default async function StudyPage() {
  const filePath = path.join(process.cwd(), "src/data/questionBank.json");
  const file = await fs.readFile(filePath, "utf-8");
  const questions = JSON.parse(file);
  const mappedQuestions = questions.map(mapJsonToQuestion);
  return <ClientStudyPage questions={mappedQuestions} />;
}

// --- ClientStudyPage.tsx ---
// Place this in src/app/study/StudyClient.tsx:
// "use client";
// import { useState, useMemo } from "react";
// export default function ClientStudyPage({ questions }: { questions: any[] }) {
//   ...existing code, but replace all 'import questions from ...' with the 'questions' prop
// }
