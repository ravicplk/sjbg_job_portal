import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  // To avoid cors/redirect fetch errors, return json success for logout component
  return NextResponse.json({ success: true, redirectTo: '/login' })
}
