'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApplicationStatusSelect({ 
  applicationId, 
  currentStatus, 
  updateAction 
}: { 
  applicationId: string, 
  currentStatus: string, 
  updateAction: (id: string, status: string) => Promise<void> 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <select 
      defaultValue={currentStatus} 
      onChange={async (e) => {
        setLoading(true)
        await updateAction(applicationId, e.target.value)
        setLoading(false)
        router.refresh()
      }}
      disabled={loading}
      className="text-sm border-gray-300 rounded-md focus:ring-accent focus:border-accent p-2 border outline-none bg-white text-slate-800 disabled:opacity-50 shadow-sm"
    >
      <option value="pending">Pending</option>
      <option value="shortlisted">Shortlisted</option>
      <option value="rejected">Rejected</option>
      <option value="hired">Hired</option>
    </select>
  )
}
