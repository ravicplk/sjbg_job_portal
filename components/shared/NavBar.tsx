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
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-serif font-bold text-primary flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center text-sm font-sans">SJ</span>
              SJBG Jobs
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {!user ? (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary px-2 transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="text-sm font-medium text-white bg-primary hover:bg-primary-light px-4 py-2 rounded-md transition-colors">
                  Join
                </Link>
                <Link href="/register" className="text-sm font-medium text-accent border border-accent hover:bg-accent/10 px-4 py-2 rounded-md transition-colors hidden sm:block">
                  Post a job
                </Link>
              </>
            ) : (
              <>
                {role === 'employer' && (
                <>
                <Link href="/employer/dashboard" className="text-slate-600 hover:text-primary font-medium transition-colors">Dashboard</Link>
                <Link href="/employer/profile" className="text-slate-600 hover:text-primary font-medium transition-colors">Profile</Link>
                <Link href="/employer/jobs/new" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium transition-colors text-sm shadow-sm">Post a Job</Link>
                </>
              )}
                {role === 'job_seeker' && (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary px-2">
                       Dashboard
                    </Link>
                    <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-primary px-2">
                       Profile
                    </Link>
                    <Link href="/resume-builder" className="text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 px-3 py-1.5 rounded-md transition-colors ml-2">
                       Resume Builder
                    </Link>
                  </>
                )}
                {role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-sm font-medium text-slate-600 hover:text-primary">
                    Admin Panel
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST" className="inline-flex">
                   <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800 ml-2 sm:ml-4 transition-colors">
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
