'use client'

import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Camera, 
  Plus, 
  Trash2, 
  Download, 
  Save, 
  Sparkles,
  Eye,
  ChevronRight,
  X
} from 'lucide-react'

export default function ResumeBuilder({ userProfile }: { userProfile: any }) {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('personal')

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
  const [photoPreview, setPhotoPreview] = useState<string>('')

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setPhotoPreview('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file for the profile photo.')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      setError('Photo must be smaller than 3MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(String(reader.result || ''))
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const generatePDF = async (saveToProfile: boolean = false) => {
    if (!previewRef.current) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
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

  const experienceForPreview = experience.filter(
    (exp) => exp.company.trim() || exp.role.trim() || exp.description.trim()
  )
  const educationForPreview = education.filter(
    (edu) => edu.school.trim() || edu.degree.trim() || edu.year.trim()
  )
  const skillsForPreview = skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean)

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code2 },
  ]
  const brandBlue = '#102A4C'

  const inputClassName = 'w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-[#102A4C] focus:bg-white focus:ring-2 focus:ring-[#102A4C]/20 backdrop-blur-sm'
  const textareaClassName = 'w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-[#102A4C] focus:bg-white focus:ring-2 focus:ring-[#102A4C]/20 resize-y backdrop-blur-sm'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT: Builder Form */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      activeSection === section.id
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={activeSection === section.id ? { backgroundColor: brandBlue } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                )
              })}
            </div>

            {/* Personal Info Section */}
            {activeSection === 'personal' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <User className="w-5 h-5 text-[#102A4C]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                      <p className="text-sm text-gray-500 mt-0.5">Add your contact information</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Photo Upload */}
                  <div className="rounded-xl bg-gradient-to-r from-gray-50 to-white p-5 border border-gray-100">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                      <Camera className="w-4 h-4 text-[#102A4C]" />
                      Profile Photo
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="w-full sm:w-auto text-sm text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:bg-[#102A4C] hover:file:bg-[#0d223d] transition-colors cursor-pointer"
                      />
                      {photoPreview && (
                        <div className="relative">
                          <img src={photoPreview} alt="Profile preview" className="w-16 h-16 object-cover rounded-xl border-2 border-blue-200 shadow-sm" />
                          <button
                            onClick={() => setPhotoPreview('')}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP (Max 3MB)</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                      <input name="fullName" value={personal.fullName} onChange={handlePersonalChange} placeholder="John Doe" className={inputClassName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Headline</label>
                      <input name="headline" value={personal.headline} onChange={handlePersonalChange} placeholder="Senior Software Engineer" className={inputClassName} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="email" value={personal.email} onChange={handlePersonalChange} placeholder="john@example.com" className={`${inputClassName} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="phone" value={personal.phone} onChange={handlePersonalChange} placeholder="+1 234 567 8900" className={`${inputClassName} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="location" value={personal.location} onChange={handlePersonalChange} placeholder="New York, NY" className={`${inputClassName} pl-10`} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input name="linkedin" value={personal.linkedin} onChange={handlePersonalChange} placeholder="linkedin.com/in/johndoe" className={`${inputClassName} pl-10`} />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
                      <textarea name="summary" value={personal.summary} onChange={handlePersonalChange} placeholder="Write a compelling summary of your professional background..." rows={4} className={textareaClassName} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Briefcase className="w-5 h-5 text-[#102A4C]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Add your professional experience</p>
                      </div>
                    </div>
                    <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:brightness-110" style={{ backgroundColor: brandBlue }}>
                      <Plus className="w-4 h-4" />
                      Add Role
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {experience.map((exp, index) => (
                    <div key={exp.id} className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 hover:shadow-md transition-shadow">
                      {experience.length > 1 && (
                        <button onClick={() => removeExperience(exp.id)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#102A4C]">{index + 1}</span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role {index + 1}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input value={exp.company} onChange={(e) => handleExpChange(exp.id, 'company', e.target.value)} placeholder="Company Name" className={inputClassName} />
                        <input value={exp.role} onChange={(e) => handleExpChange(exp.id, 'role', e.target.value)} placeholder="Job Title" className={inputClassName} />
                        <input value={exp.startDate} onChange={(e) => handleExpChange(exp.id, 'startDate', e.target.value)} placeholder="Start Date" className={inputClassName} />
                        <input value={exp.endDate} onChange={(e) => handleExpChange(exp.id, 'endDate', e.target.value)} placeholder="End Date" className={inputClassName} />
                      </div>
                      <textarea value={exp.description} onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} className={textareaClassName} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {activeSection === 'education' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <GraduationCap className="w-5 h-5 text-[#102A4C]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Education</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Add your educational background</p>
                      </div>
                    </div>
                    <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:brightness-110" style={{ backgroundColor: brandBlue }}>
                      <Plus className="w-4 h-4" />
                      Add Education
                    </button>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {education.map((edu, index) => (
                    <div key={edu.id} className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-5 hover:shadow-md transition-shadow">
                      {education.length > 1 && (
                        <button onClick={() => removeEducation(edu.id)} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-[#102A4C]">{index + 1}</span>
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Education {index + 1}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input value={edu.school} onChange={(e) => handleEduChange(edu.id, 'school', e.target.value)} placeholder="School/University" className={inputClassName} />
                        <input value={edu.degree} onChange={(e) => handleEduChange(edu.id, 'degree', e.target.value)} placeholder="Degree" className={inputClassName} />
                        <input value={edu.year} onChange={(e) => handleEduChange(edu.id, 'year', e.target.value)} placeholder="Graduation Year" className={inputClassName} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Code2 className="w-5 h-5 text-[#102A4C]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Skills & Competencies</h2>
                      <p className="text-sm text-gray-500 mt-0.5">List your technical and soft skills</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <textarea value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js, Project Management, Team Leadership, Communication" rows={4} className={textareaClassName} />
                  <p className="text-xs text-gray-500 mt-2">Separate skills with commas for better formatting</p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Live Preview & Actions */}
          <div className="xl:col-span-5 space-y-6">
            
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex gap-3">
                <button onClick={() => generatePDF(false)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brandBlue }}>
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button onClick={() => generatePDF(true)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brandBlue }}>
                  <Save className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Save to Profile'}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Resume saved successfully! Redirecting...
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#102A4C]" />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">Your resume updates in real-time as you type</p>
              </div>
              <div className="p-4 bg-gray-100 overflow-x-auto">
                <div ref={previewRef} className="w-[210mm] min-h-[297mm] h-max shadow-2xl p-[18mm] box-border mx-auto bg-white rounded-lg" style={{ backgroundColor: '#ffffff', color: '#1e293b' }}>
                  <div className="h-1.5 w-full rounded-full mb-4" style={{ backgroundColor: '#102A4C' }} />
                  
                  <header className="border-b pb-4 mb-5" style={{ borderColor: '#cbd5e1' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h1 className="text-[27px] font-bold tracking-tight" style={{ color: '#0f172a' }}>{personal.fullName || 'Your Name'}</h1>
                        <p className="text-[13px] mt-1 font-semibold uppercase tracking-wide" style={{ color: '#102A4C' }}>{personal.headline || 'Professional Headline'}</p>
                        <div className="mt-3 text-[11px] text-gray-500 leading-relaxed">
                          {[personal.email, personal.phone, personal.location, personal.linkedin].filter(Boolean).join(' • ')}
                        </div>
                      </div>
                      {photoPreview && (
                        <img src={photoPreview} alt="Candidate" className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 shadow-sm" />
                      )}
                    </div>
                  </header>

                  {personal.summary && (
                    <section className="mb-6">
                      <h3 className="text-[12px] font-bold uppercase tracking-wider border-l-[3px] pl-2 mb-3" style={{ color: '#0f172a', borderColor: '#102A4C' }}>
                        Professional Summary
                      </h3>
                      <p className="text-[11px] leading-relaxed text-gray-600 whitespace-pre-wrap bg-slate-50 border border-slate-200 rounded-md p-2.5">{personal.summary}</p>
                    </section>
                  )}

                  <section className="mb-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider border-l-[3px] pl-2 mb-4" style={{ color: '#0f172a', borderColor: '#102A4C' }}>Work Experience</h3>
                    <div className="space-y-4">
                      {(experienceForPreview.length > 0 ? experienceForPreview : [{ id: 0, company: 'Company Name', role: 'Job Title', startDate: 'Start', endDate: 'End', description: '' }]).map((exp, i) => (
                        <div key={i} className="pb-3 border-b border-slate-100 last:border-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className="font-bold text-[12px] text-gray-900">{exp.role || 'Job Title'}</h4>
                            <span className="text-[11px] font-medium text-gray-500">{exp.startDate || 'Start'} - {exp.endDate || 'End'}</span>
                          </div>
                          <div className="text-[11px] font-semibold mb-2" style={{ color: '#102A4C' }}>{exp.company || 'Company Name'}</div>
                          {exp.description && (
                            <ul className="text-[11px] text-gray-600 leading-relaxed space-y-1">
                              {exp.description.split('\n').filter(Boolean).map((line, idx) => (
                                <li key={idx}>• {line.replace(/^[-*]\s*/, '')}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mb-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider border-l-[3px] pl-2 mb-4" style={{ color: '#0f172a', borderColor: '#102A4C' }}>Education</h3>
                    <div className="space-y-3">
                      {(educationForPreview.length > 0 ? educationForPreview : [{ id: 0, school: 'School/University', degree: 'Degree', year: 'Year' }]).map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline pb-2 border-b border-slate-100 last:border-0">
                          <div>
                            <div className="font-bold text-[12px] text-gray-900">{edu.degree || 'Degree'}</div>
                            <div className="text-[11px] text-gray-600">{edu.school || 'School/University'}</div>
                          </div>
                          <div className="text-[11px] font-medium text-gray-500">{edu.year || 'Year'}</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {(skillsForPreview.length > 0 || !personal.summary) && (
                    <section>
                      <h3 className="text-[12px] font-bold uppercase tracking-wider border-l-[3px] pl-2 mb-3" style={{ color: '#0f172a', borderColor: '#102A4C' }}>Skills</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {(skillsForPreview.length > 0 ? skillsForPreview : ['Communication', 'Team collaboration', 'Problem solving']).map((skill, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-1 rounded-full border bg-blue-50 text-slate-700 border-blue-100">{skill}</span>
                        ))}
                      </div>
                    </section>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}