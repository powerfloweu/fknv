
import { promises as fs } from "fs";
import path from "path";

import ClientStudyPage from "./client/ClientStudyPage";

export default async function StudyPage() {
  const filePath = path.join(process.cwd(), "src/data/questionBank.json");
  const file = await fs.readFile(filePath, "utf-8");
  const questions = JSON.parse(file);
  return <ClientStudyPage questions={questions} />;
}

// --- ClientStudyPage.tsx ---
// Place this in src/app/study/StudyClient.tsx:
// "use client";
// import { useState, useMemo } from "react";
// export default function ClientStudyPage({ questions }: { questions: any[] }) {
//   ...existing code, but replace all 'import questions from ...' with the 'questions' prop
// }
