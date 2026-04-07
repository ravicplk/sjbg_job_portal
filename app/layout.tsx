import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import NavBar from "@/components/shared/NavBar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SJBG Job Portal",
  description: "Jobs inside the Twin Cities Catholic business community.",
  icons: {
    icon: "/logo.avif",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();
  const h = await headers();
  // x-pathname is stamped reliably by middleware on every request
  const pathname = h.get("x-pathname") || "";
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAdmin) {
    // Full dark shell — no site navbar / announcement / footer
    return (
      <html lang="en">
        <body
          className={`${inter.variable} font-sans antialiased`}
          style={{ background: "#121212", color: "#fff", minHeight: "100vh" }}
        >
          {children}
        </body>
      </html>
    );
  }

  if (isAuthPage) {
    // Auth pages — no navbar or footer, full-screen clean shell
    return (
      <html lang="en">
        <body className={`${inter.variable} font-sans bg-white text-[#333333] antialiased min-h-screen flex flex-col`}>
          <main className="flex-1 flex flex-col w-full">
            {children}
          </main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-white text-[#333333] antialiased min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-1 flex flex-col items-center w-full">
          {children}
        </main>
        <footer
          className="w-full"
          style={{
            background: 'linear-gradient(160deg, #520120 0%, #3C0018 50%, #1a000b 100%)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Main footer content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* Brand column */}
              <div className="md:col-span-1">
                <div className="flex flex-col gap-[2px] mb-4">
                  <span className="font-black text-[22px] leading-tight" style={{ color: '#F2B705' }}>
                    St. Joseph
                  </span>
                  <span className="font-bold text-white text-[15px] leading-tight">Business Guild</span>
                  <span className="font-semibold text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Job Portal
                  </span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed max-w-xs">
                  Connecting Catholic professionals with mission-aligned employers across the Twin Cities community.
                </p>
              </div>

              {/* Quick links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Quick Links</h4>
                <ul className="space-y-2.5">
                  {[
                    { href: '/', label: 'Browse Jobs' },
                    { href: '/login', label: 'Sign In' },
                    { href: '/register', label: 'Join the Guild' },
                    { href: '/employer/jobs/new', label: 'Post a Job' },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <a
                        href={href}
                        className="text-sm text-white/65 hover:text-[#F2B705] transition-colors duration-150 inline-flex items-center gap-1.5 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-50 group-hover:opacity-100 transition-opacity" />
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community column */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Community</h4>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  Part of the St. Joseph Business Guild — a network of Catholic-owned businesses committed to serving with excellence and integrity.
                </p>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(242,183,5,0.12)',
                    border: '1px solid rgba(242,183,5,0.25)',
                    color: '#F2B705',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2B705] animate-pulse" />
                  Now accepting employer listings
                </div>
              </div>

            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-xs text-white/35">
                © {year} St. Joseph Business Guild. All rights reserved.
              </p>
              <div className="flex items-center gap-5">
                <a href="#" className="text-xs text-white/35 hover:text-white/70 transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-white/35 hover:text-white/70 transition-colors">Terms of Service</a>
                <a href="#" className="text-xs text-white/35 hover:text-white/70 transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
