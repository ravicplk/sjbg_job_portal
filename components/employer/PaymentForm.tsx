'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
} from 'lucide-react'

type Job = {
  id: string
  title: string
  category: string
  role_type: string
  location: string
}

type Step = 'form' | 'processing' | 'success' | 'error'

export default function PaymentForm({ job }: { job: Job }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [errorMsg, setErrorMsg] = useState('')

  const [card, setCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // ── Formatters ───────────────────────────────────────────────────────────────
  const formatNumber = (val: string) =>
    val
      .replace(/\D/g, '')
      .slice(0, 16)
      .replace(/(.{4})/g, '$1 ')
      .trim()

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
  }

  const cardType = (): 'visa' | 'mastercard' | 'amex' | 'unknown' => {
    const n = card.number.replace(/\s/g, '')
    if (/^4/.test(n)) return 'visa'
    if (/^5[1-5]/.test(n)) return 'mastercard'
    if (/^3[47]/.test(n)) return 'amex'
    return 'unknown'
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    const digits = card.number.replace(/\s/g, '')
    if (digits.length !== 16) errs.number = 'Enter a valid 16-digit card number'
    if (!card.name.trim()) errs.name = 'Cardholder name is required'
    const parts = card.expiry.split('/')
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length !== 2) {
      errs.expiry = 'Enter a valid expiry (MM/YY)'
    } else {
      const month = parseInt(parts[0])
      const year = parseInt('20' + parts[1])
      const now = new Date()
      if (month < 1 || month > 12) errs.expiry = 'Invalid month'
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
        errs.expiry = 'Card has expired'
      }
    }
    if (card.cvv.replace(/\D/g, '').length < 3) errs.cvv = 'Enter a valid CVV'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Pay handler ──────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!validate()) return

    setStep('processing')

    // Simulate network delay (dummy payment gateway)
    await new Promise((r) => setTimeout(r, 2500))

    const last4 = card.number.replace(/\s/g, '').slice(-4)

    try {
      const res = await fetch(`/api/employer/jobs/${job.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_last4: last4, cardholder_name: card.name }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Payment failed')
      }

      setStep('success')
      setTimeout(() => router.push('/employer/dashboard?published=1'), 3000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment failed. Please try again.')
      setStep('error')
    }
  }

  const inp =
    'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#102A4C] focus:ring-2 focus:ring-[#102A4C]/20 bg-white placeholder:text-gray-400'
  const lbl = 'block text-sm font-semibold text-gray-700 mb-1.5'

  // ── SUCCESS screen ───────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce"
          style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)' }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 mb-1">Your job posting is now live.</p>
        <p className="text-sm text-gray-400">Redirecting to your dashboard…</p>
        <div className="mt-8 px-6 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: '#16a34a' }}>
          ✓ LKR 2,500 Charged · Job Published
        </div>
      </div>
    )
  }

  // ── PROCESSING screen ────────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #102A4C, #1e4080)' }}
        >
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Processing Payment…</h2>
        <p className="text-gray-500 text-sm">Please wait. Do not close this page.</p>
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#102A4C] animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  // ── ERROR screen ─────────────────────────────────────────────────────────────
  if (step === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-red-100">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-500 mb-6">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('form'); setFieldErrors({}) }}
            className="px-6 py-3 rounded-xl font-semibold text-white text-sm hover:brightness-110 transition-all"
            style={{ backgroundColor: '#102A4C' }}
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/employer/dashboard')}
            className="px-6 py-3 rounded-xl font-semibold text-gray-700 text-sm border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Save as Draft
          </button>
        </div>
      </div>
    )
  }

  // ── PAYMENT FORM ─────────────────────────────────────────────────────────────
  const type = cardType()
  return (
    <div className="space-y-8">
      {/* Compact job summary row */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 font-medium mb-0.5">Publishing job</p>
          <p className="font-bold text-slate-900 text-sm truncate">{job.title}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.role_type}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-black text-[#520120]">LKR 2,500</div>
          <div className="text-[10px] text-slate-500">posting fee</div>
        </div>
      </div>

      {/* Card Form */}
      <div>
        {/* Card type indicator */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#102A4C]" />
            Card Details
          </h3>
          <div className="flex items-center gap-2">
            {/* Visa */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${type === 'visa' ? 'border-[#1a1f71] bg-[#1a1f71] text-white' : 'border-gray-200 text-gray-400'}`}>
              VISA
            </div>
            {/* Mastercard */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${type === 'mastercard' ? 'border-orange-500 bg-orange-500 text-white' : 'border-gray-200 text-gray-400'}`}>
              MC
            </div>
            {/* Amex */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${type === 'amex' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-400'}`}>
              AMEX
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Card Number */}
          <div>
            <label className={lbl}>Card Number</label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatNumber(e.target.value) })}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className={`${inp} pl-10 tracking-widest font-mono`}
                inputMode="numeric"
              />
            </div>
            {fieldErrors.number && <p className="text-red-500 text-xs mt-1">{fieldErrors.number}</p>}
          </div>

          {/* Cardholder Name */}
          <div>
            <label className={lbl}>Cardholder Name</label>
            <input
              type="text"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
              placeholder="JOHN DOE"
              className={`${inp} uppercase tracking-wider`}
              autoComplete="cc-name"
            />
            {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Expiry Date</label>
              <input
                type="text"
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                placeholder="MM/YY"
                maxLength={5}
                className={`${inp} tracking-widest font-mono`}
                inputMode="numeric"
              />
              {fieldErrors.expiry && <p className="text-red-500 text-xs mt-1">{fieldErrors.expiry}</p>}
            </div>
            <div>
              <label className={lbl}>CVV / CVC</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="•••"
                  maxLength={4}
                  className={`${inp} pl-10 tracking-widest font-mono`}
                  inputMode="numeric"
                />
              </div>
              {fieldErrors.cvv && <p className="text-red-500 text-xs mt-1">{fieldErrors.cvv}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-green-800">Secure Payment</p>
          <p className="text-xs text-green-700 mt-0.5">
            This is a demo payment portal. No real charges will be made. Your card data is not stored.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handlePay}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl text-white font-bold text-base transition-all shadow-lg hover:shadow-xl hover:brightness-110 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #102A4C, #1e4a80)' }}
        >
          <Lock className="w-5 h-5" />
          Pay LKR 2,500 &amp; Publish Job
        </button>
        <button
          onClick={() => router.push('/employer/dashboard')}
          className="sm:w-40 py-4 rounded-2xl text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-all text-center"
        >
          Save as Draft
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">
        By paying you agree to our Terms of Service. The LKR 2,500 fee is charged once per job posting.
      </p>
    </div>
  )
}
