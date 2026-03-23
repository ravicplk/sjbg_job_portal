import { createClient } from '@/utils/supabase/server'
import { formatRelativeTime } from '@/components/ui/JobCard'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ApplyModal from '@/components/ui/ApplyModal'
import { revalidatePath } from 'next/cache'
import { applicationSchema } from '@/utils/validation/forms'

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name, logo_url, website, about)')
    .eq('id', params.id)
    .single()

  let role = null;
  let hasApplied = false;
  if (user) {
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
    role = userData?.role

    if (role === 'job_seeker') {
      const { data: profile } = await supabase.from('seeker_profiles').select('id').eq('user_id', user.id).single()
      if (profile) {
        const { data: app } = await supabase.from('applications').select('id').eq('job_id', job?.id).eq('seeker_id', profile.id).maybeSingle()
        hasApplied = !!app
      }
    }
  }

  const submitApplication = async (jobId: string, formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    
    const { data: profile } = await supabase.from('seeker_profiles').select('*').eq('user_id', user.id).single()
    if (!profile) return { error: 'Profile not found' }
    if (!profile.resume_url) return { error: 'You must fully upload a resume to your profile before applying. Visit your Seeker Dashboard.' }

    const parsed = applicationSchema.safeParse({
      cover_note: formData.get('cover_note'),
    })
    if (!parsed.success) return { error: parsed.error.issues[0]?.message || 'Invalid application data' }
    const { cover_note } = parsed.data
    
    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      seeker_id: profile.id,
      cover_note: cover_note || null,
      status: 'pending'
    })

    if (error) return { error: error.message }
    
    revalidatePath('/')
    revalidatePath(`/jobs/${jobId}`)
    return {}
  }

  if (error || !job) {
    notFound()
  }

  const company = job.employer_profiles
  const initials = company?.company_name?.substring(0, 2).toUpperCase() || 'NA'

  const requirementsList = job.requirements.split('\\n').filter((item: string) => item.trim() !== '')

  return (
    <div className="w-full flex-col flex items-center min-h-screen bg-white">
      {/* Header */}
      <div className="w-full border-b border-gray-200 bg-gray-50 pt-10 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="inline-flex items-center text-sm font-semibold text-slate-700 hover:text-primary mb-8 transition-colors">
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to jobs
          </Link>
          
          <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
            <div className="flex gap-6 items-center md:items-start">
              <div className="flex-shrink-0">
                {company?.logo_url ? (
                  <img src={company.logo_url} alt={company.company_name} className="w-20 h-20 rounded-lg object-cover border shadow-sm bg-white" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-accent/20 text-accent-dark flex items-center justify-center text-2xl font-bold shadow-sm">
                    {initials}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{job.title}</h1>
                <div className="text-lg text-slate-700 font-medium mb-4">{company?.company_name}</div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {job.category || 'General'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {job.role_type}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location || 'Remote'}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {job.experience_level}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                    Posted {formatRelativeTime(job.created_at)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 md:ml-auto">
              {job.status === 'active' ? (
                 role === 'employer' || role === 'admin' ? (
                  <div className="block w-full text-center md:w-auto px-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-md shadow-sm">
                    Employers cannot apply
                  </div>
                ) : hasApplied ? (
                  <div className="block w-full text-center md:w-auto px-8 py-3 bg-green-100 text-green-800 font-medium rounded-md shadow-sm flex justify-center items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Applied
                  </div>
                ) : user ? (
                  <ApplyModal jobId={job.id} jobTitle={job.title} submitApplication={submitApplication} />
                ) : (
                  <Link href="/login" className="block w-full text-center md:w-auto px-8 py-3 bg-action text-white font-semibold rounded-md hover:bg-action-light transition-colors shadow-sm">
                    Sign in to Apply
                  </Link>
                )
              ) : (
                 <button disabled className="block w-full text-center md:w-auto px-8 py-3 bg-slate-200 text-slate-700 font-semibold rounded-md cursor-not-allowed">
                   Closed
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto w-full px-4 py-12 flex flex-col lg:flex-row gap-12">
        
        {/* Main Body */}
        <div className="flex-1 max-w-3xl">
          <section className="mb-10 text-slate-700">
            <h2 className="text-2xl font-semibold text-primary mb-4 border-b pb-2">About this role</h2>
            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-primary mb-4 border-b pb-2">Requirements</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              {requirementsList.length > 1 ? requirementsList.map((req: string, i: number) => (
                <li key={i}>{req.replace(/^[-*]\s*/, '')}</li>
              )) : (
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              )}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4 border-b pb-2">About {company?.company_name}</h2>
            <div className="prose max-w-none text-slate-700 whitespace-pre-wrap">
              {company?.about || 'No company description provided.'}
            </div>
            {company?.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-4 text-action hover:text-primary font-semibold transition-colors">
                Visit company website
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="surface-card p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Job Summary</h3>
              
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-slate-700 mb-1">Salary Range</dt>
                  <dd className="font-medium text-slate-900 flex items-center">
                    <svg className="mr-2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.salary_range || 'Not specified'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-slate-700 mb-1">Application Deadline</dt>
                  <dd className="font-medium text-slate-900 flex items-center">
                    <svg className="mr-2 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No strict deadline'}
                  </dd>
                </div>

                <div className="pt-4 mt-2">
                  {job.status === 'active' && (
                    <>
                      {role === 'employer' || role === 'admin' ? (
                        <div className="w-full bg-slate-100 text-slate-700 py-3 rounded-md font-semibold text-center shadow-sm">
                          Employers cannot apply
                        </div>
                      ) : hasApplied ? (
                        <div className="w-full bg-green-100 text-green-800 py-3 rounded-md font-medium text-center shadow-sm flex justify-center items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          Applied
                        </div>
                      ) : user ? (
                        <ApplyModal jobId={job.id} jobTitle={job.title} submitApplication={submitApplication} />
                      ) : (
                        <Link href="/login" className="block w-full bg-action hover:bg-action-light text-white py-3 rounded-md font-semibold text-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                          Sign in to Apply
                        </Link>
                      )}
                    </>
                  )}
                  <button className="block w-full text-center px-4 py-3 bg-white border border-slate-300 text-slate-800 font-semibold rounded-md hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center">
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Save Job
                  </button>
                </div>
              </dl>
            </div>
            
            <div className="surface-card p-6">
              <h3 className="font-semibold text-slate-900 mb-4 border-b pb-2">The Employer</h3>
              <div className="flex items-center gap-3 mb-3">
                {company?.logo_url ? (
                   <img src={company.logo_url} alt="logo" className="w-12 h-12 rounded object-cover border" />
                ) : (
                   <div className="w-12 h-12 rounded bg-accent/20 text-accent-dark flex items-center justify-center font-bold">{initials}</div>
                )}
                <div>
                  <div className="font-bold text-slate-800">{company?.company_name}</div>
                  <div className="text-sm text-slate-600">{company?.industry || 'Guild Member'}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
