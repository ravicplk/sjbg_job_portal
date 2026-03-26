import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import PaymentForm from '@/components/employer/PaymentForm'
import { ArrowLeft, CreditCard } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Employer profile
  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/employer/dashboard')

  // Fetch job — must belong to this employer and be a draft
  const { data: job } = await supabase
    .from('jobs')
    .select('id, title, category, role_type, location, status, employer_id')
    .eq('id', id)
    .single()

  if (!job || job.employer_id !== profile.id) notFound()

  // If already active, no need to pay again — go to dashboard
  if (job.status === 'active') redirect('/employer/dashboard')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Top bar */}
      <header
        className="w-full py-4 px-6 flex items-center gap-4 border-b border-slate-100"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)' }}
      >
        <Link
          href="/employer/dashboard"
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#520120] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <CreditCard className="w-4 h-4 text-[#520120]" />
          Secure Checkout
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Compact page title */}
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-[#520120]" />
            <h1 className="text-base font-bold text-gray-800">Complete Payment</h1>
            <span className="ml-auto text-xs text-gray-400">One-time fee · LKR 2,500</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
            <PaymentForm job={job} />
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-5 text-xs text-gray-400">
            <span>🔒 SSL Encrypted</span>
            <span>·</span>
            <span>💳 PCI DSS Compliant</span>
            <span>·</span>
            <span>🛡️ Fraud Protected</span>
          </div>
        </div>
      </main>
    </div>
  )
}
