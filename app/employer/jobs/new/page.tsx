import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { jobCreateSchema } from '@/utils/validation/forms'

export default async function NewJobPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const saveJob = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('employer_profiles').select('id').eq('user_id', user!.id).single()

    const parsed = jobCreateSchema.safeParse({
      action: formData.get('action'),
      title: formData.get('title'),
      category: formData.get('category'),
      role_type: formData.get('role_type'),
      location: formData.get('location'),
      experience_level: formData.get('experience_level'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      salary_range: formData.get('salary_range'),
      deadline: formData.get('deadline'),
    })
    if (!parsed.success) {
      const message = encodeURIComponent(parsed.error.issues[0]?.message || 'Invalid job data')
      return redirect(`/employer/jobs/new?error=${message}`)
    }

    const { action, title, category, role_type, location, experience_level, description, requirements, salary_range, deadline } = parsed.data
    const status = action === 'publish' ? 'active' : 'draft'

    const { error } = await supabase.from('jobs').insert({
      employer_id: profile!.id,
      title,
      category,
      role_type,
      location,
      experience_level,
      description,
      requirements,
      salary_range: salary_range || null,
      deadline: deadline || null,
      status
    })

    if (error) {
      console.error(error)
      redirect(`/employer/jobs/new?error=Could not save job`)
    }

    revalidatePath('/')
    revalidatePath('/employer/dashboard')
    redirect(`/employer/dashboard`)
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      <Link href="/employer/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary mb-6 inline-flex items-center transition-colors">
        <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-8">Post a New Job</h1>
      
      <div className="surface-card p-6 sm:p-8">
        {searchParams?.error && (
          <p className="mb-6 p-4 bg-red-100 text-red-700 text-sm border-l-4 border-red-500 rounded">
            {searchParams.error}
          </p>
        )}
        <form action={saveJob} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input type="text" name="title" required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none transition-colors" placeholder="e.g. Senior Marketing Manager" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select name="category" required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white transition-colors">
                 <option value="">Select Category</option>
                 <option value="Engineering">Engineering</option>
                 <option value="Marketing">Marketing</option>
                 <option value="Operations">Operations</option>
                 <option value="Sales">Sales</option>
                 <option value="Finance">Finance</option>
                 <option value="Design">Design</option>
                 <option value="Administration">Administration</option>
                 <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role Type *</label>
              <select name="role_type" required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white transition-colors">
                 <option value="">Select Type</option>
                 <option value="Full-Time">Full-Time</option>
                 <option value="Part-Time">Part-Time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level *</label>
              <select name="experience_level" required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white transition-colors">
                 <option value="">Select Level</option>
                 <option value="Entry-Level">Entry-Level</option>
                 <option value="Mid-Level">Mid-Level</option>
                 <option value="Senior">Senior</option>
                 <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input type="text" name="location" required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none transition-colors" placeholder="e.g. St. Paul, MN or Remote" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" name="salary_range" className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none transition-colors" placeholder="e.g. $80k - $100k" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="date" name="deadline" className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
              <textarea name="description" required rows={6} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y transition-colors" placeholder="Describe the responsibilities and day-to-day..."></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Requirements *</label>
              <textarea name="requirements" required rows={5} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y transition-colors" placeholder="- 3+ years experience&#10;- Catholic values alignment&#10;- Excellent communication skills"></textarea>
              <p className="text-xs text-slate-500 mt-2">Use hyphens or asterisks for bullet points. They will be formatted automatically.</p>
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-slate-100 flex-col sm:flex-row mt-4">
             <button type="submit" name="action" value="draft" className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm text-center">
               Save as Draft
             </button>
             <button
               type="submit"
               name="action"
               value="publish"
               className="flex-1 px-6 py-3 text-white font-semibold rounded-md transition-colors shadow-sm text-center hover:brightness-110"
               style={{ backgroundColor: '#520120' }}
             >
               Post Job
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
