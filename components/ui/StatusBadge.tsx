export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    shortlisted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    draft: 'bg-slate-100 text-slate-800',
  }
  const labels: Record<string, string> = {
    shortlisted: 'reviewed',
  }
  
  const selectedStyle = styles[status] || styles.draft
  return (
    <span className={`inline-flex min-w-[5rem] justify-center items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedStyle} capitalize`}>
      {labels[status] || status}
    </span>
  )
}
