import { createClient } from '@/utils/supabase/server'
import ResumeBuilder from '@/components/resume/ResumeBuilder'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ResumeBuilderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?message=Please sign in first')

  let userProfile = null;

  const { data } = await supabase
    .from('seeker_profiles')
    .select('*, users!inner(first_name, last_name, email)')
    .eq('user_id', user.id)
    .single()
  
  userProfile = data;

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Resume Builder</h1>
        </div>
        
        <ResumeBuilder userProfile={userProfile} />
      </div>
    </div>
  )
}
