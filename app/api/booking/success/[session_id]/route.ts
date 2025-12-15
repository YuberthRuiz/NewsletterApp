import { createServerSupabaseClient } from '@/utils/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import SponsorConfirmation from '@/app/emails/sponsor-confirmation'
import CreatorNotification from '@/app/emails/creator-notification'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY!)

export async function GET(request: NextRequest, { params }: { params: Promise<{ session_id: string }> }) {
  const supabase = createServerSupabaseClient()
  const { session_id } = await params

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/${session.metadata?.creatorSlug}?error=payment_failed`)
    }

    const metadata = session.metadata!

    // Insert booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        sponsor_name: metadata.sponsorName,
        sponsor_email: metadata.sponsorEmail,
        website_url: metadata.websiteUrl || null,
        ad_copy: metadata.adCopy,
        creative_file_url: metadata.creativeFileUrl || null,
        slot_id: metadata.slotId,
        creator_id: metadata.creatorId,
        payment_status: 'paid'
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/${metadata.creatorSlug}?error=booking_failed`)
    }

    // Update slot status
    const { error: updateError } = await supabase
      .from('slots')
      .update({ status: 'booked' })
      .eq('id', metadata.slotId)

    if (updateError) {
      console.error('Update slot error:', updateError)
      // Booking created, but slot not updated
    }

    // Get additional data for emails
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('newsletter_name, email')
      .eq('id', metadata.creatorId)
      .single()

    const { data: slotData, error: slotDataError } = await supabase
      .from('slots')
      .select('slot_types(name, price)')
      .eq('id', metadata.slotId)
      .single()

    if (creatorError || !creator || slotDataError || !slotData) {
      console.error('Error fetching data for emails:', creatorError, slotDataError)
      // Continue without sending emails
    } else {
      const slotType = slotData.slot_types as any
      const receiptUrl = (session as any).receipt_url || 'https://stripe.com/receipts' // Placeholder

      // Send sponsor confirmation email
      const sponsorHtml = await render(SponsorConfirmation({
        sponsorName: metadata.sponsorName,
        sponsorEmail: metadata.sponsorEmail,
        websiteUrl: metadata.websiteUrl,
        adCopy: metadata.adCopy,
        date: metadata.date,
        slotTypeName: slotType.name,
        price: slotType.price,
        receiptUrl,
      }))

      await resend.emails.send({
        from: 'noreply@newsletterapp.com',
        to: metadata.sponsorEmail,
        subject: 'Booking Confirmation',
        html: sponsorHtml,
      })

      // Send creator notification email
      const creatorHtml = await render(CreatorNotification({
        creatorName: creator.newsletter_name,
        sponsorName: metadata.sponsorName,
        sponsorEmail: metadata.sponsorEmail,
        websiteUrl: metadata.websiteUrl,
        adCopy: metadata.adCopy,
        date: metadata.date,
        slotTypeName: slotType.name,
        price: slotType.price,
        dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`,
      }))

      await resend.emails.send({
        from: 'noreply@newsletterapp.com',
        to: creator.email,
        subject: 'New Booking Notification',
        html: creatorHtml,
      })
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success`)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?error=unknown`)
  }
}