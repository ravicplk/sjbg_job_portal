import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { loginSchema } from '@/utils/validation/forms'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams

  const signIn = async (formData: FormData) => {
    'use server'

    const parsed = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    if (!parsed.success) {
      const message = encodeURIComponent(parsed.error.issues[0]?.message || 'Invalid login details')
      return redirect(`/login?message=${message}`)
    }

    const { email, password } = parsed.data
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return redirect('/login?message=Could not authenticate user')

    return redirect('/')
  }

  return (
    <div className="flex-1 w-full flex min-h-[calc(100vh-80px)]">
      {/* ── Left branding panel ───────────────────────────────────────────── */}
      <div
        className="hidden lg:flex w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #520120 0%, #3C0018 55%, #1a000b 100%)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 30% 40%, rgba(242,183,5,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white/10 border border-white/20">
            <Image src="/logo.avif" alt="SJBG Logo" width={44} height={44} className="object-contain" />
          </div>
          <div>
            <div className="text-white font-extrabold text-lg tracking-tight leading-tight">SJBG</div>
            <div className="text-white/50 text-xs font-semibold tracking-widest uppercase">Job Portal</div>
          </div>
        </div>

        {/* Centre copy */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white leading-snug mb-4">
            Welcome<br />
            <span style={{ color: '#F2B705' }}>back.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Connect with mission-aligned employers inside the Twin Cities Catholic business community.
          </p>

          {/* Decorative quote card */}
          <div
            className="mt-10 p-5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <p className="text-white/75 text-sm italic leading-relaxed">
              "Find meaningful work that aligns with your values and your community."
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="w-6 h-0.5 rounded" style={{ background: '#F2B705' }} />
              <span className="text-white/40 text-xs font-semibold tracking-wide">SJBG Guild</span>
            </div>
          </div>
        </div>

        {/* Bottom tag */}
        <div className="relative z-10">
          <p className="text-white/25 text-xs font-medium">
            Trusted by Catholic businesses across the Twin Cities.
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        {/* Mobile logo (only shows on small screens) */}
        <div className="lg:hidden mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center bg-primary/10 border border-primary/20 mb-3">
            <Image src="/logo.avif" alt="SJBG Logo" width={48} height={48} className="object-contain" />
          </div>
          <p className="text-sm font-bold text-primary">SJBG Job Portal</p>
        </div>

        <div className="w-full max-w-md">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center text-sm text-slate-500 hover:text-primary transition-colors mb-8 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to homepage
          </Link>

          <h1 className="text-3xl font-black text-primary mb-1">Sign In</h1>
          <p className="text-sm text-slate-500 mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Join the Guild
            </Link>
          </p>

          {searchParams?.message && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {searchParams.message}
            </div>
          )}

          <form action={signIn} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
              style={{ backgroundColor: '#102A4C' }}
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <Link
            href="/register"
            className="w-full block text-center py-3 rounded-xl text-sm font-semibold border-2 transition-all hover:border-primary hover:text-primary"
            style={{ borderColor: '#520120', color: '#520120' }}
          >
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  )
}
