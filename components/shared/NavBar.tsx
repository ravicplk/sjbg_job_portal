import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import NavLinks from './NavLinks'

export default async function NavBar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  if (user) {
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    role = data?.role ?? null
  }

  return (
    <nav
      className="w-full sticky top-0 z-50"
      style={{
        backgroundColor: '#520120',
        borderBottom: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-[84px]">

          {/* ── Brand / Logo ────────────────────────────────────────────── */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3.5 group">
              {/* Logo image — no wrapper div */}
              <Image
                src="/logo.avif"
                alt="St. Joseph Business Guild Job Portal"
                width={64}
                height={64}
                className="w-16 h-16 object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />

              {/* Three-line brand name */}
              <div className="leading-tight flex flex-col gap-[1px]">
                <span
                  className="font-black tracking-wide"
                  style={{ color: '#F2B705', fontSize: '25px', lineHeight: 1.1 }}
                >
                  St. Joseph
                </span>
                <span
                  className="font-bold text-white tracking-wide"
                  style={{ fontSize: '16px', lineHeight: 1.1 }}
                >
                  Business Guild
                </span>
                <span
                  className="font-semibold tracking-widest uppercase"
                  style={{ color: 'rgba(255,255,255,0.55)', fontSize: '11px', lineHeight: 1.1 }}
                >
                  Job Portal
                </span>
              </div>
            </Link>
          </div>

          {/* ── Centre nav links (Client Component — handles active state) ── */}
          <NavLinks role={role} hasUser={!!user} />

          {/* ── Right action area ────────────────────────────────────────── */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-white/90 hover:text-[#F2B705] px-4 py-2 rounded-lg transition-colors duration-150"
                  style={{ border: '1px solid rgba(255,255,255,0.20)' }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:brightness-110"
                  style={{ background: '#F2B705', color: '#3C0018' }}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {role === 'employer' && (
                  <Link
                    href="/employer/jobs/new"
                    className="text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 hover:brightness-110"
                    style={{ background: '#F2B705', color: '#3C0018' }}
                  >
                    + Post a Job
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST" className="inline-flex">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-white/80 hover:text-[#F2B705] px-4 py-2 rounded-lg transition-colors duration-150 cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.18)' }}
                  >
                    Log out
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}
