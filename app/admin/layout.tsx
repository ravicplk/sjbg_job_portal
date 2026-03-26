import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase.from('users').select('role, first_name, email').eq('id', user.id).single()
  if (userData?.role !== 'admin') redirect('/')

  const displayName = userData?.first_name || userData?.email?.split('@')[0] || 'Admin'

  return (
    <div
      className="flex min-h-screen w-full"
      style={{ background: 'linear-gradient(135deg, #0d0d0f 0%, #121218 60%, #0f111a 100%)' }}
    >
      {/* Sidebar */}
      <AdminSidebar displayName={displayName} />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Administration</h1>
            <p className="text-xs text-white/45 mt-0.5">Console for moderation and platform operations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-white/80"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: 'linear-gradient(to right,#6A5AE0,#00B4FF)', boxShadow: '0 0 8px rgba(0,180,255,0.6)' }}
              />
              {displayName}
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
