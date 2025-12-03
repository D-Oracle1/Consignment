import { prisma } from '@/lib/db/prisma'
import { calculateVolume } from './index'

interface PricingInput {
  weight: number // kg
  length?: number // cm
  width?: number // cm
  height?: number // cm
  originZip?: string
  destinationZip?: string
  isExpress?: boolean
  category?: string
}

export async function calculateShippingCost(input: PricingInput): Promise<number> {
  const {
    weight,
    length,
    width,
    height,
    originZip,
    destinationZip,
    isExpress = false,
    category,
  } = input

  // Get active pricing rules
  const rules = await prisma.pricingRule.findMany({
    where: {
      isActive: true,
      ...(isExpress ? { isExpress: true } : {}),
      ...(category ? { OR: [{ category }, { category: null }] } : {}),
    },
    orderBy: {
      priority: 'desc',
    },
  })

  if (rules.length === 0) {
    // Default pricing if no rules found
    return weight * 5
  }

  // Use the highest priority rule
  const rule = rules[0]

  let cost = rule.baseRate

  // Weight-based pricing
  cost += weight * rule.weightMultiplier

  // Volume-based pricing
  if (length && width && height) {
    const volume = calculateVolume(length, width, height)
    cost += volume * rule.volumeMultiplier
  }

  // Zone-based pricing (simplified - in production, use actual zone calculation)
  if (originZip && destinationZip) {
    const distance = calculateDistance(originZip, destinationZip)
    cost *= 1 + (distance / 1000) * 0.1 // Increase by 10% per 1000 miles
  }

  // Express pricing
  if (isExpress && rule.expressRate) {
    cost += rule.expressRate
  }

  // Category-based pricing
  if (category && rule.category === category && rule.categoryRate) {
    cost += rule.categoryRate
  }

  // Apply zone multiplier
  cost *= rule.zoneMultiplier

  // Round to 2 decimal places
  return Math.round(cost * 100) / 100
}

// Simplified distance calculation (in production, use actual geolocation/mapping API)
function calculateDistance(zip1: string, zip2: string): number {
  // This is a placeholder. In production, integrate with a geolocation API
  // For now, we'll use a simple calculation based on zip code difference
  const num1 = parseInt(zip1.replace(/\D/g, ''))
  const num2 = parseInt(zip2.replace(/\D/g, ''))
  const diff = Math.abs(num1 - num2)

  // Rough estimate: larger zip difference = more distance
  // This is very simplified and should be replaced with actual geolocation
  return diff * 0.5 // Mock distance in miles
}

export async function getEstimatedDeliveryDate(
  originZip: string,
  destinationZip: string,
  isExpress: boolean = false
): Promise<Date> {
  const distance = calculateDistance(originZip, destinationZip)

  // Base delivery time
  let daysToDeliver = 3

  // Adjust based on distance (very simplified)
  if (distance > 500) daysToDeliver += 2
  if (distance > 1000) daysToDeliver += 2
  if (distance > 2000) daysToDeliver += 3

  // Express shipping
  if (isExpress) {
    daysToDeliver = Math.max(1, Math.floor(daysToDeliver / 2))
  }

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + daysToDeliver)

  return deliveryDate
}
