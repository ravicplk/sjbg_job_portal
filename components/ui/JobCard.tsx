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
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-4 sm:items-center">
      <div className="flex-shrink-0">
        {job.employer_profiles?.logo_url ? (
          <img src={job.employer_profiles.logo_url} alt={companyName} className="w-16 h-16 rounded-md object-cover border border-gray-100" />
        ) : (
          <div className="w-16 h-16 rounded-md bg-accent/20 text-accent-dark flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{job.category || 'General'}</span>
          <span className="text-xs text-slate-400">{formatRelativeTime(job.created_at)}</span>
        </div>
        <Link href={`/jobs/${job.id}`} className="block group">
          <h3 className="text-lg font-bold text-primary group-hover:underline">{job.title}</h3>
          <p className="text-sm text-slate-600 mb-2">{companyName}</p>
        </Link>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            {job.role_type}
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            {job.location || 'Remote'}
          </div>
          {job.salary_range && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0-2.08-.402-2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {job.salary_range}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 sm:mt-0 flex-shrink-0">
        <Link href={`/jobs/${job.id}`} className="block w-full text-center sm:w-auto px-6 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-light transition-colors">
          View Job
        </Link>
      </div>
    </div>
  )
}
