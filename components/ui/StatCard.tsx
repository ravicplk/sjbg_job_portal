import React from 'react'

// ── Light-mode tones (used on public-site dashboards) ──────────────────────
const lightTones = {
  navy: { bar: 'bg-[#102A4C]', value: 'text-[#102A4C]', chip: 'bg-[#102A4C]/10 text-[#102A4C]' },
  maroon: { bar: 'bg-[#520120]', value: 'text-[#520120]', chip: 'bg-[#520120]/10 text-[#520120]' },
  mustard: { bar: 'bg-[#F2B705]', value: 'text-[#102A4C]', chip: 'bg-[#F2B705]/20 text-[#102A4C]' },
  green: { bar: 'bg-green-600', value: 'text-green-700', chip: 'bg-green-100 text-green-800' },
  slate: { bar: 'bg-slate-500', value: 'text-slate-900', chip: 'bg-slate-100 text-slate-800' },
} as const

// ── Dark-mode neon colours ─────────────────────────────────────────────────
const neonStyles: Record<string, {
  iconBg: string
  iconShadow: string
  iconColor: string
  numberColor: string
  glow: string
}> = {
  blue: {
    iconBg: 'rgba(0,100,180,0.20)',
    iconShadow: '0 0 22px rgba(0,180,255,0.35)',
    iconColor: '#00B4FF',
    numberColor: '#00B4FF',
    glow: '0 0 40px rgba(0,180,255,0.12)',
  },
  purple: {
    iconBg: 'rgba(90,60,200,0.20)',
    iconShadow: '0 0 22px rgba(106,90,224,0.35)',
    iconColor: '#9B8AFB',
    numberColor: '#9B8AFB',
    glow: '0 0 40px rgba(106,90,224,0.12)',
  },
  green: {
    iconBg: 'rgba(20,120,50,0.20)',
    iconShadow: '0 0 22px rgba(34,197,94,0.35)',
    iconColor: '#4ADE80',
    numberColor: '#4ADE80',
    glow: '0 0 40px rgba(34,197,94,0.12)',
  },
  pink: {
    iconBg: 'rgba(180,20,60,0.20)',
    iconShadow: '0 0 22px rgba(255,61,104,0.35)',
    iconColor: '#FF6B8A',
    numberColor: '#FF6B8A',
    glow: '0 0 40px rgba(255,61,104,0.12)',
  },
  cyan: {
    iconBg: 'rgba(0,120,140,0.20)',
    iconShadow: '0 0 22px rgba(0,201,255,0.35)',
    iconColor: '#00C9FF',
    numberColor: '#00C9FF',
    glow: '0 0 40px rgba(0,201,255,0.12)',
  },
  yellow: {
    iconBg: 'rgba(160,110,0,0.20)',
    iconShadow: '0 0 22px rgba(242,183,5,0.35)',
    iconColor: '#F2B705',
    numberColor: '#F2B705',
    glow: '0 0 40px rgba(242,183,5,0.12)',
  },
  red: {
    iconBg: 'rgba(160,20,20,0.20)',
    iconShadow: '0 0 22px rgba(239,68,68,0.35)',
    iconColor: '#F87171',
    numberColor: '#F87171',
    glow: '0 0 40px rgba(239,68,68,0.12)',
  },
}

export default function StatCard({
  label,
  value,
  tone = 'navy',
  subLabel,
  icon,
  variant = 'light',
  neonColor = 'blue',
}: {
  label: string
  value: number | string
  tone?: keyof typeof lightTones
  subLabel?: string
  icon?: React.ReactNode
  variant?: 'light' | 'dark'
  neonColor?: keyof typeof neonStyles
}) {
  // ── Dark / neon variant ─────────────────────────────────────────────────
  if (variant === 'dark') {
    const n = neonStyles[neonColor] ?? neonStyles.blue

    return (
      <div
        className="relative flex flex-col gap-3 p-5 rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `0 8px 32px rgba(0,0,0,0.45), ${n.glow}`,
        }}
      >
        {/* Icon bubble */}
        {icon && (
          <span
            className="inline-flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background: n.iconBg,
              border: `1.5px solid ${n.iconColor}30`,
              boxShadow: n.iconShadow,
              color: n.iconColor,
            }}
          >
            {icon}
          </span>
        )}

        {/* Number */}
        <div
          className="text-4xl font-black tracking-tight leading-none"
          style={{ color: n.numberColor, textShadow: `0 0 24px ${n.iconColor}80` }}
        >
          {value}
        </div>

        {/* Label */}
        <div className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {label}
        </div>

        {subLabel && (
          <span
            className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${n.iconColor}20`, color: n.iconColor }}
          >
            {subLabel}
          </span>
        )}
      </div>
    )
  }

  // ── Light variant ────────────────────────────────────────────────────────
  const t = lightTones[tone] ?? lightTones.navy

  return (
    <div className="surface-card p-5 md:p-6 transition-shadow hover:shadow-md relative overflow-hidden">
      <div className={`absolute left-0 top-0 h-full w-1.5 ${t.bar}`} />
      <div className="pl-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[11px] font-extrabold tracking-widest uppercase text-slate-600">{label}</h3>
          {subLabel && (
            <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${t.chip}`}>{subLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          {icon && (
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">{icon}</span>
          )}
          <div className={`text-3xl font-extrabold tracking-tight ${t.value}`}>{value}</div>
        </div>
      </div>
    </div>
  )
}
