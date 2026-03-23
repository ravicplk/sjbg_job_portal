import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function LoginPage(props: { searchParams: Promise<{ message?: string }> }) {
  const searchParams = await props.searchParams;
  const signIn = async (formData: FormData) => {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/login?message=Could not authenticate user')
    }

    // Role redirection is handled by middleware automatically
    return redirect('/')
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-sm flex items-center group text-primary hover:bg-amber-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}
        Back
      </Link>

      <form
        className="animate-in flex-1 flex flex-col w-full justify-center gap-4 text-slate-800 surface-card p-8"
        action={signIn}
      >
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl font-bold text-primary">Sign In</h1>
          <p className="text-sm text-slate-500">Welcome back to the SJBG Job Portal</p>
        </div>

        {searchParams?.message && (
          <p className="mt-4 p-4 bg-red-100 text-red-600 text-sm text-center border-l-4 border-red-500">
            {searchParams.message}
          </p>
        )}

        <label className="text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-white border text-sm mb-2 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          name="email"
          type="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-white border text-sm mb-4 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <div className="flex justify-end text-sm text-primary hover:underline -mt-2 mb-4">
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        <button className="bg-action hover:bg-action-light text-white rounded-md px-4 py-2 font-semibold mb-2 w-full transition-colors">
          Sign In
        </button>
        
        <p className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Join the Guild
          </Link>
        </p>
      </form>
    </div>
  )
}
