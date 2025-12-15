import { supabase } from '@/utils/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Fetch creator by slug
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('id, newsletter_name, timezone')
    .eq('slug', slug)
    .single()

  if (creatorError || !creator) {
    return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
  }

  // Fetch available slots with slot types
  const { data: slots, error: slotsError } = await supabase
    .from('slots')
    .select(`
      id,
      date,
      status,
      slot_types (
        id,
        name,
        price
      )
    `)
    .eq('creator_id', creator.id)
    .eq('status', 'available')
    .order('date', { ascending: true })

  if (slotsError) {
    return NextResponse.json({ error: slotsError.message }, { status: 500 })
  }

  return NextResponse.json({
    creator,
    slots
  })
}