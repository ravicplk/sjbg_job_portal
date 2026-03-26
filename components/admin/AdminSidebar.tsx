'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Building2, Briefcase, Megaphone } from 'lucide-react'
import Image from 'next/image'

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/employers', label: 'Employers', icon: Building2 },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

export default function AdminSidebar({ displayName }: { displayName?: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="w-64 shrink-0 flex flex-col sticky top-0 h-screen"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Brand */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg,#6A5AE0,#00B4FF)',
            boxShadow: '0 0 20px rgba(106,90,224,0.45)',
          }}
        >
          <Image src="/logo.avif" alt="Logo" width={32} height={32} className="object-contain" />
        </div>
        <div>
          <div className="text-white font-extrabold text-base leading-tight tracking-tight">SJBG</div>
          <div className="text-white/45 text-xs font-semibold tracking-widest uppercase">Console</div>
        </div>
      </div>

      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">Main Menu</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-3">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + '/')
          const Icon = l.icon
          return (
            <Link
              key={l.href}
              href={l.href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={
                active
                  ? {
                      background: 'linear-gradient(135deg, rgba(106,90,224,0.25) 0%, rgba(0,180,255,0.20) 100%)',
                      border: '1px solid rgba(106,90,224,0.45)',
                      boxShadow: '0 0 24px rgba(0,180,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
                      color: '#ffffff',
                    }
                  : {
                      border: '1px solid transparent',
                      color: 'rgba(255,255,255,0.55)',
                    }
              }
            >
              {/* Active glow dot */}
              {active && (
                <span
                  className="absolute right-3 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00B4FF', boxShadow: '0 0 8px #00B4FF' }}
                />
              )}

              {/* Icon bubble */}
              <span
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg,#6A5AE0,#00B4FF)',
                        boxShadow: '0 0 16px rgba(0,180,255,0.35)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.07)',
                      }
                }
              >
                <Icon size={15} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} />
              </span>

              {l.label}
            </Link>
          )
        })}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer */}
      <div className="px-5 pb-6">
        <div className="mx-0 h-px mb-4" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="text-[11px] text-white/25 font-medium">SJBG Job Portal</div>
        <div className="text-[10px] text-white/18">Admin Console v1.0</div>
      </div>
    </aside>
  )
}
