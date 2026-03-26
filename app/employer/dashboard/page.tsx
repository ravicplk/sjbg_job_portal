import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/components/ui/JobCard'
import ApplicationStatusSelect from '@/components/ui/ApplicationStatusSelect'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Briefcase, FileText, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmployerDashboard(props: { searchParams: Promise<{ published?: string }> }) {
  const searchParams = await props.searchParams
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
      {/* Incomplete profile warning */}
      {(!profile?.company_name || !profile?.logo_url) && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-2xl shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-amber-900 text-sm">
                {!profile?.company_name ? 'Company name is missing' : 'Company logo is missing'}
              </p>
              <p className="text-amber-800 text-xs mt-0.5">
                Your company name and logo appear on job listings. Complete your profile so job seekers can recognise your company.
              </p>
            </div>
          </div>
          <Link
            href="/employer/profile"
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 shadow-sm"
            style={{ background: '#520120' }}
          >
            Complete Profile →
          </Link>
        </div>
      )}

      {/* Payment success banner */}
      {searchParams?.published === '1' && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold">Job Published Successfully!</p>
            <p className="text-sm text-green-700">Your payment of LKR 2,500 was processed and your job listing is now live.</p>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 pb-5 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Employer Dashboard</p>
          <h1 className="text-2xl font-extrabold" style={{ color: '#102A4C' }}>
            {profile?.company_name || 'Employer'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your job listings and review applicants.</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/employer/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:border-primary hover:text-primary transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            Edit Profile
          </Link>
          <Link
            href="/employer/jobs/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:brightness-110 transition-all"
            style={{ background: '#102A4C' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Post New Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          label="Active Listings"
          value={activeListings}
          tone="navy"
          icon={<Briefcase className="w-5 h-5" style={{ color: '#102A4C' }} />}
        />
        <StatCard
          label="Total Applications"
          value={totalApplications}
          tone="maroon"
          icon={<FileText className="w-5 h-5" style={{ color: '#520120' }} />}
        />
        <StatCard
          label="Pending Review"
          value={pendingReview}
          tone="mustard"
          icon={<Clock className="w-5 h-5" style={{ color: '#102A4C' }} />}
        />
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
