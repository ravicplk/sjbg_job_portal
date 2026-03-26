import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import ConfirmActionButton from '@/components/ui/ConfirmActionButton'

export const dynamic = 'force-dynamic'

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q || '').trim()
  const status = (sp.status || '').trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  const updateJobStatus = async (formData: FormData) => {
    'use server'
    const jobId = String(formData.get('jobId') || '')
    const newStatus = String(formData.get('status') || '')
    const supabase = await createClient()
    await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId)
    revalidatePath('/admin/jobs')
    revalidatePath('/admin/dashboard')
    revalidatePath('/')
  }

  const deleteJob = async (formData: FormData) => {
    'use server'
    const jobId = String(formData.get('jobId') || '')
    const supabase = await createClient()
    await supabase.from('jobs').delete().eq('id', jobId)
    revalidatePath('/admin/jobs')
    revalidatePath('/admin/dashboard')
    revalidatePath('/')
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .order('created_at', { ascending: false })
    .limit(200)

  const filtered = (jobs || []).filter((j: any) => {
    if (status && j.status !== status) return false
    if (!q) return true
    const title = String(j.title || '').toLowerCase()
    const loc = String(j.location || '').toLowerCase()
    const cat = String(j.category || '').toLowerCase()
    const company = (Array.isArray(j.employer_profiles) ? j.employer_profiles[0]?.company_name : j.employer_profiles?.company_name || '').toLowerCase()
    const qq = q.toLowerCase()
    return title.includes(qq) || loc.includes(qq) || cat.includes(qq) || company.includes(qq)
  })

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
  }
  const th = 'px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-left'
  const thColor = { color: 'rgba(255,255,255,0.35)' }
  const borderRow = { borderBottom: '1px solid rgba(255,255,255,0.05)' }
  const borderHeader = { borderBottom: '1px solid rgba(255,255,255,0.07)' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Jobs</h2>
        <p className="text-white/40 text-sm mt-0.5">Moderate job listings — activate, close, or remove.</p>
      </div>

      {/* Search */}
      <form className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl" style={cardStyle}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, company, category…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 focus:outline-none focus:border-[#00B4FF]/60 focus:ring-2 focus:ring-[#00B4FF]/15"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-[#00B4FF]/60"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
        </select>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg,#6A5AE0,#00B4FF)', boxShadow: '0 0 20px rgba(0,180,255,0.25)' }}
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <table className="w-full text-left">
          <thead>
            <tr style={borderHeader}>
              <th className={th} style={thColor}>Job</th>
              <th className={th} style={thColor}>Status</th>
              <th className={th} style={thColor}>Location</th>
              <th className={th} style={thColor}>Created</th>
              <th className={th} style={thColor}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j: any) => {
              const companyName = Array.isArray(j.employer_profiles)
                ? j.employer_profiles[0]?.company_name
                : j.employer_profiles?.company_name
              return (
                <tr key={j.id} style={borderRow}>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/jobs/${j.id}`}
                      className="text-sm font-semibold text-white hover:text-[#00B4FF] transition-colors"
                    >
                      {j.title}
                    </Link>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{companyName || '—'}</div>
                    {j.category && (
                      <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{j.category}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                      style={
                        j.status === 'active'
                          ? { background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }
                          : j.status === 'draft'
                          ? { background: 'rgba(242,183,5,0.15)', color: '#F2B705' }
                          : { background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }
                      }
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    {j.location || '—'}
                  </td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {new Date(j.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 flex-wrap">
                      <form action={updateJobStatus}>
                        <input type="hidden" name="jobId" value={j.id} />
                        <button
                          type="submit"
                          name="status"
                          value={j.status === 'active' ? 'closed' : 'active'}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                          style={
                            j.status === 'active'
                              ? { background: 'rgba(242,183,5,0.15)', color: '#F2B705', border: '1px solid rgba(242,183,5,0.25)' }
                              : { background: 'rgba(74,222,128,0.15)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.25)' }
                          }
                        >
                          {j.status === 'active' ? 'Close' : 'Activate'}
                        </button>
                      </form>
                      <form action={deleteJob}>
                        <input type="hidden" name="jobId" value={j.id} />
                        <ConfirmActionButton
                          action={deleteJob}
                          confirmText="Permanently delete this job?"
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          style={{ background: 'rgba(255,107,138,0.15)', color: '#FF6B8A', border: '1px solid rgba(255,107,138,0.25)' }}
                        >
                          Delete
                        </ConfirmActionButton>
                      </form>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }} colSpan={5}>
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Showing up to 200 results.</p>
    </div>
  )
}
