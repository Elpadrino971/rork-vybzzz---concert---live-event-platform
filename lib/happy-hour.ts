import { HAPPY_HOUR_CONFIG } from '@/types/database'

/**
 * Check if the current time is during Happy Hour
 * Happy Hour: Mercredi (Wednesday) à 20h (8pm)
 */
export function isHappyHour(date: Date = new Date()): boolean {
  const day = date.getDay() // 0 = Sunday, 3 = Wednesday
  const hours = date.getHours()
  const minutes = date.getMinutes()

  // Check if it's Wednesday
  if (day !== HAPPY_HOUR_CONFIG.day) {
    return false
  }

  // Parse the start time
  const [startHour, startMinute] = HAPPY_HOUR_CONFIG.startTime.split(':').map(Number)

  // Check if current time is at or after start time
  // Happy Hour lasts for 1 hour
  const currentMinutes = hours * 60 + minutes
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = startMinutes + 60 // 1 hour duration

  return currentMinutes >= startMinutes && currentMinutes < endMinutes
}

/**
 * Get the appropriate ticket price based on Happy Hour status
 */
export function getTicketPrice(regularPrice: number, happyHourPrice?: number): {
  price: number
  isHappyHour: boolean
} {
  const isHappy = isHappyHour()

  if (isHappy && happyHourPrice) {
    return {
      price: happyHourPrice,
      isHappyHour: true,
    }
  }

  return {
    price: regularPrice,
    isHappyHour: false,
  }
}

/**
 * Get the next Happy Hour date and time
 */
export function getNextHappyHour(): Date {
  const now = new Date()
  const currentDay = now.getDay()
  const targetDay = HAPPY_HOUR_CONFIG.day // Wednesday = 3

  // Calculate days until next Wednesday
  let daysUntilWednesday = targetDay - currentDay
  if (daysUntilWednesday <= 0) {
    daysUntilWednesday += 7
  }

  // Create next Happy Hour date
  const nextHappyHour = new Date(now)
  nextHappyHour.setDate(now.getDate() + daysUntilWednesday)

  const [hours, minutes] = HAPPY_HOUR_CONFIG.startTime.split(':').map(Number)
  nextHappyHour.setHours(hours, minutes, 0, 0)

  // If it's already Wednesday but past Happy Hour time, get next week's Wednesday
  if (currentDay === targetDay) {
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const happyHourTime = hours * 60 + minutes + 60 // End time

    if (currentTime >= happyHourTime) {
      nextHappyHour.setDate(nextHappyHour.getDate() + 7)
    }
  }

  return nextHappyHour
}

/**
 * Format Happy Hour time for display
 */
export function formatHappyHourTime(): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const dayName = days[HAPPY_HOUR_CONFIG.day]

  return `${dayName} à ${HAPPY_HOUR_CONFIG.startTime}`
}

/**
 * Calculate savings during Happy Hour
 */
export function calculateHappyHourSavings(regularPrice: number, happyHourPrice: number): {
  savings: number
  percentOff: number
} {
  const savings = regularPrice - happyHourPrice
  const percentOff = Math.round((savings / regularPrice) * 100)

  return {
    savings,
    percentOff,
  }
}
