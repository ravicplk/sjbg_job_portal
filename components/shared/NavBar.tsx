import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function NavBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = null;
  if (user) {
    const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
    role = data?.role
  }

  return (
    <nav
      className="w-full border-b border-primary-dark sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: '#520120' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-semibold text-white flex items-center gap-3 tracking-tight">
              <span className="w-9 h-9 bg-transparent border border-white/40 text-white rounded-none flex items-center justify-center text-base font-bold">SJ</span>
              SJBG Jobs
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-5">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="text-base font-semibold text-white bg-primary-light hover:bg-accent hover:text-primary-dark px-5 py-2.5 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  Sign in
                </Link>
                <Link href="/register" className="text-base font-semibold text-white bg-action hover:bg-accent hover:text-primary-dark px-5 py-2.5 rounded-md transition-colors shadow-sm cursor-pointer">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                {role === 'employer' && (
                <>
                <Link href="/employer/dashboard" className="text-base text-white hover:text-accent font-semibold transition-colors cursor-pointer">Dashboard</Link>
                <Link href="/employer/profile" className="text-base text-white hover:text-accent font-semibold transition-colors cursor-pointer">Profile</Link>
                <Link href="/employer/jobs/new" className="bg-action hover:bg-action-light text-white px-5 py-2.5 rounded-md font-semibold transition-colors text-base shadow-sm cursor-pointer">Post a Job</Link>
                </>
              )}
                {role === 'job_seeker' && (
                  <>
                    <Link href="/dashboard" className="text-base font-semibold text-white hover:text-accent px-2 transition-colors cursor-pointer">
                       Dashboard
                    </Link>
                    <Link href="/profile" className="text-base font-semibold text-white hover:text-accent px-2 transition-colors cursor-pointer">
                       Profile
                    </Link>
                    <Link href="/resume-builder" className="text-base font-semibold text-white bg-action hover:bg-action-light px-4 py-2 rounded-md transition-colors ml-2 cursor-pointer">
                       Resume Builder
                    </Link>
                  </>
                )}
                {role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-base font-semibold text-white hover:text-accent transition-colors cursor-pointer">
                    Admin Panel
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST" className="inline-flex ml-2 sm:ml-4">
                  <button
                    type="submit"
                    className="text-base font-semibold text-white bg-action hover:bg-accent hover:text-primary-dark px-5 py-2.5 rounded-md transition-colors shadow-sm cursor-pointer"
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
