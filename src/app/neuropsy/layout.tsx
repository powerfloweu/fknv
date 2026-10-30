import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Neuropszichológia", template: "%s · Neuropszichológia" },
};

export default function NeuropsyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
