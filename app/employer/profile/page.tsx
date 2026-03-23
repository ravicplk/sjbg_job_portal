import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const updateProfile = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Process logo upload if present
    const logoFile = formData.get('logo') as File
    let logo_url = profile?.logo_url

    if (logoFile && logoFile.size > 0 && user) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const { data, error } = await supabase.storage.from('company-logos').upload(fileName, logoFile, { upsert: true })
      
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('company-logos').getPublicUrl(fileName)
        logo_url = publicUrl
      }
    }

    const company_name = formData.get('company_name') as string
    const industry = formData.get('industry') as string
    const website = formData.get('website') as string
    const phone = formData.get('phone') as string
    const about = formData.get('about') as string

    await supabase.from('employer_profiles').update({
      company_name,
      industry,
      website,
      phone,
      about,
      logo_url
    }).eq('user_id', user!.id)

    redirect('/employer/dashboard')
  }

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-8">
      <Link href="/employer/dashboard" className="text-sm font-medium text-slate-500 hover:text-primary mb-6 inline-flex items-center transition-colors">
         <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-serif font-bold text-primary mb-8">Company Profile</h1>
      
      <div className="bg-white border rounded-lg p-6 sm:p-8 shadow-sm">
        <form action={updateProfile} className="space-y-6">
          
          <div className="flex items-center gap-6 mb-8 border-b pb-8">
            <div className="flex-shrink-0">
               {profile?.logo_url ? (
                 <img src={profile.logo_url} alt="Logo" className="w-24 h-24 object-cover rounded-md border" />
               ) : (
                 <div className="w-24 h-24 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400 text-sm text-center p-2">No Logo</div>
               )}
            </div>
            <div className="flex-1">
               <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
               <input type="file" name="logo" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
               <p className="text-xs text-slate-500 mt-2">Publicly readable. We recommend a square image min 200x200px.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name *</label>
              <input type="text" name="company_name" defaultValue={profile?.company_name || ''} required className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
              <input type="text" name="industry" defaultValue={profile?.industry || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="e.g. Technology, Retail" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input type="text" name="phone" defaultValue={profile?.phone || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="e.g. 555-010-2938" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input type="url" name="website" defaultValue={profile?.website || ''} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none" placeholder="https://..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">About the Company</label>
              <textarea name="about" defaultValue={profile?.about || ''} rows={5} className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y" placeholder="Our mission is..."></textarea>
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
