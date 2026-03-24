import Link from 'next/link'

export function formatRelativeTime(dateString: string) {
  const date = new Date(dateString)
  const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 3600 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days/30)}mo ago`
}

export default function JobCard({ job }: { job: any }) {
  const companyName = job.employer_profiles?.company_name || 'Unknown Company'
  const initials = companyName.substring(0, 2).toUpperCase()
  const categoryPath = `${job.category || 'General'} > ${job.role_type || 'Role'}${job.experience_level ? ` - ${job.experience_level}` : ''}`
  
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row gap-5 md:items-start md:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {job.employer_profiles?.logo_url ? (
              <img src={job.employer_profiles.logo_url} alt={companyName} className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                {initials}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 border border-amber-200 text-[#D49A00]">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.3 3.5a1 1 0 00-.6 0l-8 3a1 1 0 000 1.9l2.7 1 1.3 6.1a1 1 0 001 .8h6.6a1 1 0 001-.8l1.3-6.1 2.7-1a1 1 0 000-1.9l-8-3zM8.1 10.3l3.9 1.5 3.9-1.5-.9 4.2H9l-.9-4.2z" />
                </svg>
              </span>
              <Link href={`/jobs/${job.id}`} className="block group">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-action transition-colors">
                  {job.title || 'Technical Support Specialist'}
                </h3>
              </Link>
            </div>

            <div className="flex items-center gap-1.5 text-sm mb-2">
              <span className="font-semibold text-emerald-700">{companyName || 'Nextjob'}</span>
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <p className="text-xs text-slate-500 mb-3">{categoryPath}</p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {job.role_type || 'Full-Time'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {job.location || 'Colombo, Sri Lanka'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between items-start md:items-end md:min-w-[170px] gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/jobs/${job.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-action transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h8m-4-4l4 4-4 4M4 6h8M4 18h8" />
            </svg>
            Share
          </Link>
          <Link href={`/jobs/${job.id}#apply-section`} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary-light transition-colors">
            Apply
            <span className="ml-1">→</span>
          </Link>
        </div>
        <p className="text-xs text-slate-400">Posted on {formatRelativeTime(job.created_at)}</p>
      </div>
    </div>
  )
}
