
import fs from 'fs/promises';
import path from 'path';
import { Question, ExamBlueprint } from './types';

const dataDir = path.join(process.cwd(), 'src', 'data');

export async function loadQuestionBank(): Promise<Question[]> {
  const file = await fs.readFile(path.join(dataDir, 'questionBank_GOLD.json'), 'utf-8');
  return JSON.parse(file);
}

export async function loadExamBlueprint(): Promise<ExamBlueprint> {
  const file = await fs.readFile(path.join(dataDir, 'examBlueprint.json'), 'utf-8');
  return JSON.parse(file);
}
