import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vizsga",
};

export default function KognitivVizsgaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
