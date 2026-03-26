import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminEmployersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q || '').trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  const { data: employers } = await supabase
    .from('employer_profiles')
    .select('*, users(email)')
    .order('created_at', { ascending: false })
    .limit(200)

  const filtered = (employers || []).filter((e: any) => {
    if (!q) return true
    const company = (e.company_name || '').toLowerCase()
    const email = (Array.isArray(e.users) ? e.users[0]?.email : e.users?.email || '').toLowerCase()
    return company.includes(q.toLowerCase()) || email.includes(q.toLowerCase())
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
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Employers</h2>
        <p className="text-white/40 text-sm mt-0.5">Review and manage employer company profiles.</p>
      </div>

      {/* Search */}
      <form className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl" style={cardStyle}>
        <input
          name="q"
          defaultValue={q}
          placeholder="Search company name or email…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 focus:outline-none focus:border-[#00B4FF]/60 focus:ring-2 focus:ring-[#00B4FF]/15"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
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
              <th className={th} style={thColor}>Company</th>
              <th className={th} style={thColor}>Industry</th>
              <th className={th} style={thColor}>Website</th>
              <th className={th} style={thColor}>Phone</th>
              <th className={th} style={thColor}>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e: any) => {
              const email = Array.isArray(e.users) ? e.users[0]?.email : e.users?.email
              return (
                <tr key={e.id} style={borderRow}>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-semibold text-white">{e.company_name || '—'}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{email || '—'}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{e.industry || '—'}</td>
                  <td className="px-5 py-3.5">
                    {e.website ? (
                      <a
                        href={e.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium hover:underline"
                        style={{ color: '#00B4FF' }}
                      >
                        {e.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{e.phone || '—'}</td>
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.40)' }}>
                    {new Date(e.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr>
                <td className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }} colSpan={5}>
                  No employers found.
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
