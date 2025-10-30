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

interface PayoutNotificationProps {
  artistName: string
  amount: string
  period: string
  transferId: string
}

export function PayoutNotification({
  artistName = 'Artiste',
  amount = '1,234.56',
  period = 'Décembre 2025',
  transferId = 'po_123456789',
}: PayoutNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Virement de {amount}€ effectué</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💰 Virement effectué</Heading>

          <Text style={text}>Bonjour {artistName},</Text>

          <Text style={text}>
            Votre virement a été effectué avec succès !
          </Text>

          <Section style={payoutBox}>
            <Heading style={amountHeading}>{amount}€</Heading>
            <Text style={periodText}>Période : {period}</Text>
            <Text style={transferText}>Référence : {transferId}</Text>
          </Section>

          <Text style={text}>
            Les fonds devraient arriver sur votre compte bancaire dans 2-3 jours ouvrés.
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

export default PayoutNotification

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
  color: '#10b981',
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

const payoutBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  border: '2px solid #10b981',
  padding: '24px',
  margin: '24px',
  textAlign: 'center' as const,
}

const amountHeading = {
  color: '#10b981',
  fontSize: '48px',
  fontWeight: 'bold',
  margin: '0 0 16px',
}

const periodText = {
  color: '#666',
  fontSize: '16px',
  margin: '8px 0',
}

const transferText = {
  color: '#999',
  fontSize: '14px',
  fontFamily: 'monospace',
  marginTop: '16px',
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
