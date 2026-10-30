import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vizsga",
};

export default function NeuropsyVizsgaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
