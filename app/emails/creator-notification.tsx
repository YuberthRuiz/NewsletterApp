import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Button,
} from '@react-email/components'

interface CreatorNotificationProps {
  creatorName: string
  sponsorName: string
  sponsorEmail: string
  websiteUrl: string
  adCopy: string
  date: string
  slotTypeName: string
  price: number
  dashboardUrl: string
}

export default function CreatorNotification({
  creatorName,
  sponsorName,
  sponsorEmail,
  websiteUrl,
  adCopy,
  date,
  slotTypeName,
  price,
  dashboardUrl,
}: CreatorNotificationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', padding: '20px' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
          <Heading style={{ color: '#333' }}>New Booking Notification</Heading>
          <Text>Hi {creatorName},</Text>
          <Text>You have a new sponsorship booking! Here are the details:</Text>

          <Section style={{ margin: '20px 0' }}>
            <Heading as="h3" style={{ color: '#333' }}>Sponsor Information</Heading>
            <Text><strong>Name:</strong> {sponsorName}</Text>
            <Text><strong>Email:</strong> {sponsorEmail}</Text>
            <Text><strong>Website:</strong> {websiteUrl}</Text>
          </Section>

          <Section style={{ margin: '20px 0' }}>
            <Heading as="h3" style={{ color: '#333' }}>Booking Details</Heading>
            <Text><strong>Date:</strong> {new Date(date).toLocaleDateString()}</Text>
            <Text><strong>Slot Type:</strong> {slotTypeName}</Text>
            <Text><strong>Price:</strong> ${price.toFixed(2)}</Text>
            <Text><strong>Ad Copy:</strong> {adCopy}</Text>
          </Section>

          <Hr />

          <Text>
            View your dashboard for more details:
          </Text>
          <Button href={dashboardUrl} style={{ backgroundColor: '#007bff', color: '#ffffff', padding: '10px 20px', textDecoration: 'none', borderRadius: '5px' }}>
            Go to Dashboard
          </Button>

          <Text>Best regards,<br />NewsletterApp Team</Text>
        </Container>
      </Body>
    </Html>
  )
}