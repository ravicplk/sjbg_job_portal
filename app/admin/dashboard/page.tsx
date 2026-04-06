import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { revalidatePath } from 'next/cache'
import ConfirmActionButton from '@/components/ui/ConfirmActionButton'
import AdminCharts from '@/components/admin/AdminCharts'
import { Users, Building2, Briefcase, FileText, TrendingUp, CheckCircle2, Clock, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  // ── Stats ──────────────────────────────────────────────────────────────
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: employersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employer')
  const { count: seekersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker')
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })
  const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true })

  // ── Chart data ─────────────────────────────────────────────────────────
  const { data: allUsers } = await supabase.from('users').select('role')
  const { data: allJobs } = await supabase.from('jobs').select('status, created_at')
  const { data: allApps } = await supabase.from('applications').select('status')

  const activeCount = (allJobs || []).filter((j: any) => j.status === 'active').length
  const draftCount = (allJobs || []).filter((j: any) => j.status === 'draft').length
  const closedCount = (allJobs || []).filter((j: any) => j.status === 'closed').length

  const roles = [
    { name: 'job_seeker', value: (allUsers || []).filter((u: any) => u.role === 'job_seeker').length },
    { name: 'employer', value: (allUsers || []).filter((u: any) => u.role === 'employer').length },
    { name: 'admin', value: (allUsers || []).filter((u: any) => u.role === 'admin').length },
  ].filter((x) => x.value > 0)

  const jobsByStatus = [
    { name: 'active', value: activeCount },
    { name: 'draft', value: draftCount },
    { name: 'closed', value: closedCount },
  ].filter((x) => x.value > 0)

  const applicationsByStatus = [
    { name: 'pending', value: (allApps || []).filter((a: any) => a.status === 'pending').length },
    { name: 'shortlisted', value: (allApps || []).filter((a: any) => a.status === 'shortlisted').length },
    { name: 'rejected', value: (allApps || []).filter((a: any) => a.status === 'rejected').length },
    { name: 'hired', value: (allApps || []).filter((a: any) => a.status === 'hired').length },
  ].filter((x) => x.value > 0)

  const jobsLast14Days = (() => {
    const days: { date: string; count: number }[] = []
    const now = new Date()
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      const count = (allJobs || []).filter((j: any) => {
        const c = new Date(j.created_at)
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth() && c.getDate() === d.getDate()
      }).length
      days.push({ date: key, count })
    }
    return days
  })()

  // ── Server actions ─────────────────────────────────────────────────────
  const deleteJob = async (formData: FormData) => {
    'use server'
    const jobId = formData.get('jobId') as string
    const supabase = await createClient()
    await supabase.from('jobs').delete().eq('id', jobId)
    revalidatePath('/admin/dashboard')
    revalidatePath('/')
  }

  const updateJobStatus = async (formData: FormData) => {
    'use server'
    const jobId = formData.get('jobId') as string
    const status = formData.get('status') as string
    const supabase = await createClient()
    await supabase.from('jobs').update({ status }).eq('id', jobId)
    revalidatePath('/admin/dashboard')
    revalidatePath('/')
  }

  // ── Recent data ────────────────────────────────────────────────────────
  const { data: recentUsers } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(6)
  const { data: recentJobs } = await supabase.from('jobs').select('*, employer_profiles(company_name)').order('created_at', { ascending: false }).limit(6)

  return (
    <div className="space-y-7">
      {/* Section title */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Overview</h2>
        <p className="text-white/40 text-sm mt-0.5">Platform statistics and quick moderation.</p>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={usersCount || 0} variant="dark" neonColor="blue" icon={<Users size={20} />} />
        <StatCard label="Employers" value={employersCount || 0} variant="dark" neonColor="purple" icon={<Building2 size={20} />} />
        <StatCard label="Job Seekers" value={seekersCount || 0} variant="dark" neonColor="cyan" icon={<Users size={20} />} />
        <StatCard label="Applications" value={appsCount || 0} variant="dark" neonColor="pink" icon={<FileText size={20} />} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Jobs Posted" value={jobsCount || 0} variant="dark" neonColor="yellow" icon={<Briefcase size={20} />} />
        <StatCard label="Active Jobs" value={activeCount} variant="dark" neonColor="green" icon={<CheckCircle2 size={20} />} />
        <StatCard label="Draft Jobs" value={draftCount} variant="dark" neonColor="blue" icon={<Clock size={20} />} />
        <StatCard label="Closed Jobs" value={closedCount} variant="dark" neonColor="red" icon={<XCircle size={20} />} />
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <AdminCharts
        roles={roles}
        jobsByStatus={jobsByStatus}
        applicationsByStatus={applicationsByStatus}
        jobsLast14Days={jobsLast14Days}
      />

      {/* ── Recent data tables ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-sm font-bold text-white">Recent Users</span>
            <Link href="/admin/users" className="text-xs font-semibold" style={{ color: '#00B4FF' }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>User</th>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Role</th>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(recentUsers || []).map((u: any) => (
                  <tr key={u.id} className="admin-tr-hover" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-3">
                      <div className="text-sm font-semibold text-white">
                        {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Unknown'}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>{u.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={
                          u.role === 'admin'
                            ? { background: 'rgba(155,138,251,0.15)', color: '#9B8AFB' }
                            : u.role === 'employer'
                            ? { background: 'rgba(0,180,255,0.15)', color: '#00B4FF' }
                            : { background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }
                        }>
                        {String(u.role).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.40)', whiteSpace: 'nowrap' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job moderation */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <span className="text-sm font-bold text-white">Job Moderation</span>
            <Link href="/admin/jobs" className="text-xs font-semibold" style={{ color: '#00B4FF' }}>View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Job</th>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(recentJobs || []).map((j: any) => {
                  const company = Array.isArray(j.employer_profiles)
                    ? j.employer_profiles[0]?.company_name
                    : j.employer_profiles?.company_name
                  return (
                    <tr key={j.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-5 py-3">
                        <Link href={`/jobs/${j.id}`} className="text-sm font-semibold text-white hover:text-[#00B4FF] transition-colors">{j.title}</Link>
                        <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.40)' }}>{company || '—'}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
                          style={
                            j.status === 'active'
                              ? { background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }
                              : j.status === 'draft'
                              ? { background: 'rgba(242,183,5,0.15)', color: '#F2B705' }
                              : { background: 'rgba(107,114,128,0.15)', color: '#9CA3AF' }
                          }>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
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
                              }>
                              {j.status === 'active' ? 'Close' : 'Activate'}
                            </button>
                          </form>
                          <form action={deleteJob}>
                            <input type="hidden" name="jobId" value={j.id} />
                            <ConfirmActionButton
                              action={deleteJob}
                              confirmText="Permanently delete this job?"
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
