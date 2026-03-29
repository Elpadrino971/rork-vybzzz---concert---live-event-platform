import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not configured - emails will not be sent')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = process.env.FROM_EMAIL || 'VyBzzZ <noreply@vybzzz.com>'

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  react?: React.ReactElement
}

export async function sendEmail({ to, subject, html, react }: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      ...(react ? { react } : { html }),
    })

    console.log('Email sent successfully:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Quick send helpers
export const emailHelpers = {
  async sendTicketConfirmation(to: string, ticketData: any) {
    const { TicketConfirmation } = await import('@/emails/TicketConfirmation')
    return sendEmail({
      to,
      subject: `🎫 Confirmation de votre billet - ${ticketData.eventTitle}`,
      react: TicketConfirmation(ticketData),
    })
  },

  async sendEmailVerification(to: string, verificationData: any) {
    const { EmailVerification } = await import('@/emails/EmailVerification')
    return sendEmail({
      to,
      subject: '✉️ Vérifiez votre adresse email - VyBzzZ',
      react: EmailVerification(verificationData),
    })
  },

  async sendPayoutNotification(to: string, payoutData: any) {
    const { PayoutNotification } = await import('@/emails/PayoutNotification')
    return sendEmail({
      to,
      subject: `💰 Virement effectué - ${payoutData.amount}€`,
      react: PayoutNotification(payoutData),
    })
  },

  async sendEventReminder(to: string, eventData: any) {
    const { EventReminder } = await import('@/emails/EventReminder')
    return sendEmail({
      to,
      subject: `🎵 ${eventData.eventTitle} commence dans 1 heure !`,
      react: EventReminder(eventData),
    })
  },

  async sendTipNotification(to: string, tipData: any) {
    const { TipNotification } = await import('@/emails/TipNotification')
    return sendEmail({
      to,
      subject: `💝 Vous avez reçu un pourboire de ${tipData.amount}€`,
      react: TipNotification(tipData),
    })
  },
}
