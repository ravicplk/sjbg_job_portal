import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // Form-based logout should redirect users directly to sign-in page.
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 })
}
