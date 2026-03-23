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
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white text-[#333333] antialiased min-h-screen flex flex-col`}>
        <NavBar />
        <div
          className="w-full text-center text-sm font-semibold py-2 px-4"
          style={{ backgroundColor: "#F2B705", color: "#333333" }}
        >
          Now accepting early employer listings for upcoming launch.
        </div>
        <main className="flex-1 flex flex-col items-center w-full">
          {children}
        </main>
        <footer className="w-full section-dark border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-bold">SJBG Job Portal</p>
              <p className="text-sm text-white/75">Connecting professionals with mission-aligned employers.</p>
            </div>
            <p className="text-sm text-white/70">© {year} SJBG. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
