import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  
  const { data: job, error: fetchErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchErr || !job) {
    notFound()
  }

  const updateJob = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()

    const action = formData.get('action') as string // 'draft' | 'publish' | 'closed'
    const status = action === 'publish' ? 'active' : action === 'draft' ? 'draft' : 'closed'

    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const role_type = formData.get('role_type') as string
    const location = formData.get('location') as string
    const experience_level = formData.get('experience_level') as string
    const description = formData.get('description') as string
    const requirements = formData.get('requirements') as string
    const salary_range = formData.get('salary_range') as string
    const deadline = formData.get('deadline') as string

    const { error } = await supabase.from('jobs').update({
      title,
      category,
      role_type,
      location,
      experience_level,
      description,
      requirements,
      salary_range: salary_range || null,
      deadline: deadline ? deadline : null,
      status
    }).eq('id', params.id)

    if (error) {
      console.error(error)
      redirect(`/employer/jobs/${params.id}/edit?error=Could not update job`)
    }

    revalidatePath('/')
    revalidatePath('/employer/dashboard')
    revalidatePath(`/jobs/${params.id}`)
    redirect(`/employer/dashboard`)
  }

  const deleteJob = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.from('jobs').delete().eq('id', params.id)
    
    revalidatePath('/')
    revalidatePath('/employer/dashboard')
    redirect(`/employer/dashboard`)
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/employer/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary inline-flex items-center transition-colors">
          <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Dashboard
        </Link>
        <form action={deleteJob}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors" onClick={(e) => { if (!confirm('Are you sure you want to delete this job listing? This action cannot be undone.')) e.preventDefault() }}>
            Delete Listing
          </button>
        </form>
      </div>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-8">Edit Job: {job.title}</h1>
      
      <div className="bg-white border rounded-lg p-6 sm:p-8 shadow-sm">
        <form action={updateJob} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input type="text" name="title" defaultValue={job.title} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select name="category" defaultValue={job.category} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white">
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
              <select name="role_type" defaultValue={job.role_type} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white">
                 <option value="Full-Time">Full-Time</option>
                 <option value="Part-Time">Part-Time</option>
                 <option value="Contract">Contract</option>
                 <option value="Internship">Internship</option>
                 <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level *</label>
              <select name="experience_level" defaultValue={job.experience_level} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none bg-white">
                 <option value="Entry-Level">Entry-Level</option>
                 <option value="Mid-Level">Mid-Level</option>
                 <option value="Senior">Senior</option>
                 <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input type="text" name="location" defaultValue={job.location} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Salary Range <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" name="salary_range" defaultValue={job.salary_range || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="date" name="deadline" defaultValue={job.deadline || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
              <textarea name="description" defaultValue={job.description} required rows={6} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y"></textarea>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Requirements *</label>
              <textarea name="requirements" defaultValue={job.requirements} required rows={5} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y"></textarea>
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-slate-100 flex-col sm:flex-row mt-4">
             {job.status === 'active' ? (
               <button type="submit" name="action" value="closed" className="flex-1 px-6 py-3 bg-red-50 text-red-700 border border-red-200 font-medium rounded-md hover:bg-red-100 transition-colors shadow-sm text-center">
                 Close Job
               </button>
             ) : (
               <button type="submit" name="action" value="draft" className="flex-1 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm text-center">
                 Save as Draft
               </button>
             )}
             <button type="submit" name="action" value="publish" className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors shadow-sm text-center">
               {job.status === 'active' ? 'Update Job Details' : 'Publish Job'}
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
