import questionsRaw from "@/data/kognitivQuestionBank.json";
import topicsRaw from "@/data/kognitivTopics.json";
import TanulasClient, { type Q } from "./TanulasClient";

export default function KognitivTanulasPage() {
  const questions = questionsRaw as unknown as Q[];
  const topics = topicsRaw as { num: number; name: string }[];
  return <TanulasClient questions={questions} topics={topics} />;
}
