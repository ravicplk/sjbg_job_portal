import { describe, expect, it } from 'vitest'
import { applicationSchema, employerProfileSchema, registerSchema } from '@/utils/validation/forms'

describe('validation schemas', () => {
  it('registerSchema rejects invalid email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: '123456',
      firstName: 'A',
      lastName: 'B',
      role: 'job_seeker',
    })
    expect(result.success).toBe(false)
  })

  it('employerProfileSchema requires company_name', () => {
    const result = employerProfileSchema.safeParse({
      company_name: '',
      industry: '',
      phone: '',
      website: '',
      about: '',
    })
    expect(result.success).toBe(false)
  })

  it('applicationSchema requires full_name and telephone', () => {
    const result = applicationSchema.safeParse({
      full_name: '',
      telephone: '',
      qualification: '',
      cover_note: '',
    })
    expect(result.success).toBe(false)
  })
})

