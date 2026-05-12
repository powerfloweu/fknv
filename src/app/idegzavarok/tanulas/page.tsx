import questionsRaw from "@/data/idegzavarokQuestionBank.json";
import topicsRaw from "@/data/idegzavarokTopics.json";
import TanulasClient, { type Q } from "./TanulasClient";

export default function IdegzavarokTanulasPage() {
  const questions = questionsRaw as unknown as Q[];
  const topics = topicsRaw as { num: number; name: string }[];
  return <TanulasClient questions={questions} topics={topics} />;
}
