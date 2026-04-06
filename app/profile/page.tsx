import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { isValidResumeFile, seekerProfileSchema } from '@/utils/validation/forms'

export const dynamic = 'force-dynamic'

export default async function SeekerProfile(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('seeker_profiles')
    .select('*, users(first_name, last_name, email)')
    .eq('user_id', user.id)
    .single()

  const updateProfile = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existingProfile } = await supabase
      .from('seeker_profiles')
      .select('id, resume_url')
      .eq('user_id', user.id)
      .single()
    if (!existingProfile) {
      return redirect(`/profile?error=${encodeURIComponent('Seeker profile not found.')}`)
    }

    const { data: existingResumes } = await supabase
      .from('seeker_resumes')
      .select('id, slot, resume_path, remark')
      .eq('seeker_id', existingProfile.id)
    const resumeBySlot = new Map<number, any>((existingResumes || []).map((r: any) => [r.slot, r]))

    for (let slot = 1; slot <= 3; slot += 1) {
      const resumeFile = formData.get(`resume_${slot}`) as File
      const remarkRaw = String(formData.get(`resume_remark_${slot}`) || '').trim()
      const remark = remarkRaw ? remarkRaw.slice(0, 120) : null
      const current = resumeBySlot.get(slot)

      if (resumeFile && resumeFile.size > 0) {
        if (!isValidResumeFile(resumeFile)) {
          return redirect(`/profile?error=${encodeURIComponent(`Resume ${slot} must be PDF/DOC/DOCX and less than 5MB`)}`)
        }
        const fileExt = resumeFile.name.split('.').pop()
        const fileName = `${user.id}-saved-cv-${slot}-${Date.now()}.${fileExt}`
        const { data, error } = await supabase.storage.from('resumes').upload(fileName, resumeFile, { upsert: true })
        if (error || !data) {
          return redirect(`/profile?error=${encodeURIComponent(error?.message || `Could not upload resume ${slot}`)}`)
        }

        if (current) {
          await supabase
            .from('seeker_resumes')
            .update({ resume_path: data.path, remark })
            .eq('id', current.id)
        } else {
          await supabase
            .from('seeker_resumes')
            .insert({ seeker_id: existingProfile.id, slot, resume_path: data.path, remark })
        }
      } else if (current) {
        // Keep existing file and allow remark edits without re-uploading.
        await supabase
          .from('seeker_resumes')
          .update({ remark })
          .eq('id', current.id)
      }
    }

    const parsed = seekerProfileSchema.safeParse({
      headline: formData.get('headline'),
      location: formData.get('location'),
      phone: formData.get('phone'),
      linkedin_url: formData.get('linkedin_url'),
    })
    if (!parsed.success) {
      return redirect(`/profile?error=${encodeURIComponent(parsed.error.issues[0]?.message || 'Invalid profile data')}`)
    }

    const { headline, location, phone, linkedin_url } = parsed.data
    const { data: refreshedResumes } = await supabase
      .from('seeker_resumes')
      .select('resume_path')
      .eq('seeker_id', existingProfile.id)
      .order('slot', { ascending: true })
      .limit(1)
    const legacyResume = refreshedResumes?.[0]?.resume_path || existingProfile.resume_url || null

    await supabase
      .from('seeker_profiles')
      .update({ headline, location, phone, linkedin_url, resume_url: legacyResume })
      .eq('user_id', user.id)
    revalidatePath('/profile')
    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  const { data: savedResumes } = await supabase
    .from('seeker_resumes')
    .select('id, slot, resume_path, remark')
    .eq('seeker_id', profile?.id || '')
    .order('slot', { ascending: true })
  const resumeSlotMap = new Map<number, { id: string; slot: number; resume_path: string; remark: string | null; signedUrl: string | null }>()
  for (const resume of savedResumes || []) {
    const { data } = await supabase.storage.from('resumes').createSignedUrl(resume.resume_path, 3600)
    resumeSlotMap.set(resume.slot, { ...resume, signedUrl: data?.signedUrl || null })
  }

  const userMeta = profile?.users as any
  const fullName = `${userMeta?.first_name || ''} ${userMeta?.last_name || ''}`.trim() || 'User'
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="max-w-3xl w-full mx-auto px-4 py-10">

      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-6 group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Dashboard
      </Link>

      {/* Profile identity header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: '#520120', color: '#F2B705' }}
          >
            {initials}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">My Profile</p>
            <h1 className="text-xl font-extrabold" style={{ color: '#520120' }}>{fullName}</h1>
            {userMeta?.email && (
              <p className="text-slate-400 text-xs font-mono mt-0.5">{userMeta.email}</p>
            )}
          </div>
        </div>
        <Link
          href="/resume-builder"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-sm hover:brightness-110 transition-all shrink-0"
          style={{ background: '#102A4C' }}
        >
          Resume Builder →
        </Link>
      </div>

      {/* Error message */}
      {searchParams?.error && (
        <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {searchParams.error}
        </div>
      )}

      <form action={updateProfile} className="space-y-5">

        {/* Contact & Professional Info */}
        <div className="surface-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Professional Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Professional Headline</label>
              <input
                type="text"
                name="headline"
                defaultValue={profile?.headline || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white transition-colors"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Location</label>
              <input
                type="text"
                name="location"
                defaultValue={profile?.location || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white transition-colors"
                placeholder="Minneapolis, MN"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                defaultValue={profile?.phone || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin_url"
                defaultValue={profile?.linkedin_url || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white transition-colors"
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
          </div>
        </div>

        {/* Resume Uploads */}
        <div className="surface-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5">Saved CVs (up to 3)</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((slot) => {
              const item = resumeSlotMap.get(slot)
              return (
                <div key={slot} className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <p className="text-sm font-bold text-slate-700">CV Slot {slot}</p>
                    {item?.signedUrl ? (
                      <a
                        href={item.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ color: '#520120', background: '#fdf4f7', border: '1px solid #f3c6d0' }}
                      >
                        View saved CV
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No file saved yet</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Remark</label>
                      <input
                        type="text"
                        name={`resume_remark_${slot}`}
                        defaultValue={item?.remark || ''}
                        maxLength={120}
                        placeholder="e.g. Backend-focused CV"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Upload/Replace file</label>
                      <input
                        type="file"
                        name={`resume_${slot}`}
                        accept=".pdf,.doc,.docx"
                        className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-action file:text-white hover:file:bg-action-light"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-3">Each file: PDF/DOC/DOCX, max 5 MB. You can select these when applying to jobs.</p>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl text-white font-bold text-sm shadow-md hover:brightness-110 active:scale-[0.99] transition-all"
            style={{ backgroundColor: '#102A4C' }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
