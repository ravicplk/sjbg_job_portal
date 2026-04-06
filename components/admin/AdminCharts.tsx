'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

// ── Custom SVG Donut chart (supports gradient arcs) ─────────────────────────
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number, stroke: number) {
  const inner = r - stroke / 2
  const outer = r + stroke / 2
  const s1 = polarToXY(cx, cy, outer, startDeg)
  const e1 = polarToXY(cx, cy, outer, endDeg)
  const s2 = polarToXY(cx, cy, inner, endDeg)
  const e2 = polarToXY(cx, cy, inner, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${outer} ${outer} 0 ${large} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${inner} ${inner} 0 ${large} 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ')
}

type DonutSegment = { name: string; value: number; color: string; gradientId?: string }

function DonutChart({
  segments,
  title,
  size = 160,
}: {
  segments: DonutSegment[]
  title: string
  size?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.34
  const stroke = size * 0.14
  const total = segments.reduce((s, d) => s + d.value, 0)

  let cursor = -90 // start top
  const arcs = segments.map((seg) => {
    const deg = total > 0 ? (seg.value / total) * 358 : 0 // 358 to leave a tiny gap
    const start = cursor
    const end = cursor + deg
    cursor = end + 2 // 2° gap between arcs
    return { ...seg, start, end }
  })

  return (
    <div
      className="flex flex-col rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      <div className="text-[11px] font-bold tracking-widest uppercase text-white/40 mb-4">{title}</div>
      <div className="flex items-center gap-6">
        {/* SVG donut */}
        <div className="shrink-0">
          <svg width={size} height={size}>
            <defs>
              <linearGradient id="purpleCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6A5AE0" />
                <stop offset="100%" stopColor="#00B4FF" />
              </linearGradient>
              <linearGradient id="cyanMint" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00C9FF" />
                <stop offset="100%" stopColor="#92FE9D" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track ring */}
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={stroke}
            />

            {arcs.map((arc, i) => (
              <path
                key={i}
                d={arcPath(cx, cy, r, arc.start, arc.end, stroke)}
                fill={arc.gradientId ? `url(#${arc.gradientId})` : arc.color}
                filter="url(#glow)"
              />
            ))}

            {/* Center text */}
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={22}
              fontWeight={800}
              fill="#ffffff"
            >
              {total}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={600}
              fill="rgba(255,255,255,0.40)"
            >
              total
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 min-w-0">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{
                  background: seg.gradientId
                    ? seg.gradientId === 'purpleCyan'
                      ? 'linear-gradient(135deg,#6A5AE0,#00B4FF)'
                      : 'linear-gradient(135deg,#00C9FF,#92FE9D)'
                    : seg.color,
                  boxShadow: `0 0 8px ${seg.color}90`,
                }}
              />
              <span className="text-xs text-white/55 capitalize truncate">{seg.name}</span>
              <span className="ml-auto text-xs font-bold text-white/80 shrink-0">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Dark tooltip ────────────────────────────────────────────────────────────
function DarkTooltip() {
  return (
    <Tooltip
      contentStyle={{
        background: 'rgba(18,18,24,0.96)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 12,
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.70)',
        fontSize: 12,
      }}
      itemStyle={{ color: '#fff' }}
      labelStyle={{ color: 'rgba(255,255,255,0.60)', marginBottom: 4 }}
      cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
    />
  )
}

// ── Area Chart Card ─────────────────────────────────────────────────────────
function AreaCard({
  title,
  data,
}: {
  title: string
  data: { date: string; count: number }[]
}) {
  return (
    <div
      className="flex flex-col rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
      }}
    >
      <div className="text-[11px] font-bold tracking-widest uppercase text-white/40 mb-4">{title}</div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B4FF" stopOpacity={0.35} />
                <stop offset="70%" stopColor="#6A5AE0" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#6A5AE0" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={false}
              tickLine={false}
            />
            <DarkTooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00B4FF"
              strokeWidth={2.5}
              fill="url(#areaGrad)"
              dot={false}
              activeDot={{ r: 5, fill: '#00B4FF', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ── Main export ─────────────────────────────────────────────────────────────
export default function AdminCharts({
  roles,
  jobsByStatus,
  applicationsByStatus,
  jobsLast14Days,
}: {
  roles: { name: string; value: number }[]
  jobsByStatus: { name: string; value: number }[]
  applicationsByStatus: { name: string; value: number }[]
  jobsLast14Days: { date: string; count: number }[]
}) {
  const userSegments: DonutSegment[] = roles.map((r, i) => ({
    name: r.name.replace('_', ' '),
    value: r.value,
    color: ['#6A5AE0', '#00B4FF', '#00C9FF', '#9B8AFB'][i % 4],
    gradientId: i === 0 ? 'purpleCyan' : undefined,
  }))

  const jobSegments: DonutSegment[] = jobsByStatus.map((j) => ({
    name: j.name,
    value: j.value,
    color:
      j.name === 'active'
        ? '#4ADE80'
        : j.name === 'closed'
        ? '#6B7280'
        : '#F2B705',
  }))

  const appSegments: DonutSegment[] = applicationsByStatus.map((a) => ({
    name: a.name,
    value: a.value,
    color:
      a.name === 'pending'
        ? '#00C9FF'
        : a.name === 'rejected'
        ? '#FF6B8A'
        : a.name === 'hired'
        ? '#9B8AFB'
        : '#4ADE80',
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <DonutChart segments={userSegments} title="Users by role" />
      <DonutChart segments={jobSegments} title="Jobs by status" />
      <DonutChart segments={appSegments} title="Applications" />
      <AreaCard title="Jobs posted — 14 days" data={jobsLast14Days} />
    </div>
  )
}
