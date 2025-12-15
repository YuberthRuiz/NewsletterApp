import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const formData = await request.formData()
    const sponsorName = formData.get('sponsorName') as string
    const sponsorEmail = formData.get('sponsorEmail') as string
    const websiteUrl = formData.get('websiteUrl') as string
    const adCopy = formData.get('adCopy') as string
    const date = formData.get('date') as string
    const slotTypeId = formData.get('slotTypeId') as string
    const creatorSlug = formData.get('creatorSlug') as string
    const creativeFile = formData.get('creativeFile') as File | null

    if (!sponsorName || !sponsorEmail || !websiteUrl || !adCopy || !date || !slotTypeId || !creatorSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get creator
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id')
      .eq('slug', creatorSlug)
      .single()

    if (creatorError || !creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Find available slot
    const { data: slot, error: slotError } = await supabase
      .from('slots')
      .select('id, slot_types(price, name)')
      .eq('date', date)
      .eq('slot_type_id', slotTypeId)
      .eq('creator_id', creator.id)
      .eq('status', 'available')
      .single()

    if (slotError || !slot) {
      return NextResponse.json({ error: 'Slot not available' }, { status: 400 })
    }

    let creativeFileUrl = null
    if (creativeFile) {
      // Upload file to Supabase storage
      const fileName = `${Date.now()}-${creativeFile.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('creative-files')
        .upload(fileName, creativeFile)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
      }

      creativeFileUrl = supabase.storage.from('creative-files').getPublicUrl(fileName).data.publicUrl
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: (slot.slot_types as any).name,
            },
            unit_amount: Math.round((slot.slot_types as any).price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/booking/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/${creatorSlug}`,
      metadata: {
        sponsorName,
        sponsorEmail,
        websiteUrl: websiteUrl || '',
        adCopy,
        date,
        slotTypeId,
        creatorSlug,
        creativeFileUrl: creativeFileUrl || '',
        slotId: slot.id,
        creatorId: creator.id,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}