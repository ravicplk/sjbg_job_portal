'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  role: string | null
  hasUser: boolean
}

export default function NavLinks({ role, hasUser }: Props) {
  const pathname = usePathname()

  const linkCls = (href: string) => {
    const exact = href === '/'
    const isActive = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/')
    return [
      'text-[15px] font-semibold transition-colors duration-150 cursor-pointer',
      isActive ? 'text-[#F2B705]' : 'text-white/90 hover:text-[#F2B705]',
    ].join(' ')
  }

  return (
    <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-10">
      <Link href="/" className={linkCls('/')}>Home</Link>

      {role === 'employer' && (
        <>
          <Link href="/employer/dashboard" className={linkCls('/employer/dashboard')}>Dashboard</Link>
          <Link href="/employer/profile"   className={linkCls('/employer/profile')}>Profile</Link>
        </>
      )}

      {role === 'job_seeker' && (
        <>
          <Link href="/dashboard"      className={linkCls('/dashboard')}>Dashboard</Link>
          <Link href="/profile"        className={linkCls('/profile')}>Profile</Link>
          <Link href="/resume-builder" className={linkCls('/resume-builder')}>Resume Builder</Link>
        </>
      )}

      {role === 'admin' && (
        <Link href="/admin/dashboard" className={linkCls('/admin')}>Admin Panel</Link>
      )}
    </div>
  )
}
