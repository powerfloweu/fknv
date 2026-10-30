import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Vizsga · Fejlődési kognitív idegtudomány" },
};

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
