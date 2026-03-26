import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { Megaphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>
}) {
  const sp = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  // Fetch current text
  const { data: cfg } = await supabase
    .from('site_config')
    .select('value')
    .eq('key', 'announcement_text')
    .maybeSingle()

  const currentText = cfg?.value ?? 'Now accepting early employer listings for upcoming launch.'

  // ── Server action ──────────────────────────────────────────────────────────
  const updateAnnouncement = async (formData: FormData) => {
    'use server'
    const text = String(formData.get('announcement_text') || '').trim()
    const supabase = await createClient()
    await supabase
      .from('site_config')
      .upsert({ key: 'announcement_text', value: text }, { onConflict: 'key' })
    revalidatePath('/')
    redirect('/admin/announcements?saved=1')
  }

  return (
    <div className="w-full max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'rgba(242,183,5,0.12)',
            border: '1.5px solid rgba(242,183,5,0.30)',
            boxShadow: '0 0 20px rgba(242,183,5,0.18)',
          }}
        >
          <Megaphone size={18} color="#F2B705" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-white">Announcement Bar</h2>
          <p className="text-sm text-white/55">Edit the banner shown at the top of the homepage.</p>
        </div>
      </div>

      {/* Success banner */}
      {sp.saved === '1' && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
          style={{
            background: 'rgba(74,222,128,0.10)',
            border: '1px solid rgba(74,222,128,0.25)',
            color: '#4ADE80',
          }}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Announcement updated successfully.
        </div>
      )}

      {/* Edit form */}
      <div className="surface-card p-6">
        <form action={updateAnnouncement} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white/70 mb-2">
              Announcement Text
            </label>
            <textarea
              name="announcement_text"
              defaultValue={currentText}
              rows={3}
              maxLength={300}
              className="w-full rounded-xl p-3 text-sm resize-none"
              placeholder="Enter announcement text…"
              required
            />
            <p className="text-xs text-white/35 mt-1">
              Max 300 characters. This text appears in the mustard-yellow bar at the top of the homepage.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6A5AE0, #00B4FF)',
              boxShadow: '0 4px 18px rgba(0,180,255,0.22)',
            }}
          >
            <Megaphone size={15} />
            Save Announcement
          </button>
        </form>
      </div>

      {/* Live preview */}
      <div className="mt-6 surface-card p-5">
        <div className="text-[10px] font-bold tracking-widest uppercase text-white/35 mb-3">
          Homepage Preview
        </div>
        <div
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-center flex items-center justify-center gap-2"
          style={{ backgroundColor: '#F2B705', color: '#333333' }}
        >
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
          </svg>
          {currentText}
        </div>
        <p className="text-xs text-white/30 mt-3">
          The preview above shows how the announcement looks on the homepage before saving.
        </p>
      </div>
    </div>
  )
}
