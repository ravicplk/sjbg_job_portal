import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/components/ui/JobCard'
import ApplicationStatusSelect from '@/components/ui/ApplicationStatusSelect'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?message=Please sign in first')
  
  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
  if (!profile) redirect('/employer/profile?message=Please complete company profile first')

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      applications ( id, status )
    `)
    .eq('employer_id', profile?.id)
    .order('created_at', { ascending: false })

  const jobsList = jobs || []

  const { data: recentApplications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      cover_note,
      jobs!inner (
        id,
        title,
        employer_id
      ),
      seeker_profiles (
        id,
        phone,
        resume_url,
        users!inner (first_name, last_name, email)
      )
    `)
    .eq('jobs.employer_id', profile?.id)
    .order('applied_at', { ascending: false })
    .limit(10)

  const appsReviewListRaw = recentApplications || []
  const appsReviewList = await Promise.all(
    appsReviewListRaw.map(async (app: any) => {
      const seeker = Array.isArray(app.seeker_profiles) ? app.seeker_profiles[0] : app.seeker_profiles
      let resumeSignedUrl: string | null = null
      if (seeker?.resume_url) {
        const { data } = await supabase.storage.from('resumes').createSignedUrl(seeker.resume_url, 3600)
        resumeSignedUrl = data?.signedUrl || null
      }
      return { ...app, _seeker: seeker, resumeSignedUrl }
    })
  )
  
  const activeListings = jobsList.filter(j => j.status === 'active').length
  const totalApplications = jobsList.reduce((acc, job) => acc + (job.applications?.length || 0), 0)
  const pendingReview = jobsList.reduce((acc, job) => {
    return acc + (job.applications?.filter((a: any) => a.status === 'pending').length || 0)
  }, 0)

  const updateApplicationStatus = async (appId: string, newStatus: string) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: app } = await supabase
      .from('applications')
      .select('id, job_id, jobs!inner(id, employer_id, employer_profiles!inner(user_id))')
      .eq('id', appId)
      .maybeSingle() as any

    const appEmployerUserId =
      app?.jobs && Array.isArray(app.jobs.employer_profiles)
        ? app.jobs.employer_profiles[0]?.user_id
        : app?.jobs?.employer_profiles?.user_id

    if (!app || appEmployerUserId !== user.id) return

    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)
    revalidatePath('/employer/dashboard')
    if (app?.job_id) revalidatePath(`/employer/jobs/${app.job_id}/applications`)
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">
            Welcome, {profile?.company_name || 'Employer'}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-600 text-sm">Manage your job listings and applicants here.</p>
            <span className="text-slate-300">•</span>
            <Link href="/employer/profile" className="text-sm font-semibold text-action hover:text-primary transition-colors inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Edit Company Profile
            </Link>
          </div>
        </div>
        <Link href="/employer/jobs/new" className="bg-action hover:bg-action-light text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm inline-flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          Post New Job
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Active Listings" value={activeListings} />
        <StatCard label="Total Applications" value={totalApplications} />
        <StatCard label="Pending Review" value={pendingReview} />
      </div>

      <h2 className="text-xl font-bold text-[#333333] mb-4">Recent Listings</h2>
      <div className="surface-card overflow-hidden">
        {jobsList.length === 0 ? (
          <div className="p-10 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No jobs posted yet</h3>
            <p className="text-slate-600 text-sm mb-4">Create your first job listing to start receiving applications.</p>
            <Link href="/employer/jobs/new" className="text-action hover:text-primary group inline-flex items-center font-semibold transition-colors">
              Post a job now <svg className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-700">
                  <th className="p-4 font-semibold">Job Title</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Applications</th>
                  <th className="p-4 font-semibold">Posted</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobsList.map((job) => (
                  <tr key={job.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-4">
                      <Link href={`/jobs/${job.id}`} className="font-semibold text-primary hover:text-action transition-colors block">{job.title}</Link>
                      <span className="text-xs text-slate-600">{job.location} • {job.role_type}</span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/employer/jobs/${job.id}/applications`} className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20">
                        {job.applications?.length || 0}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {formatRelativeTime(job.created_at)}
                    </td>
                    <td className="p-4 text-right space-x-4 text-sm whitespace-nowrap">
                      <Link href={`/employer/jobs/${job.id}/edit`} className="text-action hover:text-primary font-semibold transition-colors">Edit</Link>
                      <Link href={`/employer/jobs/${job.id}/applications`} className="text-primary hover:text-action font-semibold transition-colors">View Apps</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold text-[#333333] mt-10 mb-4">Recent Applications (Review)</h2>
      <div className="surface-card overflow-hidden">
        {appsReviewList.length === 0 ? (
          <div className="p-8 text-center text-slate-600 text-sm">
            No applications received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-700">
                  <th className="p-4 font-semibold">Applicant</th>
                  <th className="p-4 font-semibold">Applied For</th>
                  <th className="p-4 font-semibold">Submitted Details</th>
                  <th className="p-4 font-semibold">CV</th>
                  <th className="p-4 font-semibold">Applied</th>
                  <th className="p-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {appsReviewList.map((app: any) => {
                  const seeker = app._seeker || {}
                  const user = Array.isArray(seeker?.users) ? seeker.users[0] : seeker?.users
                  const dbName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown'
                  const note = String(app.cover_note || '')
                  const submittedName = note.match(/Applicant Name:\s*(.*)/i)?.[1]?.trim()
                  const submittedPhone = note.match(/Telephone:\s*(.*)/i)?.[1]?.trim()
                  const submittedQualification = note.match(/Qualification:\s*(.*)/i)?.[1]?.trim()
                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-4 text-sm">
                        <div className="font-semibold text-slate-900">{submittedName || dbName}</div>
                        <div className="text-xs text-slate-600">{user?.email || 'No email'}</div>
                        <div className="text-xs text-slate-600">{submittedPhone || seeker?.phone || 'No phone'}</div>
                      </td>
                      <td className="p-4 text-sm">
                        <Link href={`/jobs/${app.jobs?.id}`} className="font-semibold text-primary hover:text-action transition-colors">
                          {app.jobs?.title || 'Job'}
                        </Link>
                      </td>
                      <td className="p-4 text-xs text-slate-700">
                        <div><span className="font-semibold">Qualification:</span> {submittedQualification || 'Not provided'}</div>
                      </td>
                      <td className="p-4 text-sm">
                        {app.resumeSignedUrl ? (
                          <a href={app.resumeSignedUrl} target="_blank" rel="noopener noreferrer" className="text-action hover:text-primary font-semibold transition-colors">
                            View CV
                          </a>
                        ) : (
                          <span className="text-slate-500">No CV</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {formatRelativeTime(app.applied_at)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="inline-flex flex-col items-end gap-2">
                          <StatusBadge status={app.status} />
                          <ApplicationStatusSelect
                            applicationId={app.id}
                            currentStatus={app.status}
                            updateAction={updateApplicationStatus}
                          />
                        </div>
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
