import questionsRaw from "@/data/idegzavarokQuestionBank.json";
import topicsRaw from "@/data/idegzavarokTopics.json";
import KvizClient, { type Q } from "./KvizClient";

export default function IdegzavarokKvizPage() {
  const questions = questionsRaw as unknown as Q[];
  const topics = topicsRaw as { num: number; name: string }[];
  return <KvizClient questions={questions} topics={topics} />;
}
