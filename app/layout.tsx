import type { Metadata } from "next";
import { Cinzel, Press_Start_2P } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700", "900"],
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight: "400",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Eaux Inexplorees — Tableau de Bord",
  description: "Le voyage coopératif de l'équipe marketing. Naviguez, explorez, conquérez.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body
        className={`${cinzel.variable} ${pressStart.variable} ${geistSans.variable} antialiased bg-navy text-cream-DEFAULT`}
      >
        {children}
      </body>
    </html>
  );
}
