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

interface EmailVerificationProps {
  userName: string
  verificationUrl: string
  verificationCode: string
}

export function EmailVerification({
  userName = 'Utilisateur',
  verificationUrl = 'https://vybzzz.com/verify',
  verificationCode = '123456',
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Vérifiez votre adresse email pour VyBzzZ</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✉️ Vérifiez votre email</Heading>

          <Text style={text}>Bonjour {userName},</Text>

          <Text style={text}>
            Bienvenue sur VyBzzZ ! Pour activer votre compte, veuillez vérifier votre adresse email.
          </Text>

          <Section style={codeBox}>
            <Text style={codeLabel}>Votre code de vérification :</Text>
            <Text style={code}>{verificationCode}</Text>
          </Section>

          <Text style={text}>Ou cliquez sur le bouton ci-dessous :</Text>

          <Button href={verificationUrl} style={button}>
            Vérifier mon email
          </Button>

          <Text style={note}>
            Ce code expire dans 24 heures.
          </Text>

          <Text style={footer}>
            Si vous n'avez pas créé de compte VyBzzZ, ignorez cet email.<br />
            L'équipe VyBzzZ
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default EmailVerification

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

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
}

const codeBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px',
  textAlign: 'center' as const,
}

const codeLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const code = {
  color: '#9333ea',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  fontFamily: 'monospace',
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

const note = {
  color: '#8898aa',
  fontSize: '14px',
  margin: '24px',
  textAlign: 'center' as const,
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 24px 0',
  textAlign: 'center' as const,
}
