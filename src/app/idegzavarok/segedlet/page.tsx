import type { Metadata } from "next";
import sections from "@/data/idegzavarokSegedlet.json";
import SegedletClient from "./SegedletClient";

export const metadata: Metadata = { title: "Tanulási segédlet" };

export default function IdegzavarokSegedletPage() {
  return <SegedletClient sections={sections} />;
}
