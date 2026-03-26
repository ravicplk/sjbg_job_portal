'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [role, setRole] = useState<'job_seeker' | 'employer'>('job_seeker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const acceptedTerms = formData.get('terms')
    if (!acceptedTerms) {
      setError('You must accept the terms before proceeding.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      })

      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Failed to register')

      window.location.href = body.redirectTo || '/'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
              'radial-gradient(ellipse 70% 60% at 70% 60%, rgba(242,183,5,0.12) 0%, transparent 70%)',
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
            Join the<br />
            <span style={{ color: '#F2B705' }}>Guild.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            Create your account and become part of the Twin Cities Catholic business network.
          </p>

          {/* Feature list */}
          <ul className="mt-8 space-y-3">
            {[
              'Browse exclusive local job listings',
              'Connect with values-aligned employers',
              'Build and share your resume',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/70 text-sm">
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(242,183,5,0.25)', color: '#F2B705' }}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom tag */}
        <div className="relative z-10">
          <p className="text-white/25 text-xs font-medium">
            It&apos;s free to join. No credit card required.
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white overflow-y-auto">
        {/* Mobile logo */}
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

          <h1 className="text-3xl font-black text-primary mb-1">Create Account</h1>
          <p className="text-sm text-slate-500 mb-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={signUp} className="space-y-4">
            {/* Role selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">I am joining as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('job_seeker')}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={
                    role === 'job_seeker'
                      ? { borderColor: '#520120', background: '#fdf4f7' }
                      : { borderColor: '#e2e8f0', background: '#fff' }
                  }
                >
                  <div
                    className="text-sm font-bold mb-0.5"
                    style={{ color: role === 'job_seeker' ? '#520120' : '#374151' }}
                  >
                    🧑‍💼 Job Seeker
                  </div>
                  <p className="text-xs text-slate-500">Browse &amp; apply for jobs.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className="p-4 rounded-xl border-2 text-left transition-all"
                  style={
                    role === 'employer'
                      ? { borderColor: '#520120', background: '#fdf4f7' }
                      : { borderColor: '#e2e8f0', background: '#fff' }
                  }
                >
                  <div
                    className="text-sm font-bold mb-0.5"
                    style={{ color: role === 'employer' ? '#520120' : '#374151' }}
                  >
                    🏢 Employer
                  </div>
                  <p className="text-xs text-slate-500">Post jobs &amp; hire talent.</p>
                </button>
              </div>
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white transition-colors"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                className="mt-0.5 w-4 h-4 rounded"
                style={{ accentColor: '#520120' }}
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed">
                I accept the{' '}
                <a href="#" className="text-primary hover:underline font-semibold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#102A4C' }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
