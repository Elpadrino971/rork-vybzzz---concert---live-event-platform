import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP (strict)
    const rateLimitResult = await rateLimit(request, 'strict')
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Validate API key is configured
    if (!OPENAI_API_KEY) {
      logger.error('OPENAI_API_KEY not configured')
      return NextResponse.json(
        { error: 'Chat service is not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Limit message length
    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long (max 1000 characters)' },
        { status: 400 }
      )
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for Vybzzz, a concert and live event platform. You help users with:
            - Finding and discovering live music events and concerts
            - Buying tickets and VIP passes
            - Uploading and sharing concert videos
            - Becoming verified artists on the platform
            - Using premium features and subscriptions
            - Navigating the app and its features
            - General questions about live music and events

            Keep responses helpful, friendly, and concise. Focus on Vybzzz-related topics.`,
          },
          {
            role: 'user',
            content: message.trim(),
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error('OpenAI API error', undefined, {
        status: response.status,
        errorData: JSON.stringify(errorData)
      })

      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      logger.error('Invalid OpenAI response format', undefined, {
        responseData: JSON.stringify(data)
      })
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      )
    }

    const aiResponse = data.choices[0].message.content.trim()

    return NextResponse.json({
      response: aiResponse,
    })

  } catch (error) {
    logger.error('Chat API error', error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
