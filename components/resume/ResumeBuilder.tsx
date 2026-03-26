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
  ChevronLeft,
  CheckCircle,
  X
} from 'lucide-react'

export default function ResumeBuilder({ userProfile }: { userProfile: any }) {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('personal')
  const [skillsSaving, setSkillsSaving] = useState(false)
  const [skillsSaved, setSkillsSaved] = useState(false)

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
    if (!file) { setPhotoPreview(''); return }
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file.'); return }
    if (file.size > 3 * 1024 * 1024) { setError('Photo must be smaller than 3MB.'); return }
    const reader = new FileReader()
    reader.onload = () => { setPhotoPreview(String(reader.result || '')); setError(null) }
    reader.readAsDataURL(file)
  }

  // ── Section navigation helpers ──────────────────────────────────────────────
  const sections = [
    { id: 'personal',   label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience',    icon: Briefcase },
    { id: 'education',  label: 'Education',     icon: GraduationCap },
    { id: 'skills',     label: 'Skills',        icon: Code2 },
  ]
  const sectionIds = sections.map(s => s.id)
  const currentIndex = sectionIds.indexOf(activeSection)
  const isFirst = currentIndex === 0
  const isLast  = currentIndex === sectionIds.length - 1
  const goNext = () => { if (!isLast)  setActiveSection(sectionIds[currentIndex + 1]) }
  const goBack = () => { if (!isFirst) setActiveSection(sectionIds[currentIndex - 1]) }

  // ── Save skills to seeker profile ───────────────────────────────────────────
  const saveSkills = async () => {
    if (!userProfile) { setError('You must be logged in to save skills.'); return }
    setSkillsSaving(true)
    setError(null)
    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean)
      const supabase = createClient()
      const { error: err } = await supabase
        .from('seeker_profiles')
        .update({ skills: skillsArray })
        .eq('user_id', userProfile.user_id)
      if (err) throw err
      setSkillsSaved(true)
      setTimeout(() => setSkillsSaved(false), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to save skills')
    }
    setSkillsSaving(false)
  }

  // ── PDF generation ──────────────────────────────────────────────────────────
  const generatePDF = async (saveToProfile: boolean = false) => {
    if (!previewRef.current) return
    setLoading(true); setError(null); setSuccess(false)
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      if (saveToProfile) {
        if (!userProfile) { setError('You must be logged in to save to your profile.'); setLoading(false); return }
        const pdfBlob = pdf.output('blob')
        const fileName = `${userProfile.user_id}-resume-${Date.now()}.pdf`
        const supabase = createClient()
        const { data: uploadData, error: uploadError } = await supabase.storage.from('resumes').upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true })
        if (uploadError) throw new Error(uploadError.message)
        const { error: updateError } = await supabase.from('seeker_profiles').update({ resume_url: uploadData.path }).eq('user_id', userProfile.user_id)
        if (updateError) throw new Error(updateError.message)
        setSuccess(true)
        setTimeout(() => router.push('/profile'), 2000)
      } else {
        pdf.save(`${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`)
      }
    } catch (err: any) {
      console.error(err); setError(err.message || 'Error generating PDF')
    }
    setLoading(false)
  }

  // ── Preview data ────────────────────────────────────────────────────────────
  const experienceForPreview = experience.filter(exp => exp.company.trim() || exp.role.trim() || exp.description.trim())
  const educationForPreview  = education.filter(edu => edu.school.trim() || edu.degree.trim() || edu.year.trim())
  const skillsForPreview     = skills.split(',').map(s => s.trim()).filter(Boolean)

  const brandBlue        = '#102A4C'
  const inputClassName   = 'w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-[#102A4C] focus:bg-white focus:ring-2 focus:ring-[#102A4C]/20 backdrop-blur-sm'
  const textareaClassName = 'w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2.5 text-sm text-gray-800 outline-none transition-all focus:border-[#102A4C] focus:bg-white focus:ring-2 focus:ring-[#102A4C]/20 resize-y backdrop-blur-sm'

  // ── Section navigation footer (shared) ──────────────────────────────────────
  const NavFooter = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
      <button
        onClick={goBack}
        disabled={isFirst}
        className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all border border-gray-200 text-gray-600 hover:border-[#102A4C] hover:text-[#102A4C] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </button>

      <span className="text-xs font-semibold text-gray-400 tracking-widest">
        STEP {currentIndex + 1} / {sections.length}
      </span>

      {!isLast ? (
        <button
          onClick={goNext}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:brightness-110"
          style={{ backgroundColor: brandBlue }}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={saveSkills}
          disabled={skillsSaving || !userProfile}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#16a34a' }}
        >
          {skillsSaving ? (
            <span>Saving…</span>
          ) : skillsSaved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save Skills to Profile</>
          )}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* ── LEFT: Builder Form ──────────────────────────────────────────── */}
          <div className="xl:col-span-7 space-y-6">

            {/* Section Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-2 bg-white rounded-2xl border border-gray-200 shadow-sm">
              {sections.map((section, idx) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                const isDone   = idx < currentIndex
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                      isActive ? 'text-white shadow-lg' : isDone ? 'text-green-700 bg-green-50' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: brandBlue } : undefined}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Icon className="w-4 h-4" />}
                    {section.label}
                  </button>
                )
              })}
            </div>

            {/* ── PERSONAL INFO ── */}
            {activeSection === 'personal' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl"><User className="w-5 h-5 text-[#102A4C]" /></div>
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
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="w-full sm:w-auto text-sm text-gray-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:bg-[#102A4C] hover:file:bg-[#0d223d] transition-colors cursor-pointer" />
                      {photoPreview && (
                        <div className="relative">
                          <img src={photoPreview} alt="Profile preview" className="w-16 h-16 object-cover rounded-xl border-2 border-blue-200 shadow-sm" />
                          <button onClick={() => setPhotoPreview('')} className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
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

                <NavFooter />
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {activeSection === 'experience' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl"><Briefcase className="w-5 h-5 text-[#102A4C]" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Work Experience</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Add your professional experience</p>
                      </div>
                    </div>
                    <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:brightness-110" style={{ backgroundColor: brandBlue }}>
                      <Plus className="w-4 h-4" /> Add Role
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
                        <input value={exp.startDate} onChange={(e) => handleExpChange(exp.id, 'startDate', e.target.value)} placeholder="Start Date (e.g. Jan 2022)" className={inputClassName} />
                        <input value={exp.endDate} onChange={(e) => handleExpChange(exp.id, 'endDate', e.target.value)} placeholder="End Date (or Present)" className={inputClassName} />
                      </div>
                      <textarea value={exp.description} onChange={(e) => handleExpChange(exp.id, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements…" rows={3} className={textareaClassName} />
                    </div>
                  ))}
                </div>

                <NavFooter />
              </div>
            )}

            {/* ── EDUCATION ── */}
            {activeSection === 'education' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl"><GraduationCap className="w-5 h-5 text-[#102A4C]" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Education</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Add your educational background</p>
                      </div>
                    </div>
                    <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md hover:brightness-110" style={{ backgroundColor: brandBlue }}>
                      <Plus className="w-4 h-4" /> Add Education
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

                <NavFooter />
              </div>
            )}

            {/* ── SKILLS ── */}
            {activeSection === 'skills' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl"><Code2 className="w-5 h-5 text-[#102A4C]" /></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Skills &amp; Competencies</h2>
                      <p className="text-sm text-gray-500 mt-0.5">List your technical and soft skills</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <textarea
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder={`Simple: React, TypeScript, Node.js, Leadership\n\nGrouped (bold label in CV):\nLanguages: JavaScript, Python, SQL\nFrontend: React, Next.js, Tailwind\nBackend: Node.js, Express, PostgreSQL`}
                    rows={7}
                    className={textareaClassName}
                  />
                  <p className="text-xs text-gray-500">
                    Tip: Use <code className="bg-gray-100 px-1 rounded text-[11px]">Category: skill1, skill2</code> format per line for grouped display in the CV.
                  </p>

                  {/* Inline save feedback */}
                  {skillsSaved && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Skills saved to your profile successfully!
                    </div>
                  )}
                </div>

                <NavFooter />
              </div>
            )}
          </div>

          {/* ── RIGHT: Live Preview & Actions ──────────────────────────────── */}
          <div className="xl:col-span-5 space-y-5">

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex gap-3">
                <button onClick={() => generatePDF(false)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brandBlue }}>
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button onClick={() => generatePDF(true)} disabled={loading} className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50" style={{ backgroundColor: brandBlue }}>
                  <Save className="w-4 h-4" />
                  {loading ? 'Processing…' : 'Save to Profile'}
                </button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <X className="w-4 h-4" />{error}
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />Resume saved successfully! Redirecting…
                </div>
              )}
            </div>

            {/* Preview Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#102A4C]" />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">Scaled view — full A4 is exported to PDF</p>
              </div>

              {/*
                Zoom wrapper: scales the visual preview to ~65% so the full A4 CV
                fits inside the panel. The previewRef div is inside the zoom wrapper
                so html2canvas still captures it at full A4 resolution.
              */}
              <div className="bg-gray-200 p-4 overflow-y-auto" style={{ maxHeight: '780px' }}>
                <div style={{ zoom: 0.62, width: 'fit-content', margin: '0 auto' }}>
                  {/* ── CV PREVIEW — Navy + Lavender professional theme ── */}
                  <div
                    ref={previewRef}
                    style={{
                      width: '210mm',
                      minHeight: '297mm',
                      background: '#ffffff',
                      boxShadow: '0 8px 40px rgba(0,0,0,0.22)',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      color: '#1a1a1a',
                      padding: '14mm 16mm 14mm 16mm',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* ── HEADER ── */}
                    <header style={{ marginBottom: '6mm', paddingBottom: '5mm', borderBottom: '2px solid #102A4C' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '26px', fontWeight: '700', color: '#102A4C', lineHeight: 1.15, letterSpacing: '-0.3px' }}>
                            {personal.fullName || 'Your Full Name'}
                          </div>
                          {personal.headline && (
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#444', marginTop: '4px' }}>{personal.headline}</div>
                          )}
                          <div style={{ fontSize: '11px', color: '#555', marginTop: '7px', lineHeight: '1.7' }}>
                            {[personal.email, personal.phone, personal.location].filter(Boolean).join('  |  ')}
                          </div>
                          {personal.linkedin && (
                            <div style={{ fontSize: '11px', color: '#0055cc', marginTop: '2px', textDecoration: 'underline' }}>{personal.linkedin}</div>
                          )}
                        </div>
                        {photoPreview && (
                          <img src={photoPreview} alt="Profile" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #102A4C', flexShrink: 0 }} />
                        )}
                      </div>
                    </header>

                    {/* ── SUMMARY ── */}
                    {personal.summary && (
                      <section style={{ marginBottom: '6mm' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#102A4C', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '3px' }}>Summary</div>
                        <div style={{ height: '1.5px', backgroundColor: '#8B7EC8', marginBottom: '6px' }} />
                        <div style={{ fontSize: '11px', color: '#333', lineHeight: '1.7' }}>{personal.summary}</div>
                      </section>
                    )}

                    {/* ── EXPERIENCE ── */}
                    <section style={{ marginBottom: '6mm' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#102A4C', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '3px' }}>Work Experience</div>
                      <div style={{ height: '1.5px', backgroundColor: '#8B7EC8', marginBottom: '7px' }} />
                      <div>
                        {(experienceForPreview.length > 0 ? experienceForPreview : [{ id: 0, company: 'Company Name', role: 'Job Title', startDate: '2022', endDate: 'Present', description: '' }]).map((exp, i) => (
                          <div key={i} style={{ marginBottom: i < experienceForPreview.length - 1 ? '7px' : 0, paddingBottom: '6px', borderBottom: i < experienceForPreview.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>{exp.role || 'Job Title'}</div>
                              <div style={{ fontSize: '11px', color: '#666' }}>{exp.startDate || 'Start'} – {exp.endDate || 'End'}</div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#555', marginTop: '1px', marginBottom: exp.description ? '5px' : 0 }}>{exp.company || 'Company Name'}</div>
                            {exp.description && (
                              <div>
                                {exp.description.split('\n').filter(Boolean).map((line, idx) => (
                                  <div key={idx} style={{ fontSize: '11px', color: '#333', lineHeight: '1.65', display: 'flex', gap: '5px' }}>
                                    <span style={{ flexShrink: 0, marginTop: '1px' }}>•</span>
                                    <span>{line.replace(/^[-*•]\s*/, '')}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* ── EDUCATION ── */}
                    <section style={{ marginBottom: '6mm' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#102A4C', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '3px' }}>Education</div>
                      <div style={{ height: '1.5px', backgroundColor: '#8B7EC8', marginBottom: '7px' }} />
                      <div>
                        {(educationForPreview.length > 0 ? educationForPreview : [{ id: 0, school: 'University Name', degree: 'Bachelor of Science', year: '2020' }]).map((edu, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px', paddingBottom: '5px', borderBottom: i < educationForPreview.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a1a' }}>{edu.degree || 'Degree'}</div>
                              <div style={{ fontSize: '11px', color: '#555' }}>{edu.school || 'School/University'}</div>
                            </div>
                            <div style={{ fontSize: '11px', color: '#666', flexShrink: 0 }}>{edu.year || 'Year'}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* ── SKILLS ── */}
                    {skillsForPreview.length > 0 && (
                      <section>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#102A4C', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: '3px' }}>Technical Skills</div>
                        <div style={{ height: '1.5px', backgroundColor: '#8B7EC8', marginBottom: '7px' }} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {skillsForPreview.map((skill, idx) => {
                            const catMatch = skill.match(/^([^:]+):\s*(.+)$/)
                            if (catMatch) {
                              return (
                                <div key={idx} style={{ width: '100%', fontSize: '11px', color: '#1a1a1a', lineHeight: '1.7' }}>
                                  <span style={{ fontWeight: '700' }}>{catMatch[1]}:</span>{' '}{catMatch[2]}
                                </div>
                              )
                            }
                            return (
                              <span key={idx} style={{ fontSize: '10px', padding: '2px 10px', borderRadius: '999px', background: '#EEF2FF', color: '#3730a3', border: '1px solid #c7d2fe' }}>
                                {skill}
                              </span>
                            )
                          })}
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
    </div>
  )
}
