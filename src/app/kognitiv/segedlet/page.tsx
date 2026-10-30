import type { Metadata } from "next";
import sections from "@/data/kognitivSegedlet.json";
import SegedletClient from "./SegedletClient";

export const metadata: Metadata = { title: "Tanulási segédlet" };

export default function KognitivSegedletPage() {
  return <SegedletClient sections={sections} />;
}
