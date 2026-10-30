import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Kenyérszöveg és felület: Source Sans 3; címsorok és hosszabb olvasnivaló: Source Serif 4.
// A latin-ext részhalmaz kell a magyar ő/ű betűkhöz.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin", "latin-ext"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Tanuló- és Vizsgaplatform",
    template: "%s · Tanulóplatform",
  },
  description: "Pszichológia MA tárgyak: kérdésbankok, tanulási segédletek, próbavizsgák és klinikai esetek",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body
        className={`${sourceSans.variable} ${sourceSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
