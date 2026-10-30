import type { Metadata } from "next";
import { notFound } from "next/navigation";
import casesRaw from "@/data/neuropsyCases.json";
import CaseClient, { type Case } from "./CaseClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `${id}. klinikai eset` };
}

export default async function NeuropsyCaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const cases = casesRaw as Case[];
  const found = cases.find((c) => c.id === id);
  if (!found) notFound();
  return <CaseClient cse={found} />;
}
