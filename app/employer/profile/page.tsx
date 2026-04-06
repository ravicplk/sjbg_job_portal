import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { employerProfileSchema, isValidLogoFile } from '@/utils/validation/forms'
import {
  Building2,
  Globe,
  Phone,
  FileText,
  Tag,
  CheckCircle,
  ArrowLeft,
  Camera,
  MapPin,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmployerProfile(props: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const updateProfile = async (formData: FormData) => {
    'use server'
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return redirect('/login')

    // ── Logo upload ────────────────────────────────────────────────────────────
    const logoFile = formData.get('logo') as File
    let logo_url = profile?.logo_url ?? null

    if (logoFile && logoFile.size > 0) {
      if (!isValidLogoFile(logoFile)) {
        const m = encodeURIComponent('Logo must be an image smaller than 5MB')
        return redirect(`/employer/profile?error=${m}`)
      }
      const ext = logoFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${ext}`
      const { data, error: uploadErr } = await supabase.storage
        .from('company-logos')
        .upload(fileName, logoFile, { upsert: true })

      if (uploadErr) {
        const m = encodeURIComponent(uploadErr.message || 'Could not upload logo')
        return redirect(`/employer/profile?error=${m}`)
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from('company-logos').getPublicUrl(data.path)
      logo_url = publicUrl
    }

    // ── Validate fields ────────────────────────────────────────────────────────
    const parsed = employerProfileSchema.safeParse({
      company_name: formData.get('company_name'),
      industry: formData.get('industry'),
      website: formData.get('website'),
      phone: formData.get('phone'),
      about: formData.get('about'),
    })
    if (!parsed.success) {
      const m = encodeURIComponent(
        parsed.error.issues[0]?.message || 'Invalid company profile data'
      )
      return redirect(`/employer/profile?error=${m}`)
    }

    const { company_name, industry, website, phone, about } = parsed.data

    await supabase
      .from('employer_profiles')
      .update({ company_name, industry, website, phone, about, logo_url })
      .eq('user_id', user.id)

    revalidatePath('/employer/profile')
    revalidatePath('/employer/dashboard')
    revalidatePath('/')
    redirect('/employer/profile?saved=1')
  }

  const inp =
    'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none transition-all focus:border-[#102A4C] focus:ring-2 focus:ring-[#102A4C]/20 bg-white placeholder:text-gray-400'
  const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5'

  const initials = profile?.company_name
    ? profile.company_name.substring(0, 2).toUpperCase()
    : '??'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ── Compact top bar ── */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/employer/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#520120] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#520120]" />
            <h1 className="text-base font-bold text-gray-800">Company Profile</h1>
          </div>
        </div>

        {/* ── Status messages ── */}
        {searchParams?.saved === '1' && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Company profile saved!</p>
              <p className="text-xs text-green-700 mt-0.5">
                Your company name and logo will now appear on your job listings.
              </p>
            </div>
          </div>
        )}
        {searchParams?.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl border-l-4 border-l-red-500">
            {searchParams.error}
          </div>
        )}

        <form action={updateProfile} className="space-y-6">

          {/* ── Logo section ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Camera className="w-4 h-4 text-[#102A4C]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Company Logo</h2>
                <p className="text-xs text-gray-500">Shown on job listings and your company profile</p>
              </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
              {/* Current logo preview */}
              <div className="shrink-0">
                {profile?.logo_url ? (
                  <img
                    src={profile.logo_url}
                    alt="Current logo"
                    className="w-24 h-24 object-cover rounded-2xl border-2 border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400">
                    <Building2 className="w-8 h-8" />
                    <span className="text-xs font-medium">No logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  name="logo"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:text-white file:bg-[#102A4C] hover:file:bg-[#0d223d] file:transition-colors cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">
                  JPG, PNG or WebP · Square image recommended · Max 5 MB
                </p>
                {profile?.logo_url && (
                  <p className="text-xs text-green-700 mt-1 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Logo is set. Upload a new file to replace it.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Company details ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Building2 className="w-4 h-4 text-[#102A4C]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Company Information</h2>
                <p className="text-xs text-gray-500">This information appears on all your job listings</p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={lbl}>
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="company_name"
                    defaultValue={profile?.company_name || ''}
                    required
                    placeholder="e.g. Acme Corporation"
                    className={`${inp} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className={lbl}>Industry</label>
                <div className="relative">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="industry"
                    defaultValue={profile?.industry || ''}
                    placeholder="e.g. Technology, Retail"
                    className={`${inp} pl-10`}
                  />
                </div>
              </div>

              <div>
                <label className={lbl}>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    defaultValue={profile?.phone || ''}
                    placeholder="e.g. +94 77 123 4567"
                    className={`${inp} pl-10`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>Website</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="website"
                    defaultValue={profile?.website || ''}
                    placeholder="https://yourcompany.com"
                    className={`${inp} pl-10`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={lbl}>About the Company</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <textarea
                    name="about"
                    defaultValue={profile?.about || ''}
                    rows={5}
                    placeholder="Describe your company, mission, values, and what makes you a great employer…"
                    className={`${inp} pl-10 resize-y`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── How it appears preview ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-xl">
                <MapPin className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">How your company appears on job listings</h2>
                <p className="text-xs text-gray-500">Preview of your company badge on job cards</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50">
                {profile?.logo_url ? (
                  <img src={profile.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-[#520120]/10 text-[#520120] flex items-center justify-center font-bold text-lg">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="font-bold text-gray-900">{profile?.company_name || 'Your Company Name'}</div>
                  <div className="flex items-center gap-1 text-sm text-emerald-700 font-medium">
                    {profile?.industry || 'Industry'}
                    <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
              {!profile?.company_name && (
                <p className="text-xs text-amber-700 mt-3 font-medium flex items-center gap-1.5">
                  ⚠️ Fill in your company name above and save to show your company on job listings.
                </p>
              )}
            </div>
          </div>

          {/* ── Save button ── */}
          <div className="flex flex-col sm:flex-row gap-3 pb-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #520120, #7a0230)' }}
            >
              <CheckCircle className="w-5 h-5" />
              Save Company Profile
            </button>
            <Link
              href="/employer/dashboard"
              className="sm:w-44 py-4 rounded-2xl text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-all text-center flex items-center justify-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
