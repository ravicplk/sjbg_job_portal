import { createClient } from '@/utils/supabase/server'
import JobCard from '@/components/ui/JobCard'
import Link from 'next/link'

export default async function Home(props: {
  searchParams: Promise<{ q?: string; location?: string; category?: string; type?: string; exp?: string }>
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(`
      *,
      employer_profiles (
        company_name,
        logo_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.type) {
    query = query.eq('role_type', searchParams.type)
  }
  if (searchParams.exp) {
    query = query.eq('experience_level', searchParams.exp)
  }

  const { data: jobs, error } = await query
  const hasActiveFilters = !!(
    searchParams.q ||
    searchParams.location ||
    searchParams.category ||
    searchParams.type ||
    searchParams.exp
  )

  return (
    <div className="w-full flex-col flex items-center min-h-screen">
      {/* Hero Section */}
      <section
        className="w-full py-14 sm:py-16 px-4 bg-primary relative overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1800&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Jobs inside the Twin Cities Catholic business community
          </h1>
          <p className="text-lg text-white/95 mb-12 max-w-3xl mx-auto">
            Connect with <span className="text-accent font-semibold">Guild member employers</span> and find
            <span className="text-accent font-semibold"> meaningful work</span> that aligns with your values.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto" action="/">
            <input 
              type="text" 
              name="q" 
              placeholder="Job title, keyword, or company" 
              defaultValue={searchParams.q}
              className="flex-1 px-4 py-3 bg-white/95 text-[#333333] rounded-lg border-0 focus:ring-2 focus:ring-accent outline-none shadow-sm" 
            />
            <input 
              type="text" 
              name="location" 
              placeholder="Location (e.g., St. Paul, Remote)" 
              defaultValue={searchParams.location}
              className="flex-1 px-4 py-3 bg-white/95 text-[#333333] rounded-lg border-0 focus:ring-2 focus:ring-accent outline-none shadow-sm" 
            />
            <button
              type="submit"
              className="bg-action hover:bg-action-light text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
              style={{ backgroundColor: '#102A4C' }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Horizontal Filters */}
      <section className="w-full max-w-6xl mx-auto px-4 mt-6 relative z-20">
        <form action="/" className="surface-card p-4 sm:p-5">
          <input type="hidden" name="q" value={searchParams.q || ''} />
          <input type="hidden" name="location" value={searchParams.location || ''} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Category</label>
              <select id="category" name="category" defaultValue={searchParams.category} className="w-full border-slate-300 rounded-lg p-2.5 bg-white text-[#333333]">
                <option value="">All Categories</option>
                <option value="Engineering">Engineering</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Design">Design</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Role Type</label>
              <select id="type" name="type" defaultValue={searchParams.type} className="w-full border-slate-300 rounded-lg p-2.5 bg-white text-[#333333]">
                <option value="">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label htmlFor="exp" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1">Experience</label>
              <select id="exp" name="exp" defaultValue={searchParams.exp} className="w-full border-slate-300 rounded-lg p-2.5 bg-white text-[#333333]">
                <option value="">All Levels</option>
                <option value="Entry-Level">Entry-Level</option>
                <option value="Mid-Level">Mid-Level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-action text-white hover:bg-action-light px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Filter
              </button>
              {hasActiveFilters && (
                <Link href="/" className="flex-1 text-center border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Clear
                </Link>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* Job Listings */}
      <section className="w-full max-w-6xl mx-auto px-4 py-10">
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-md">Error loading jobs: {error.message}</div>
          )}
          
          {!error && jobs?.length === 0 && (
            <div className="text-center py-16 px-4 bg-white border border-gray-200 rounded-lg flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
              <p className="text-slate-700 max-w-md">Try adjusting your search keywords, location, or clearing the filters to see more results.</p>
              <Link href="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-action hover:bg-action-light">
                Clear all filters
              </Link>
            </div>
          )}

          {jobs?.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  )
}
