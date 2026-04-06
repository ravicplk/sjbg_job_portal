import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { registerSchema } from '@/utils/validation/forms'

export async function POST(request: Request) {
  try {
    const payload = await request.json()
    const parsed = registerSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid registration data' }, { status: 400 })
    }

    const { email, password, firstName, lastName, role } = parsed.data
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    let redirectTo = '/'
    if (role === 'employer') redirectTo = '/employer/dashboard'
    if (role === 'job_seeker') redirectTo = '/dashboard'

    return NextResponse.json({ user: data.user, redirectTo })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
