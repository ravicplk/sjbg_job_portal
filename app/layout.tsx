import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/shared/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SJBG Job Portal",
  description: "Jobs inside the Twin Cities Catholic business community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-gray-50 text-slate-800 antialiased min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-1 flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
