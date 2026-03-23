'use client'

import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResumeBuilder({ userProfile }: { userProfile: any }) {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [personal, setPersonal] = useState({
    fullName: userProfile?.users ? `${userProfile.users.first_name || ''} ${userProfile.users.last_name || ''}`.trim() : '',
    email: userProfile?.users?.email || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    linkedin: userProfile?.linkedin_url || '',
    headline: userProfile?.headline || '',
    summary: ''
  })

  const [experience, setExperience] = useState([
    { id: 1, company: '', role: '', startDate: '', endDate: '', description: '' }
  ])

  const [education, setEducation] = useState([
    { id: 1, school: '', degree: '', year: '' }
  ])

  const [skills, setSkills] = useState('')

  const handlePersonalChange = (e: any) => {
    setPersonal({ ...personal, [e.target.name]: e.target.value })
  }

  const handleExpChange = (id: number, field: string, value: string) => {
    setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp))
  }

  const handleEduChange = (id: number, field: string, value: string) => {
    setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu))
  }

  const addExperience = () => setExperience([...experience, { id: Date.now(), company: '', role: '', startDate: '', endDate: '', description: '' }])
  const removeExperience = (id: number) => setExperience(experience.filter(exp => exp.id !== id))

  const addEducation = () => setEducation([...education, { id: Date.now(), school: '', degree: '', year: '' }])
  const removeEducation = (id: number) => setEducation(education.filter(edu => edu.id !== id))

  const generatePDF = async (saveToProfile: boolean = false) => {
    if (!previewRef.current) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Hide UI buttons in preview during render if needed
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      
      if (saveToProfile) {
        if (!userProfile) {
          setError('You must be logged in to save to your profile.')
          setLoading(false)
          return
        }

        const pdfBlob = pdf.output('blob')
        const fileName = `${userProfile.user_id}-resume-${Date.now()}.pdf`
        const supabase = createClient()
        
        const { data: uploadData, error: uploadError } = await supabase.storage.from('resumes').upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        })

        if (uploadError) throw new Error(uploadError.message)

        const { error: updateError } = await supabase.from('seeker_profiles').update({
          resume_url: uploadData.path
        }).eq('user_id', userProfile.user_id)

        if (updateError) throw new Error(updateError.message)

        setSuccess(true)
        setTimeout(() => router.push('/profile'), 2000)
      } else {
        pdf.save(`${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error generating PDF')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* LEFT: Builder Form */}
      <div className="w-full lg:w-1/2 space-y-8 h-[calc(100vh-120px)] overflow-y-auto pr-2 pb-10">
        
        {/* Personal Info */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="fullName" value={personal.fullName} onChange={handlePersonalChange} placeholder="Full Name *" className="border p-2 rounded w-full" />
            <input name="headline" value={personal.headline} onChange={handlePersonalChange} placeholder="Professional Headline" className="border p-2 rounded w-full" />
            <input name="email" value={personal.email} onChange={handlePersonalChange} placeholder="Email *" className="border p-2 rounded w-full" />
            <input name="phone" value={personal.phone} onChange={handlePersonalChange} placeholder="Phone Number" className="border p-2 rounded w-full" />
            <input name="location" value={personal.location} onChange={handlePersonalChange} placeholder="Location (City, State)" className="border p-2 rounded w-full" />
            <input name="linkedin" value={personal.linkedin} onChange={handlePersonalChange} placeholder="LinkedIn URL" className="border p-2 rounded w-full" />
            <textarea name="summary" value={personal.summary} onChange={handlePersonalChange} placeholder="Professional Summary" rows={3} className="border p-2 rounded w-full md:col-span-2 resize-y" />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Experience</h2>
            <button onClick={addExperience} className="text-sm bg-slate-100 px-3 py-1 rounded text-primary hover:bg-slate-200">+ Add</button>
          </div>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div key={exp.id} className="relative border border-slate-100 p-4 rounded bg-slate-50">
                {experience.length > 1 && (
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 text-sm">✕</button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input value={exp.company} onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)} placeholder="Company Name" className="border p-2 rounded w-full bg-white" />
                  <input value={exp.role} onChange={(e) => handleExpChange(exp.id, 'role', e.target.value)} placeholder="Job Title" className="border p-2 rounded w-full bg-white" />
                  <input value={exp.startDate} onChange={(e) => handleExpChange(exp.id, 'startDate', e.target.value)} placeholder="Start Date (e.g. Jan 2020)" className="border p-2 rounded w-full bg-white text-sm" />
                  <input value={exp.endDate} onChange={(e) => handleExpChange(exp.id, 'endDate', e.target.value)} placeholder="End Date (e.g. Present)" className="border p-2 rounded w-full bg-white text-sm" />
                </div>
                <textarea value={exp.description} onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} className="border p-2 rounded w-full bg-white resize-y" />
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Education</h2>
            <button onClick={addEducation} className="text-sm bg-slate-100 px-3 py-1 rounded text-primary hover:bg-slate-200">+ Add</button>
          </div>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="relative grid grid-cols-1 md:grid-cols-3 gap-3">
                {education.length > 1 && (
                  <button onClick={() => removeEducation(edu.id)} className="absolute -right-2 -top-2 text-slate-400 hover:text-red-500 text-sm bg-white rounded-full w-5 h-5 flex items-center justify-center border shadow-sm z-10">✕</button>
                )}
                <input value={edu.school} onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)} placeholder="School/University" className="border p-2 rounded w-full" />
                <input value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} placeholder="Degree" className="border p-2 rounded w-full" />
                <input value={edu.year} onChange={(e) => handleEduChange(edu.id, 'year', e.target.value)} placeholder="Graduation Year" className="border p-2 rounded w-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Skills</h2>
          <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="List your key skills (e.g. React, Next.js, Project Management, SEO)" rows={2} className="border p-2 rounded w-full resize-y" />
        </div>
      </div>

      {/* RIGHT: Live Preview & Actions */}
      <div className="w-full lg:w-1/2 flex flex-col h-[calc(100vh-120px)]">
        
        <div className="flex gap-4 mb-4 shrink-0">
          <button onClick={() => generatePDF(false)} disabled={loading} className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50">
            Download PDF
          </button>
          <button onClick={() => generatePDF(true)} disabled={loading} className="flex-1 bg-action text-white py-3 rounded-md font-semibold hover:bg-action-light transition-colors shadow-sm disabled:opacity-50">
            {loading ? 'Processing...' : 'Save to Profile'}
          </button>
        </div>
        
        {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded mb-4">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-800 text-sm rounded mb-4">Resume saved successfully! Redirecting...</div>}

        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 border rounded-lg shadow-inner flex justify-center">
          
          {/* A4 Document Preview - Inline colors bypass html2canvas Tailwind v4 oklch()/lab() bug */}
          <div ref={previewRef} className="w-[210mm] min-h-[297mm] h-max shadow-md p-[20mm] box-border" style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
            
            <header className="border-b-2 pb-4 mb-6" style={{ borderColor: '#1e293b' }}>
              <h1 className="text-3xl font-serif font-bold uppercase tracking-wider" style={{ color: '#0f172a' }}>{personal.fullName || 'Your Name'}</h1>
              <p className="text-lg mt-1" style={{ color: '#475569' }}>{personal.headline || 'Professional Headline'}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs font-medium" style={{ color: '#64748b' }}>
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <span>• {personal.phone}</span>}
                {personal.location && <span>• {personal.location}</span>}
                {personal.linkedin && <span>• {personal.linkedin}</span>}
              </div>
            </header>

            {personal.summary && (
              <section className="mb-6">
                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{personal.summary}</p>
              </section>
            )}

            <section className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-4" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Experience</h3>
              <div className="space-y-4">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold" style={{ color: '#1e293b' }}>{exp.role || 'Job Title'}</h4>
                      <span className="text-xs font-medium" style={{ color: '#64748b' }}>{exp.startDate || 'Start'} — {exp.endDate || 'End'}</span>
                    </div>
                    <div className="text-sm font-medium mb-2" style={{ color: '#475569' }}>{exp.company || 'Company Name'}</div>
                    {exp.description && (
                      <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: '#334155' }}>{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-6">
               <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-4" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Education</h3>
               <div className="space-y-3">
                 {education.map((edu, i) => (
                   <div key={i} className="flex justify-between items-baseline">
                     <div>
                       <div className="font-bold text-sm" style={{ color: '#1e293b' }}>{edu.degree || 'Degree'}</div>
                       <div className="text-xs" style={{ color: '#475569' }}>{edu.school || 'School/University'}</div>
                     </div>
                     <div className="text-xs font-medium" style={{ color: '#64748b' }}>{edu.year || 'Year'}</div>
                   </div>
                 ))}
               </div>
            </section>

            {skills && (
              <section>
                 <h3 className="text-sm font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: '#1e293b', borderColor: '#e2e8f0' }}>Skills</h3>
                 <p className="text-xs leading-relaxed" style={{ color: '#334155' }}>{skills}</p>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
