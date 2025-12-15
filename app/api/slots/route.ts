import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')

  if (!start || !end) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('slots')
    .select(`
      *,
      slot_types (
        name
      )
    `)
    .eq('creator_id', user.id)
    .gte('date', start)
    .lte('date', end)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slot_type_id, date } = await request.json()

  if (!slot_type_id || !date) {
    return NextResponse.json({ error: 'Slot type ID and date are required' }, { status: 400 })
  }

  // Check if slot_type belongs to user
  const { data: slotType, error: slotTypeError } = await supabase
    .from('slot_types')
    .select('id')
    .eq('id', slot_type_id)
    .eq('creator_id', user.id)
    .single()

  if (slotTypeError || !slotType) {
    return NextResponse.json({ error: 'Invalid slot type' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('slots')
    .insert({
      creator_id: user.id,
      slot_type_id,
      date,
      status: 'available'
    })
    .select(`
      *,
      slot_types (
        name
      )
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}