import { COMMISSION_RATES } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

/**
 * Calculate commission for each level of the affiliate hierarchy
 * Level 1: 2.5% (direct referral)
 * Level 2: 1.5% (parent of referrer)
 * Level 3: 1% (grandparent of referrer)
 */
export function calculateAffiliateCommissions(ticketPrice: number): {
  level1: number
  level2: number
  level3: number
  total: number
} {
  const level1 = Math.round(ticketPrice * COMMISSION_RATES.level1 * 100) / 100
  const level2 = Math.round(ticketPrice * COMMISSION_RATES.level2 * 100) / 100
  const level3 = Math.round(ticketPrice * COMMISSION_RATES.level3 * 100) / 100

  return {
    level1,
    level2,
    level3,
    total: level1 + level2 + level3,
  }
}

/**
 * Get the full affiliate hierarchy for a given affiliate
 */
export async function getAffiliateHierarchy(affiliateId: string) {
  const supabase = await createClient()

  const { data: affiliate, error } = await supabase
    .from('affiliates')
    .select('id, parent_affiliate_id, grandparent_affiliate_id, referral_code')
    .eq('id', affiliateId)
    .single()

  if (error || !affiliate) {
    return null
  }

  return {
    level1: affiliate.id,
    level2: affiliate.parent_affiliate_id,
    level3: affiliate.grandparent_affiliate_id,
  }
}

/**
 * Create affiliate commissions for a ticket purchase
 */
export async function createAffiliateCommissionsForTicket(
  ticketId: string,
  ticketPrice: number,
  affiliateId: string
) {
  const supabase = await createClient()

  // Get the affiliate hierarchy
  const hierarchy = await getAffiliateHierarchy(affiliateId)
  if (!hierarchy) {
    return { success: false, error: 'Affiliate not found' }
  }

  const commissions = calculateAffiliateCommissions(ticketPrice)
  const commissionsToCreate: any[] = []

  // Level 1 - Direct referrer
  if (hierarchy.level1) {
    commissionsToCreate.push({
      affiliate_id: hierarchy.level1,
      ticket_id: ticketId,
      commission_level: 1,
      commission_rate: COMMISSION_RATES.level1,
      commission_amount: commissions.level1,
      status: 'pending',
    })
  }

  // Level 2 - Parent of referrer
  if (hierarchy.level2) {
    commissionsToCreate.push({
      affiliate_id: hierarchy.level2,
      ticket_id: ticketId,
      commission_level: 2,
      commission_rate: COMMISSION_RATES.level2,
      commission_amount: commissions.level2,
      status: 'pending',
    })
  }

  // Level 3 - Grandparent of referrer
  if (hierarchy.level3) {
    commissionsToCreate.push({
      affiliate_id: hierarchy.level3,
      ticket_id: ticketId,
      commission_level: 3,
      commission_rate: COMMISSION_RATES.level3,
      commission_amount: commissions.level3,
      status: 'pending',
    })
  }

  // Insert all commissions
  const { data, error } = await supabase
    .from('affiliate_commissions')
    .insert(commissionsToCreate)
    .select()

  if (error) {
    console.error('Error creating affiliate commissions:', error)
    return { success: false, error: error.message }
  }

  return { success: true, commissions: data }
}

/**
 * Generate a unique referral code
 */
export function generateReferralCode(name: string): string {
  // Take first 4 characters of name (uppercase) and add 4 random characters
  const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X')
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${suffix}`
}

/**
 * Get affiliate by referral code
 */
export async function getAffiliateByReferralCode(referralCode: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('affiliates')
    .select('*, profile:profiles(*)')
    .eq('referral_code', referralCode)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Register a new affiliate with optional parent
 */
export async function registerAffiliate(
  userId: string,
  parentReferralCode?: string
) {
  const supabase = await createClient()

  let parentAffiliateId: string | null = null
  let grandparentAffiliateId: string | null = null
  let level = 1

  // If parent referral code is provided, get the parent affiliate
  if (parentReferralCode) {
    const parent = await getAffiliateByReferralCode(parentReferralCode)
    if (parent) {
      parentAffiliateId = parent.id
      grandparentAffiliateId = parent.parent_affiliate_id
      level = Math.min(parent.level + 1, 3)
    }
  }

  // Get user's name for referral code generation
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', userId)
    .single()

  const referralCode = generateReferralCode(profile?.full_name || 'USER')

  // Create affiliate record
  const { data, error } = await supabase
    .from('affiliates')
    .insert({
      id: userId,
      referral_code: referralCode,
      parent_affiliate_id: parentAffiliateId,
      grandparent_affiliate_id: grandparentAffiliateId,
      level,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error registering affiliate:', error)
    return { success: false, error: error.message }
  }

  // Update user type to affiliate
  await supabase
    .from('profiles')
    .update({ user_type: 'affiliate' })
    .eq('id', userId)

  return { success: true, affiliate: data }
}

/**
 * Get affiliate statistics
 */
export async function getAffiliateStats(affiliateId: string) {
  const supabase = await createClient()

  // Get total referrals
  const { count: totalReferrals } = await supabase
    .from('tickets')
    .select('id', { count: 'exact', head: true })
    .eq('affiliate_id', affiliateId)

  // Get total earnings
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('commission_amount, status')
    .eq('affiliate_id', affiliateId)

  const totalEarnings = commissions?.reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0
  const pendingEarnings = commissions?.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0
  const paidEarnings = commissions?.filter(c => c.status === 'paid').reduce((sum, c) => sum + parseFloat(c.commission_amount.toString()), 0) || 0

  return {
    totalReferrals: totalReferrals || 0,
    totalEarnings,
    pendingEarnings,
    paidEarnings,
  }
}

/**
 * Pay out pending commissions to an affiliate
 */
export async function payoutAffiliateCommissions(affiliateId: string) {
  const supabase = await createClient()

  // Get all pending commissions
  const { data: pendingCommissions } = await supabase
    .from('affiliate_commissions')
    .select('*')
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')

  if (!pendingCommissions || pendingCommissions.length === 0) {
    return { success: false, error: 'No pending commissions' }
  }

  const totalAmount = pendingCommissions.reduce(
    (sum, c) => sum + parseFloat(c.commission_amount.toString()),
    0
  )

  // Get affiliate's Stripe account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_account_id')
    .eq('id', affiliateId)
    .single()

  if (!profile?.stripe_account_id) {
    return { success: false, error: 'Affiliate has no Stripe account' }
  }

  // TODO: Process Stripe transfer
  // const transfer = await payAffiliateCommission(profile.stripe_account_id, totalAmount * 100, affiliateId)

  // Mark commissions as paid
  const { error } = await supabase
    .from('affiliate_commissions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('affiliate_id', affiliateId)
    .eq('status', 'pending')

  if (error) {
    return { success: false, error: error.message }
  }

  // Update affiliate's total earnings
  await supabase
    .from('affiliates')
    .update({ total_earnings: totalAmount })
    .eq('id', affiliateId)

  return { success: true, amount: totalAmount }
}
