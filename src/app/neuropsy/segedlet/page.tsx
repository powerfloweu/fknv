import type { Metadata } from "next";
import sections from "@/data/neuropsySegedlet.json";
import SegedletClient from "./SegedletClient";

export const metadata: Metadata = { title: "Tanulási segédlet" };

export default function NeuropsySegedletPage() {
  return <SegedletClient sections={sections} />;
}
