export default function StatCard({ label, value }: { label: string, value: number | string }) {
  return (
    <div className="bg-white border rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-medium text-slate-500 mb-2">{label}</h3>
      <div className="text-3xl font-bold tracking-tight text-primary">{value}</div>
    </div>
  )
}
