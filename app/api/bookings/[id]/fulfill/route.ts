import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createServerSupabaseClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const bookingId = id

  // First, get the booking to find the slot_id
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('slot_id')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Update the slot status to fulfilled
  const { error: updateError } = await supabase
    .from('slots')
    .update({ status: 'fulfilled' })
    .eq('id', booking.slot_id)
    .eq('creator_id', user.id) // Ensure the creator owns the slot

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}