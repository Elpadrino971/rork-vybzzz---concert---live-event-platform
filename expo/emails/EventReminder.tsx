import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface EventReminderProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  artistName: string
  ticketId: string
}

export function EventReminder({
  userName = 'Fan',
  eventTitle = 'Concert Live',
  eventDate = '1 janvier 2026',
  eventTime = '20:00',
  artistName = 'Artiste',
  ticketId = 'TICKET-123',
}: EventReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>{eventTitle} commence dans 1 heure !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎵 C'est bientôt l'heure !</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={urgentText}>
            Le concert commence dans 1 heure !
          </Text>

          <Section style={eventBox}>
            <Heading style={h2}>{eventTitle}</Heading>
            <Text style={artistText}>Par {artistName}</Text>
            <Text style={eventDetail}>📅 {eventDate}</Text>
            <Text style={eventDetail}>🕐 {eventTime}</Text>
            <Text style={ticketIdText}>Billet #{ticketId}</Text>
          </Section>

          <Text style={text}>
            Connectez-vous maintenant pour ne rien manquer du début du spectacle !
          </Text>

          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${ticketId}`} style={button}>
            Rejoindre le concert
          </Button>

          <Text style={tipText}>
            💡 Préparez votre connexion internet et vos écouteurs/haut-parleurs.
          </Text>

          <Text style={footer}>
            À tout de suite sur VyBzzZ 🎵<br />
            L'équipe VyBzzZ
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EventReminder

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const h1 = {
  color: '#9333ea',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 10px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
}

const urgentText = {
  color: '#dc2626',
  fontSize: '20px',
  fontWeight: 'bold',
  lineHeight: '28px',
  margin: '24px',
  textAlign: 'center' as const,
}

const eventBox = {
  backgroundColor: '#faf5ff',
  borderRadius: '8px',
  border: '2px solid #9333ea',
  padding: '24px',
  margin: '24px',
  textAlign: 'center' as const,
}

const artistText = {
  color: '#9333ea',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const eventDetail = {
  color: '#666',
  fontSize: '16px',
  margin: '8px 0',
}

const ticketIdText = {
  color: '#999',
  fontSize: '14px',
  marginTop: '16px',
  fontFamily: 'monospace',
}

const button = {
  backgroundColor: '#9333ea',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '18px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 24px',
  margin: '24px',
}

const tipText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 24px',
  padding: '16px',
  backgroundColor: '#fffbeb',
  borderLeft: '4px solid #f59e0b',
  borderRadius: '4px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 24px 0',
  textAlign: 'center' as const,
}
