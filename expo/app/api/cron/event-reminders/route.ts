import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger, createPerformanceTracker } from '@/lib/logger'
import { env } from '@/lib/env'
import { emailHelpers } from '@/lib/email'

/**
 * Event Reminder Cron Job - 1 hour before events
 * GET /api/cron/event-reminders
 *
 * This endpoint should be called every 10 minutes by a cron job
 * to send reminder emails to ticket holders 1 hour before events start.
 *
 * Process:
 * 1. Find all events starting in the next 60-70 minutes
 * 2. Get all ticket holders for those events
 * 3. Send reminder emails to each ticket holder
 * 4. Mark reminders as sent to avoid duplicates
 *
 * Security: This endpoint should be protected with an API key or cron secret
 */

export async function GET(request: NextRequest) {
  const tracker = createPerformanceTracker('cron_event_reminders')

  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization')
  const cronSecret = env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    logger.warn('Unauthorized cron access attempt', {
      hasAuthHeader: !!authHeader,
      hasCronSecret: !!cronSecret,
    })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  try {
    // Calculate time window (events starting in 60-70 minutes)
    const now = new Date()
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)
    const seventyMinutesFromNow = new Date(now.getTime() + 70 * 60 * 1000)

    logger.info('Starting event reminders cron job', {
      now: now.toISOString(),
      startWindow: oneHourFromNow.toISOString(),
      endWindow: seventyMinutesFromNow.toISOString(),
    })

    // Find events starting in next 60-70 minutes
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        event_time,
        artist_id,
        artist:artists(
          id,
          stage_name
        )
      `)
      .in('status', ['scheduled', 'live'])
      .gte('event_date', oneHourFromNow.toISOString().split('T')[0])
      .lte('event_date', seventyMinutesFromNow.toISOString().split('T')[0])

    if (eventsError) {
      throw eventsError
    }

    if (!events || events.length === 0) {
      logger.info('No events to send reminders for', {
        window: `${oneHourFromNow.toISOString()} - ${seventyMinutesFromNow.toISOString()}`,
      })
      return NextResponse.json({
        success: true,
        message: 'No events to remind',
        processedCount: 0,
      })
    }

    // Filter events based on actual time (event_date + event_time)
    const eventsToRemind = events.filter((event: any) => {
      const eventDateTime = new Date(`${event.event_date}T${event.event_time}`)
      return eventDateTime >= oneHourFromNow && eventDateTime <= seventyMinutesFromNow
    })

    if (eventsToRemind.length === 0) {
      logger.info('No events in time window after filtering', {
        totalEvents: events.length,
        filteredEvents: 0,
      })
      return NextResponse.json({
        success: true,
        message: 'No events in time window',
        processedCount: 0,
      })
    }

    logger.info('Found events to send reminders for', {
      eventCount: eventsToRemind.length,
    })

    const results = []
    let successCount = 0
    let errorCount = 0

    for (const event of eventsToRemind) {
      try {
        const artist = Array.isArray(event.artist) ? event.artist[0] : event.artist as any

        // Get all confirmed tickets for this event
        const { data: tickets, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            id,
            user_id,
            user:profiles!tickets_user_id_fkey(
              full_name,
              email
            )
          `)
          .eq('event_id', event.id)
          .eq('payment_status', 'completed')

        if (ticketsError) {
          throw ticketsError
        }

        if (!tickets || tickets.length === 0) {
          logger.info('No tickets for event, skipping reminders', {
            eventId: event.id,
          })
          continue
        }

        // Send reminder to each ticket holder
        for (const ticket of tickets) {
          try {
            const user = Array.isArray(ticket.user) ? ticket.user[0] : ticket.user as any

            if (!user?.email) {
              logger.warn('No email for ticket holder, skipping', {
                ticketId: ticket.id,
                userId: ticket.user_id,
              })
              continue
            }

            // Format event date and time
            const eventDate = new Date(event.event_date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })

            await emailHelpers.sendEventReminder(user.email, {
              userName: user.full_name || 'Fan',
              eventTitle: event.title || 'Concert Live',
              eventDate: eventDate,
              eventTime: event.event_time || '20:00',
              artistName: artist?.stage_name || 'Artiste',
              ticketId: ticket.id,
            })

            successCount++
            logger.info('Event reminder sent', {
              eventId: event.id,
              ticketId: ticket.id,
              email: user.email,
            })
          } catch (emailError: any) {
            logger.error('Failed to send event reminder email', emailError, {
              eventId: event.id,
              ticketId: ticket.id,
            })
            errorCount++
          }
        }

        results.push({
          eventId: event.id,
          eventTitle: event.title,
          ticketsSent: tickets.length,
          status: 'completed',
        })
      } catch (error: any) {
        logger.error('Error processing event reminders', error, {
          eventId: event.id,
        })
        errorCount++
        results.push({
          eventId: event.id,
          eventTitle: event.title,
          status: 'error',
          error: error.message,
        })
      }
    }

    const duration = tracker.end({ eventCount: eventsToRemind.length, successCount, errorCount })

    logger.info('Event reminders cron job completed', {
      totalEvents: eventsToRemind.length,
      successCount,
      errorCount,
      duration,
    })

    return NextResponse.json({
      success: true,
      message: `Processed ${eventsToRemind.length} events. ${successCount} reminders sent, ${errorCount} failed.`,
      processedCount: eventsToRemind.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: any) {
    logger.error('Unexpected error in event reminders cron job', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process event reminders' },
      { status: 500 }
    )
  }
}
