import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
})

// Shipment schemas
export const createShipmentSchema = z.object({
  // Sender info (will be auto-filled from logged in user, but can override address)
  senderAddress: z.string().min(5, 'Address is required'),
  senderCity: z.string().min(2, 'City is required'),
  senderState: z.string().min(2, 'State is required'),
  senderZip: z.string().min(5, 'ZIP code is required'),
  senderCountry: z.string().default('USA'),

  // Receiver info
  receiverName: z.string().min(2, 'Receiver name is required'),
  receiverEmail: z.string().email('Invalid email').optional(),
  receiverPhone: z.string().min(10, 'Phone number is required'),
  receiverAddress: z.string().min(5, 'Address is required'),
  receiverCity: z.string().min(2, 'City is required'),
  receiverState: z.string().min(2, 'State is required'),
  receiverZip: z.string().min(5, 'ZIP code is required'),
  receiverCountry: z.string().default('USA'),

  // Package details
  weight: z.number().positive('Weight must be positive'),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
})

export const trackingSchema = z.object({
  trackingNumber: z.string().min(5, 'Invalid tracking number'),
})

// Pickup schemas
export const createPickupSchema = z.object({
  pickupAddress: z.string().min(5, 'Address is required'),
  pickupCity: z.string().min(2, 'City is required'),
  pickupState: z.string().min(2, 'State is required'),
  pickupZip: z.string().min(5, 'ZIP code is required'),
  pickupCountry: z.string().default('USA'),
  preferredDate: z.string().or(z.date()),
  preferredTime: z.string(),
  packageCount: z.number().int().positive().default(1),
  notes: z.string().optional(),
})

// Pricing calculator schema
export const pricingCalculatorSchema = z.object({
  weight: z.number().positive('Weight must be positive'),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  originZip: z.string().min(5, 'Origin ZIP is required'),
  destinationZip: z.string().min(5, 'Destination ZIP is required'),
  isExpress: z.boolean().default(false),
  category: z.string().optional(),
})

// Update shipment status schema
export const updateShipmentStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'RECEIVED',
    'IN_TRANSIT',
    'SORTING_FACILITY',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'RETURNED',
    'FAILED',
    'CANCELLED',
  ]),
  location: z.string().optional(),
  notes: z.string().optional(),
})

// Settings schema
export const updateSettingsSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string().optional(),
  description: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateShipmentInput = z.infer<typeof createShipmentSchema>
export type TrackingInput = z.infer<typeof trackingSchema>
export type CreatePickupInput = z.infer<typeof createPickupSchema>
export type PricingCalculatorInput = z.infer<typeof pricingCalculatorSchema>
export type UpdateShipmentStatusInput = z.infer<typeof updateShipmentStatusSchema>
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>
