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

interface TicketConfirmationProps {
  userName: string
  eventTitle: string
  eventDate: string
  eventTime: string
  ticketPrice: string
  ticketId: string
  artistName: string
}

export function TicketConfirmation({
  userName = 'Fan',
  eventTitle = 'Concert Live',
  eventDate = '1 janvier 2026',
  eventTime = '20:00',
  ticketPrice = '19.99',
  ticketId = 'TICKET-123',
  artistName = 'Artiste',
}: TicketConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre billet pour {eventTitle} est confirmé !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎫 Billet confirmé !</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={text}>
            Votre achat est confirmé ! Vous avez un billet pour :
          </Text>

          <Section style={eventBox}>
            <Heading style={h2}>{eventTitle}</Heading>
            <Text style={artistText}>Par {artistName}</Text>
            <Text style={eventDetail}>📅 {eventDate} à {eventTime}</Text>
            <Text style={eventDetail}>💰 {ticketPrice}€</Text>
            <Text style={ticketIdText}>Billet #{ticketId}</Text>
          </Section>

          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/events/${ticketId}`} style={button}>
            Voir mon billet
          </Button>

          <Text style={text}>
            Connectez-vous 5 minutes avant le début pour profiter du concert en direct !
          </Text>

          <Text style={footer}>
            À bientôt sur VyBzzZ 🎵<br />
            L'équipe VyBzzZ
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default TicketConfirmation

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

const eventBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px',
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
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px',
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 24px 0',
  textAlign: 'center' as const,
}
