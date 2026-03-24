import { z } from 'zod'

const optionalTrimmed = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or less`)
    .optional()
    .or(z.literal(''))
    .transform((v) => (v ? v : ''))

const phoneRegex = /^[0-9+\-()\s]{7,20}$/

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().trim().min(1, 'First name is required').max(80),
  lastName: z.string().trim().min(1, 'Last name is required').max(80),
  role: z.enum(['job_seeker', 'employer']),
})

export const seekerProfileSchema = z.object({
  headline: optionalTrimmed(120),
  location: optionalTrimmed(120),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || phoneRegex.test(v), 'Phone number format is invalid')
    .transform((v) => (v ? v : '')),
  linkedin_url: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//i.test(v), 'LinkedIn URL must start with http:// or https://')
    .refine((v) => !v || z.string().url().safeParse(v).success, 'LinkedIn URL is invalid')
    .transform((v) => (v ? v : '')),
})

export const employerProfileSchema = z.object({
  company_name: z.string().trim().min(2, 'Company name is required').max(120),
  industry: optionalTrimmed(80),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || phoneRegex.test(v), 'Phone number format is invalid')
    .transform((v) => (v ? v : '')),
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Website URL must start with http:// or https://')
    .refine((v) => !v || z.string().url().safeParse(v).success, 'Website URL is invalid')
    .transform((v) => (v ? v : '')),
  about: optionalTrimmed(2000),
})

export const jobCreateSchema = z.object({
  action: z.enum(['draft', 'publish']),
  title: z.string().trim().min(3, 'Job title is required').max(120),
  category: z.enum(['Engineering', 'Marketing', 'Operations', 'Sales', 'Finance', 'Design', 'Administration', 'Other']),
  role_type: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance']),
  location: z.string().trim().min(2, 'Location is required').max(120),
  experience_level: z.enum(['Entry-Level', 'Mid-Level', 'Senior', 'Executive']),
  description: z.string().trim().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().trim().min(10, 'Requirements must be at least 10 characters'),
  salary_range: optionalTrimmed(80),
  deadline: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), 'Deadline is invalid')
    .transform((v) => (v ? v : '')),
})

export const jobEditSchema = jobCreateSchema.extend({
  action: z.enum(['draft', 'publish', 'closed']),
})

export const applicationSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name is required').max(120, 'Full name must be 120 characters or less'),
  telephone: z
    .string()
    .trim()
    .min(7, 'Telephone number is required')
    .max(20, 'Telephone number must be 20 characters or less')
    .refine((v) => phoneRegex.test(v), 'Telephone number format is invalid'),
  qualification: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length <= 120, 'Qualification must be 120 characters or less')
    .transform((v) => (v ? v : '')),
  cover_note: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || v.length <= 2000, 'Cover note must be 2000 characters or less')
    .transform((v) => (v ? v : '')),
})

export function isValidResumeFile(file: File) {
  const maxBytes = 5 * 1024 * 1024
  const allowed = ['pdf', 'doc', 'docx']
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  return file.size <= maxBytes && allowed.includes(ext)
}

export function isValidLogoFile(file: File) {
  const maxBytes = 5 * 1024 * 1024
  return file.size <= maxBytes && file.type.startsWith('image/')
}

