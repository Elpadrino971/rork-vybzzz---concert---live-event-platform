import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAffiliateStats } from '@/lib/affiliates'

export async function GET(request: NextRequest) {
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

    // Check if user is an affiliate
    const { data: affiliate } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!affiliate) {
      return NextResponse.json(
        { error: 'User is not an affiliate' },
        { status: 404 }
      )
    }

    // Get affiliate stats
    const stats = await getAffiliateStats(user.id)

    // Get recent referrals
    const { data: recentReferrals } = await supabase
      .from('tickets')
      .select('*, event:events(title), user:profiles(full_name)')
      .eq('affiliate_id', user.id)
      .order('purchased_at', { ascending: false })
      .limit(10)

    // Get commission history
    const { data: commissions } = await supabase
      .from('affiliate_commissions')
      .select('*, ticket:tickets(*, event:events(title))')
      .eq('affiliate_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      affiliate,
      stats,
      recentReferrals,
      commissions,
    })
  } catch (error: any) {
    console.error('Error fetching affiliate stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
