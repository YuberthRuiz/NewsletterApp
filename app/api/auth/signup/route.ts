import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, newsletterName, slug, timezone } = await request.json()

  if (!email || !password || !newsletterName || !slug || !timezone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Set the session for the client to authenticate the insert
  if (data.session) {
    await supabase.auth.setSession(data.session)
  }

  // Create creator profile
  const { error: profileError } = await supabase
    .from('creators')
    .insert({
      id: data.user?.id,
      email,
      newsletter_name: newsletterName,
      slug,
      timezone,
    })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ user: data.user, session: data.session })
}