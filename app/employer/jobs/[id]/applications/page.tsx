import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ApplicationStatusSelect from '@/components/ui/ApplicationStatusSelect'
import { formatRelativeTime } from '@/components/ui/JobCard'

export default async function JobApplicationsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify ownership
  const { data: job } = await supabase.from('jobs').select('title, employer_id, employer_profiles!inner(user_id)').eq('id', params.id).single() as any
  const actualUserId = job && Array.isArray(job.employer_profiles) ? job.employer_profiles[0]?.user_id : job?.employer_profiles?.user_id
  if (!job || actualUserId !== user?.id) {
    notFound()
  }

  // Fetch applications
  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      cover_note,
      seeker_profiles (
        id,
        user_id,
        headline,
        location,
        phone,
        linkedin_url,
        resume_url,
        users!inner (first_name, last_name, email)
      )
    `)
    .eq('job_id', params.id)
    .order('applied_at', { ascending: false })

  const applicationsData = applications || [];
  
  const appsWithResumes = await Promise.all(applicationsData.map(async (app: any) => {
     let resumeSignedUrl = null;
     const seeker = Array.isArray(app.seeker_profiles) ? app.seeker_profiles[0] : app.seeker_profiles;
     if (seeker?.resume_url) {
       const { data } = await supabase.storage.from('resumes').createSignedUrl(seeker.resume_url, 3600)
       resumeSignedUrl = data?.signedUrl
     }
     return { ...app, resumeSignedUrl, _seeker: seeker }
  }))

  const updateStatus = async (appId: string, newStatus: string) => {
    'use server'
    const supabase = await createClient()
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)
  }

  return (
    <div className="max-w-6xl w-full mx-auto px-4 py-8">
      <Link href="/employer/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary mb-6 inline-flex items-center transition-colors">
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </Link>
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Applications</h1>
          <p className="text-slate-600 font-medium">For: {job.title}</p>
        </div>
        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">
          Total: {applications?.length || 0}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        {(!applications || applications.length === 0) ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <h3 className="text-lg font-medium text-slate-800 mb-1">No applications yet</h3>
            <p className="text-slate-500 text-sm">When job seekers apply, their applications will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-500">
                  <th className="p-4 font-semibold">Applicant</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Applied</th>
                  <th className="p-4 font-semibold">Resume / Cover Note</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {appsWithResumes.map((app: any) => {
                  const seeker = app._seeker || {}
                  const user = Array.isArray(seeker?.users) ? seeker?.users[0] : seeker?.users
                  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown'
                  
                  return (
                    <tr key={app.id} className="border-b last:border-0 hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-medium text-slate-900">{name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{seeker?.headline || 'No headline'}</div>
                        <div className="text-xs text-primary mt-1">{user?.email}</div>
                        <div className="text-xs text-slate-500 mt-1">{seeker?.phone}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {seeker?.location || 'Not specified'}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {formatRelativeTime(app.applied_at)}
                      </td>
                      <td className="p-4 text-sm">
                        <div className="mb-2">
                          {app.resumeSignedUrl ? (
                            <a href={app.resumeSignedUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dark font-medium inline-flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              View Resume
                            </a>
                          ) : (
                            <span className="text-slate-400">No Resume</span>
                          )}
                        </div>
                        {app.cover_note && (
                          <details className="text-xs text-slate-600 bg-slate-50 p-2 rounded border cursor-pointer">
                            <summary className="font-medium outline-none">View Cover Note</summary>
                            <p className="mt-2 text-slate-700 whitespace-pre-wrap">{app.cover_note}</p>
                          </details>
                        )}
                      </td>
                      <td className="p-4">
                        <ApplicationStatusSelect applicationId={app.id} currentStatus={app.status} updateAction={updateStatus} />
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
