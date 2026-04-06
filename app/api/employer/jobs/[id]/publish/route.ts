import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get employer profile
  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Employer profile not found' }, { status: 403 })
  }

  // Verify job ownership and check it is a draft
  const { data: job } = await supabase
    .from('jobs')
    .select('id, employer_id, status')
    .eq('id', id)
    .single()

  if (!job || job.employer_id !== profile.id) {
    return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 403 })
  }

  if (job.status !== 'draft') {
    return NextResponse.json({ error: 'Job is not in draft status' }, { status: 400 })
  }

  // Parse payment card details from request body
  let body: { card_last4?: string; cardholder_name?: string } = {}
  try {
    body = await request.json()
  } catch {
    // body is optional
  }

  // Record the (dummy) payment
  await supabase.from('payments').insert({
    job_id: id,
    employer_id: profile.id,
    amount: 2500,
    currency: 'LKR',
    status: 'completed',
    card_last4: body.card_last4 ?? '****',
    cardholder_name: body.cardholder_name ?? '',
  })

  // Publish the job
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'active' })
    .eq('id', id)

  if (error) {
    console.error('publish error', error)
    return NextResponse.json({ error: 'Failed to publish job' }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/employer/dashboard')
  revalidatePath(`/jobs/${id}`)

  return NextResponse.json({ success: true })
}
