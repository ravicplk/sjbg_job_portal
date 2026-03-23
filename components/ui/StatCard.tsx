export default function StatCard({ label, value }: { label: string, value: number | string }) {
  return (
    <div className="surface-card p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2 tracking-wide uppercase">{label}</h3>
      <div className="text-3xl font-bold tracking-tight text-action">{value}</div>
    </div>
  )
}
