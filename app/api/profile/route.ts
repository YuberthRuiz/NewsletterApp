import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('creators')
    .select('newsletter_name, slug, timezone')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newsletterName, slug, timezone } = await request.json()

  if (!newsletterName || !slug || !timezone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check if slug is unique (excluding current user)
  const { data: existing, error: checkError } = await supabase
    .from('creators')
    .select('id')
    .eq('slug', slug)
    .neq('id', user.id)

  if (checkError) {
    return NextResponse.json({ error: checkError.message }, { status: 500 })
  }

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Slug already taken' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('creators')
    .update({
      newsletter_name: newsletterName,
      slug,
      timezone
    })
    .eq('id', user.id)
    .select('newsletter_name, slug, timezone')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}