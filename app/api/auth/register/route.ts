import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, role } = await request.json()
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
