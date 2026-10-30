import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Tanuló mód · Fejlődési kognitív idegtudomány" },
};

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
