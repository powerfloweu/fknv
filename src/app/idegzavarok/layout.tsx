import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Idegrendszer fejlődési zavarai", template: "%s · Idegrendszer fejlődési zavarai" },
};

export default function IdegzavarokLayout({ children }: { children: React.ReactNode }) {
  return children;
}
