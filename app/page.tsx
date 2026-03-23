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

  return (
    <div className="w-full flex-col flex items-center min-h-screen">
      {/* Hero Section */}
      <section className="w-full bg-primary py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-6">
            Jobs inside the Twin Cities Catholic business community
          </h1>
          <p className="text-lg text-primary-light mb-10 max-w-2xl mx-auto text-slate-300">
            Connect with local Guild member employers and find meaningful work that aligns with your values.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-2 max-w-3xl mx-auto" action="/">
            <input 
              type="text" 
              name="q" 
              placeholder="Job title, keyword, or company" 
              defaultValue={searchParams.q}
              className="flex-1 px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-accent outline-none" 
            />
            <input 
              type="text" 
              name="location" 
              placeholder="Location (e.g., St. Paul, Remote)" 
              defaultValue={searchParams.location}
              className="flex-1 px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-accent outline-none" 
            />
            <button type="submit" className="bg-accent hover:bg-accent-dark text-white px-8 py-3 rounded-md font-medium transition-colors">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
           <form action="/" className="space-y-6 sticky top-24">
             {/* Retain search inputs if they apply filters */}
             <input type="hidden" name="q" value={searchParams.q || ''} />
             <input type="hidden" name="location" value={searchParams.location || ''} />
             
             <div>
               <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider">Category</h3>
               <select name="category" className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-accent focus:border-accent p-2 border" defaultValue={searchParams.category}>
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
               <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider">Role Type</h3>
               <select name="type" className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-accent focus:border-accent p-2 border" defaultValue={searchParams.type}>
                 <option value="">All Types</option>
                 <option value="Full-Time">Full-Time</option>
                 <option value="Part-Time">Part-Time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Freelance">Freelance</option>
               </select>
             </div>

             <div>
               <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider">Experience</h3>
               <select name="exp" className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-accent focus:border-accent p-2 border" defaultValue={searchParams.exp}>
                 <option value="">All Levels</option>
                 <option value="Entry-Level">Entry-Level</option>
                 <option value="Mid-Level">Mid-Level</option>
                 <option value="Senior">Senior</option>
                 <option value="Executive">Executive</option>
               </select>
             </div>

             <button type="submit" className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-md transition-colors text-sm font-medium">
               Apply Filters
             </button>
             {(searchParams.q || searchParams.location || searchParams.category || searchParams.type || searchParams.exp) && (
               <Link href="/" className="block text-center mt-2 text-primary hover:underline text-sm">
                 Clear all
               </Link>
             )}
           </form>
        </aside>

        {/* Job Listings Area */}
        <div className="flex-1 max-w-4xl w-full">
           <div className="mb-6 flex justify-between items-end">
             <h2 className="text-xl font-semibold text-slate-800">
               {jobs && jobs.length > 0 ? (
                 <>Found <span className="text-primary">{jobs.length}</span> active job{jobs.length !== 1 && 's'}</>
               ) : (
                 'Job Listings'
               )}
             </h2>
           </div>

           <div className="space-y-4">
             {error && (
               <div className="p-4 bg-red-50 text-red-600 rounded-md">Error loading jobs: {error.message}</div>
             )}
             
             {!error && jobs?.length === 0 && (
               <div className="text-center py-16 px-4 bg-white border border-gray-200 rounded-lg flex flex-col items-center">
                 <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                 </div>
                 <h3 className="text-lg font-medium text-slate-900 mb-2">No jobs found</h3>
                 <p className="text-slate-500 max-w-md">Try adjusting your search keywords, location, or clearing the filters to see more results.</p>
                 <Link href="/" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-light">
                    Clear all filters
                 </Link>
               </div>
             )}

             {jobs?.map((job) => (
               <JobCard key={job.id} job={job} />
             ))}
           </div>
        </div>
      </section>
    </div>
  )
}
