import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatRelativeTime } from '@/components/ui/JobCard'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (userData?.role !== 'admin') {
    redirect('/')
  }

  // Fetch stats
  const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
  const { count: employersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employer')
  const { count: seekersCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'job_seeker')
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true })

  // Fetch recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .order('created_at', { ascending: false })
    .limit(8)

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

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-1">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">Platform statistics and content moderation.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatCard label="Total Users" value={usersCount || 0} />
        <StatCard label="Employers" value={employersCount || 0} />
        <StatCard label="Job Seekers" value={seekersCount || 0} />
        <StatCard label="Total Jobs Posted" value={jobsCount || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Table */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Users</h2>
          <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-500">
                  <th className="p-3 font-semibold">User</th>
                  <th className="p-3 font-semibold">Role</th>
                  <th className="p-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="align-top text-sm">
                {(recentUsers || []).map((u: any) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : 'Unknown'}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'employer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Jobs Table */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Job Moderation</h2>
          <div className="bg-white border rounded-lg overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b text-sm text-slate-500">
                  <th className="p-3 font-semibold">Job Listing</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="align-top text-sm">
                {(recentJobs || []).map((j: any) => {
                  const companyName = Array.isArray(j.employer_profiles) ? j.employer_profiles[0]?.company_name : j.employer_profiles?.company_name;
                  return (
                  <tr key={j.id} className="border-b last:border-0 hover:bg-slate-50/50">
                    <td className="p-3">
                      <Link href={`/jobs/${j.id}`} className="font-medium text-primary hover:underline">{j.title}</Link>
                      <div className="text-xs text-slate-500 mt-1">{companyName || 'Unknown Company'}</div>
                    </td>
                    <td className="p-3"><StatusBadge status={j.status} /></td>
                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                         <form action={updateJobStatus}>
                           <input type="hidden" name="jobId" value={j.id} />
                           {j.status === 'active' ? (
                             <button type="submit" name="status" value="closed" className="text-xs font-medium px-2 py-1 w-full text-center bg-yellow-50 text-yellow-700 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors">
                               Close
                             </button>
                           ) : (
                             <button type="submit" name="status" value="active" className="text-xs font-medium px-2 py-1 w-full text-center bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors">
                               Activate
                             </button>
                           )}
                         </form>
                         <form action={deleteJob}>
                           <input type="hidden" name="jobId" value={j.id} />
                           <button type="submit" className="text-xs font-medium px-2 py-1 w-full text-center bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors" onClick={(e) => { if (!confirm('Delete this job completely?')) e.preventDefault() }}>
                             Delete
                           </button>
                         </form>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
