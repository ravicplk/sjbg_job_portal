'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplyModal({ 
  jobId, 
  jobTitle, 
  submitApplication,
  autoOpen = false
}: { 
  jobId: string, 
  jobTitle: string,
  submitApplication: (jobId: string, formData: FormData) => Promise<{ error?: string }>,
  autoOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleOpen = () => setIsOpen(true)
  const handleClose = () => { setIsOpen(false); setError(null) }

  useEffect(() => {
    if (autoOpen) setIsOpen(true)
  }, [autoOpen])

  const onSubmit = async (formData: FormData) => {
    setLoading(true)
    setError(null)
    const result = await submitApplication(jobId, formData)
    setLoading(false)
    
    if (result?.error) {
      setError(result.error)
    } else {
      setIsOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      <button onClick={handleOpen} className="w-full bg-action hover:bg-action-light text-white py-3 rounded-md font-semibold text-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
        Apply Now
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Apply for {jobTitle}</h2>
                <button onClick={handleClose} className="text-slate-500 hover:text-slate-800 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            
            <form action={onSubmit} className="p-6">
              {error && <div className="p-3 bg-red-100 text-red-700 text-base font-medium rounded-md mb-4">{error}</div>}
              
              <div className="mb-4">
                <p className="text-sm text-slate-700 mb-4">Enter your qualification and upload CV. If you upload a CV here, it will also update your profile resume.</p>

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Qualification <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="qualification"
                  className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none text-slate-800 mb-4"
                  placeholder="e.g. BSc in Computer Science"
                />

                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Upload CV <span className="text-slate-500 font-normal">(PDF/DOC/DOCX, max 5MB)</span>
                </label>
                <input
                  type="file"
                  name="cv_file"
                  accept=".pdf,.doc,.docx"
                  className="w-full text-sm text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-action file:text-white hover:file:bg-action-light mb-4"
                />

                <label className="block text-sm font-semibold text-slate-800 mb-2">Cover Note <span className="text-slate-500 font-normal">(Optional)</span></label>
                <textarea 
                  name="cover_note" 
                  rows={5} 
                  className="w-full px-4 py-2 border rounded-md focus:ring-accent focus:border-accent outline-none resize-y text-slate-800" 
                  placeholder="Introduce yourself briefly..."
                ></textarea>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={handleClose} className="flex-1 px-4 py-2 border text-slate-800 font-semibold rounded-md hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-action text-white font-semibold rounded-md hover:bg-action-light transition-colors disabled:opacity-50">
                  {loading ? 'Sending...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
