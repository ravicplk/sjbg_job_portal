import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { jobEditSchema } from '@/utils/validation/forms'
import ConfirmSubmitButton from '@/components/ui/ConfirmSubmitButton'

export default async function EditJobPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
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

    const parsed = jobEditSchema.safeParse({
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
      return redirect(`/employer/jobs/${params.id}/edit?error=${message}`)
    }

    const { action, title, category, role_type, location, experience_level, description, requirements, salary_range, deadline } = parsed.data
    const status = action === 'publish' ? 'active' : action === 'draft' ? 'draft' : 'closed'

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
          <ConfirmSubmitButton
            label="Delete Listing"
            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            confirmMessage="Are you sure you want to delete this job listing? This action cannot be undone."
          />
        </form>
      </div>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-8">Edit Job: {job.title}</h1>
      
      <div className="surface-card p-6 sm:p-8">
        {searchParams?.error && (
          <p className="mb-6 p-4 bg-red-100 text-red-700 text-sm border-l-4 border-red-500 rounded">
            {searchParams.error}
          </p>
        )}
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
          
          <div className="pt-6 border-t border-slate-100 mt-4 space-y-3">
            <div className="flex gap-4 flex-col sm:flex-row">
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
                {job.status === 'active' ? 'Update & Keep Posted' : 'Post Job'}
              </button>
            </div>
            {job.status === 'active' && (
              <button type="submit" name="action" value="closed" className="w-full px-6 py-3 bg-red-50 text-red-700 border border-red-200 font-medium rounded-md hover:bg-red-100 transition-colors shadow-sm text-center">
                Close Job
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
