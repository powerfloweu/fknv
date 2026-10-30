import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Kognitív pszichológia", template: "%s · Kognitív pszichológia" },
};

export default function KognitivLayout({ children }: { children: React.ReactNode }) {
  return children;
}
