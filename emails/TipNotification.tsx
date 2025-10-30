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

interface TipNotificationProps {
  artistName: string
  amount: string
  fanName: string
  message?: string
  eventTitle?: string
}

export function TipNotification({
  artistName = 'Artiste',
  amount = '5.00',
  fanName = 'Un fan',
  message = '',
  eventTitle = '',
}: TipNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Vous avez reçu un pourboire de {amount}€ !</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💝 Nouveau pourboire !</Heading>

          <Text style={text}>Bonjour {artistName},</Text>

          <Text style={text}>
            Vous avez reçu un pourboire de la part de <strong>{fanName}</strong> !
          </Text>

          <Section style={tipBox}>
            <Heading style={amountHeading}>{amount}€</Heading>
            <Text style={fanText}>De {fanName}</Text>
            {eventTitle && (
              <Text style={eventText}>Pendant : {eventTitle}</Text>
            )}
          </Section>

          {message && (
            <Section style={messageBox}>
              <Text style={messageLabel}>Message :</Text>
              <Text style={messageText}>"{message}"</Text>
            </Section>
          )}

          <Text style={text}>
            Ce montant sera ajouté à vos prochains revenus. Continuez à créer du contenu incroyable pour vos fans !
          </Text>

          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/artist/dashboard`} style={button}>
            Voir mes revenus
          </Button>

          <Text style={footer}>
            Merci de faire partie de VyBzzZ 🎵<br />
            L'équipe VyBzzZ
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default TipNotification

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
  color: '#ec4899',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
}

const tipBox = {
  backgroundColor: '#fdf2f8',
  borderRadius: '8px',
  border: '2px solid #ec4899',
  padding: '24px',
  margin: '24px',
  textAlign: 'center' as const,
}

const amountHeading = {
  color: '#ec4899',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const fanText = {
  color: '#666',
  fontSize: '16px',
  margin: '8px 0',
}

const eventText = {
  color: '#999',
  fontSize: '14px',
  margin: '8px 0',
  fontStyle: 'italic',
}

const messageBox = {
  backgroundColor: '#f9fafb',
  borderLeft: '4px solid #ec4899',
  padding: '16px 20px',
  margin: '24px',
  borderRadius: '4px',
}

const messageLabel = {
  color: '#666',
  fontSize: '12px',
  fontWeight: 'bold',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}

const messageText = {
  color: '#333',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '24px',
  margin: '0',
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
