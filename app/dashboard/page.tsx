import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/components/ui/JobCard'

export const dynamic = 'force-dynamic'

export default async function SeekerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('seeker_profiles')
    .select('*, users(first_name, last_name)')
    .eq('user_id', user!.id)
    .single()

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      jobs (
        id,
        title,
        location,
        employer_profiles ( company_name )
      )
    `)
    .eq('seeker_id', profile?.id)
    .order('applied_at', { ascending: false })

  const appsList = applications || []
  
  const appsSent = appsList.length
  const interviews = appsList.filter((a: any) => a.status === 'shortlisted').length
  const hired = appsList.filter((a: any) => a.status === 'hired').length

  const userMeta = profile?.users as any;
  const firstName = userMeta?.first_name || 'Seeker'

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">
            Welcome, {firstName}
          </h1>
          <div className="flex items-center gap-4 mt-2">
             <p className="text-slate-500 text-sm">Track your job applications and profile here.</p>
             <span className="text-slate-300">•</span>
             <Link href="/profile" className="text-sm font-medium text-accent hover:text-accent-dark transition-colors inline-flex items-center">
               <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               Edit Profile & Resume
             </Link>
          </div>
        </div>
        <Link href="/" className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm inline-flex items-center text-sm">
          Browse Jobs
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Applications Sent" value={appsSent} />
        <StatCard label="Shortlisted / Interviews" value={interviews} />
        <StatCard label="Offers / Hired" value={hired} />
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Applications</h2>
      <div className="bg-white border rounded-lg overflow-hidden">
        {appsList.length === 0 ? (
          <div className="p-10 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No applications sent</h3>
            <p className="text-slate-500 text-sm mb-4">You haven't applied to any jobs yet.</p>
            <Link href="/" className="text-primary hover:underline group inline-flex items-center font-medium">
              Find a job to apply for <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-500">
                  <th className="p-4 font-semibold">Job Title</th>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Applied On</th>
                  <th className="p-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {appsList.map((app: any) => {
                  const job = app.jobs
                  const companyName = job?.employer_profiles?.company_name || 'Unknown Company'
                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-4">
                        <Link href={`/jobs/${job.id}`} className="font-medium text-primary hover:underline block">{job.title}</Link>
                        <span className="text-xs text-slate-500">{job.location}</span>
                      </td>
                      <td className="p-4 text-slate-700 text-sm font-medium">
                        {companyName}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {formatRelativeTime(app.applied_at)}
                      </td>
                      <td className="p-4 text-right">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
