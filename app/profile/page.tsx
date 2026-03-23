import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

export default async function SeekerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('seeker_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const updateProfile = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Process resume upload
    const resumeFile = formData.get('resume') as File
    const { data: existingProfile } = await supabase.from('seeker_profiles').select('resume_url').eq('user_id', user.id).single()
    let resume_url = existingProfile?.resume_url

    if (resumeFile && resumeFile.size > 0 && user) {
      const fileExt = resumeFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from('resumes').upload(fileName, resumeFile, { upsert: true })
      
      if (!error && data) {
        resume_url = data.path
      }
    }

    const headline = formData.get('headline') as string
    const location = formData.get('location') as string
    const phone = formData.get('phone') as string
    const linkedin_url = formData.get('linkedin_url') as string

    await supabase.from('seeker_profiles').update({
      headline,
      location,
      phone,
      linkedin_url,
      resume_url
    }).eq('user_id', user.id)

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  // To display the current resume securely if it exists
  let downloadUrl = null;
  if (profile?.resume_url) {
     const { data } = await supabase.storage.from('resumes').createSignedUrl(profile.resume_url, 3600)
     downloadUrl = data?.signedUrl
  }

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-8">
      <Link href="/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary mb-6 inline-flex items-center transition-colors">
         <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Profile</h1>
      
      <div className="bg-white border rounded-lg p-6 sm:p-8 shadow-sm">
        <form action={updateProfile} className="space-y-6">
          
          <div className="flex items-start gap-6 mb-8 border-b pb-8">
            <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700 mb-2">Resume Document</label>
               {downloadUrl && (
                 <a href={downloadUrl} target="_blank" className="text-sm text-accent hover:text-accent-dark underline mb-4 inline-flex items-center transition-colors">
                   <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   View currently uploaded resume
                 </a>
               )}
               <input type="file" name="resume" accept=".pdf,.doc,.docx" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
               <p className="text-xs text-slate-500 mt-2">Private document. Upload a PDF or DOCX (max 5MB).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Professional Headline</label>
              <input type="text" name="headline" defaultValue={profile?.headline || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="e.g. Senior Software Engineer at XYZ" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input type="text" name="location" defaultValue={profile?.location || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="e.g. Minneapolis, MN" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input type="text" name="phone" defaultValue={profile?.phone || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="e.g. (555) 123-4567" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
              <input type="url" name="linkedin_url" defaultValue={profile?.linkedin_url || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="https://linkedin.com/in/..." />
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
             <button type="submit" className="px-8 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-light transition-colors shadow-sm">
               Save Profile
             </button>
          </div>
        </form>
      </div>
    </div>
  )
}
