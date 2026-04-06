import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>
}) {
  const sp = await searchParams
  const q = (sp.q || '').trim()
  const role = (sp.role || '').trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  let query = supabase.from('users').select('*').order('created_at', { ascending: false }).limit(200)
  if (role) query = query.eq('role', role as any)
  if (q) query = query.ilike('email', `%${q}%`)
  const { data: users } = await query

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
  }

  const th = 'px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-left'
  const tdStyle = { color: 'rgba(255,255,255,0.40)' }
  const borderRow = { borderBottom: '1px solid rgba(255,255,255,0.05)' }
  const borderHeader = { borderBottom: '1px solid rgba(255,255,255,0.07)' }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Users</h2>
        <p className="text-white/40 text-sm mt-0.5">Search and review all platform accounts.</p>
      </div>

      {/* Search bar */}
      <form
        className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl"
        style={cardStyle}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by email…"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 focus:outline-none focus:border-[#00B4FF]/60 focus:ring-2 focus:ring-[#00B4FF]/15"
        />
        <select
          name="role"
          defaultValue={role}
          className="px-4 py-2.5 rounded-xl text-sm text-white bg-white/5 border border-white/10 focus:outline-none focus:border-[#00B4FF]/60"
        >
          <option value="">All roles</option>
          <option value="job_seeker">Job seeker</option>
          <option value="employer">Employer</option>
          <option value="admin">Admin</option>
        </select>
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
              <th className={th} style={tdStyle}>User</th>
              <th className={th} style={tdStyle}>Role</th>
              <th className={th} style={tdStyle}>Location</th>
              <th className={th} style={tdStyle}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u: any) => (
              <tr key={u.id} style={borderRow}>
                <td className="px-5 py-3.5">
                  <div className="text-sm font-semibold text-white">
                    {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Unknown'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{u.email}</div>
                  <div className="text-[10px] mt-0.5 font-mono" style={{ color: 'rgba(255,255,255,0.20)' }}>{u.id}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={
                      u.role === 'admin'
                        ? { background: 'rgba(155,138,251,0.15)', color: '#9B8AFB' }
                        : u.role === 'employer'
                        ? { background: 'rgba(0,180,255,0.15)', color: '#00B4FF' }
                        : { background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }
                    }
                  >
                    {String(u.role).replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{u.location || '—'}</td>
                <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {!users?.length && (
              <tr>
                <td className="px-5 py-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.30)' }} colSpan={4}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Showing up to 200 results. Use role filter for faster review.
      </p>
    </div>
  )
}
