import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components'

interface SponsorConfirmationProps {
  sponsorName: string
  sponsorEmail: string
  websiteUrl: string
  adCopy: string
  date: string
  slotTypeName: string
  price: number
  receiptUrl: string
}

export default function SponsorConfirmation({
  sponsorName,
  sponsorEmail,
  websiteUrl,
  adCopy,
  date,
  slotTypeName,
  price,
  receiptUrl,
}: SponsorConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
          <Heading style={{ color: '#333' }}>Booking Confirmation</Heading>
          <Text>Hi {sponsorName},</Text>
          <Text>Your sponsorship has been successfully booked! Here are the details:</Text>

          <Section style={{ margin: '20px 0' }}>
            <Text><strong>Date:</strong> {new Date(date).toLocaleDateString()}</Text>
            <Text><strong>Slot Type:</strong> {slotTypeName}</Text>
            <Text><strong>Price:</strong> ${price.toFixed(2)}</Text>
            <Text><strong>Website:</strong> {websiteUrl}</Text>
            <Text><strong>Ad Copy:</strong> {adCopy}</Text>
          </Section>

          <Hr />

          <Text>
            You can view your receipt here: <a href={receiptUrl}>{receiptUrl}</a>
          </Text>

          <Text>Thank you for sponsoring!</Text>
          <Text>Best regards,<br />NewsletterApp Team</Text>
        </Container>
      </Body>
    </Html>
  )
}