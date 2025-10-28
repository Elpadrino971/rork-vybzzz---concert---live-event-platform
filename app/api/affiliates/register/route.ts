import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { registerAffiliate } from '@/lib/affiliates'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { parentReferralCode } = await request.json()

    // Check if user is already an affiliate
    const { data: existingAffiliate } = await supabase
      .from('affiliates')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingAffiliate) {
      return NextResponse.json(
        { error: 'User is already an affiliate' },
        { status: 400 }
      )
    }

    // Register as affiliate
    const result = await registerAffiliate(user.id, parentReferralCode)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      affiliate: result.affiliate,
    })
  } catch (error: any) {
    console.error('Error registering affiliate:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
