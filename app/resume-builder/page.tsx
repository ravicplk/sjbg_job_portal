import { createClient } from '@/utils/supabase/server'
import ResumeBuilder from '@/components/resume/ResumeBuilder'

export const dynamic = 'force-dynamic'

export default async function ResumeBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userProfile = null;

  if (user) {
    const { data } = await supabase
      .from('seeker_profiles')
      .select('*, users!inner(first_name, last_name, email)')
      .eq('user_id', user.id)
      .single()
    
    userProfile = data;
  }

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">Resume Builder</h1>
          <p className="text-slate-600">Create a professional resume instantly. Fill in your details and download as PDF, or save directly to your profile to start applying to jobs.</p>
        </div>
        
        <ResumeBuilder userProfile={userProfile} />
      </div>
    </div>
  )
}
