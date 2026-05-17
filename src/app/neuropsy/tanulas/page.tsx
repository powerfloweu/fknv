import questionsRaw from "@/data/neuropsyQuestionBank.json";
import topicsRaw from "@/data/neuropsyTopics.json";
import TanulasClient, { type Q } from "./TanulasClient";

export default function NeuropsyTanulasPage() {
  const questions = questionsRaw as unknown as Q[];
  const topics = topicsRaw as { num: number; name: string }[];
  return <TanulasClient questions={questions} topics={topics} />;
}
