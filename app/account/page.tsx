import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function AccountPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?message=Please sign in first')

  const { data: baseUser } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, role')
    .eq('id', user.id)
    .single()

  const role = baseUser?.role || 'job_seeker'

  let profileDetails: Record<string, string> = {}
  let editHref = '/profile'
  let dashboardHref = '/dashboard'

  if (role === 'employer') {
    const { data: profile } = await supabase
      .from('employer_profiles')
      .select('company_name, industry, website, phone')
      .eq('user_id', user.id)
      .single()

    profileDetails = {
      Company: profile?.company_name || 'Not set',
      Industry: profile?.industry || 'Not set',
      Phone: profile?.phone || 'Not set',
      Website: profile?.website || 'Not set',
    }
    editHref = '/employer/profile'
    dashboardHref = '/employer/dashboard'
  } else if (role === 'admin') {
    profileDetails = {
      Role: 'Administrator',
      Email: baseUser?.email || user.email || 'Not set',
    }
    editHref = '/admin/dashboard'
    dashboardHref = '/admin/dashboard'
  } else {
    const { data: profile } = await supabase
      .from('seeker_profiles')
      .select('headline, location, phone, linkedin_url')
      .eq('user_id', user.id)
      .single()

    profileDetails = {
      Headline: profile?.headline || 'Not set',
      Location: profile?.location || 'Not set',
      Phone: profile?.phone || 'Not set',
      LinkedIn: profile?.linkedin_url || 'Not set',
    }
    editHref = '/profile'
    dashboardHref = '/dashboard'
  }

  const fullName = `${baseUser?.first_name || ''} ${baseUser?.last_name || ''}`.trim() || 'Member'

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-10">
      <div className="surface-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Profile Details</h1>
            <p className="text-slate-700 mt-1">{fullName}</p>
            <p className="text-sm text-slate-600">{baseUser?.email || user.email}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-amber-50 border border-amber-200 text-[#333333]">
            {role.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {Object.entries(profileDetails).map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-semibold tracking-wide uppercase text-slate-600">{label}</p>
              <p className="text-sm text-slate-800 mt-1 break-words">{value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={editHref} className="bg-action hover:bg-action-light text-white px-5 py-2.5 rounded-md font-semibold text-center transition-colors">
            Edit Details
          </Link>
          <Link href={dashboardHref} className="bg-white border border-slate-300 text-slate-800 px-5 py-2.5 rounded-md font-semibold text-center hover:bg-slate-50 transition-colors">
            Open Dashboard
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full sm:w-auto bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-md font-semibold transition-colors">
              Log out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

