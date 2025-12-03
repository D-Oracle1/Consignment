import { PrismaClient, UserRole, ShipmentStatus, NotificationEvent } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@consignpro.com' },
    update: {},
    create: {
      email: 'admin@consignpro.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      role: UserRole.ADMIN,
    },
  })

  const warehouse = await prisma.user.upsert({
    where: { email: 'warehouse@consignpro.com' },
    update: {},
    create: {
      email: 'warehouse@consignpro.com',
      password: hashedPassword,
      firstName: 'Warehouse',
      lastName: 'Staff',
      phone: '+1234567891',
      role: UserRole.WAREHOUSE,
    },
  })

  const driver = await prisma.user.upsert({
    where: { email: 'driver@consignpro.com' },
    update: {},
    create: {
      email: 'driver@consignpro.com',
      password: hashedPassword,
      firstName: 'Delivery',
      lastName: 'Driver',
      phone: '+1234567892',
      role: UserRole.DRIVER,
    },
  })

  const customer1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567893',
      role: UserRole.CUSTOMER,
    },
  })

  const customer2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phone: '+1234567894',
      role: UserRole.CUSTOMER,
    },
  })

  console.log('Users created')

  // Create pricing rules
  const standardRule = await prisma.pricingRule.upsert({
    where: { id: 'standard-rule' },
    update: {},
    create: {
      id: 'standard-rule',
      name: 'Standard Shipping',
      description: 'Standard shipping rates based on weight and volume',
      baseRate: 5.0,
      weightMultiplier: 2.0,
      volumeMultiplier: 0.5,
      zoneMultiplier: 1.0,
      isActive: true,
      priority: 1,
    },
  })

  const expressRule = await prisma.pricingRule.upsert({
    where: { id: 'express-rule' },
    update: {},
    create: {
      id: 'express-rule',
      name: 'Express Shipping',
      description: 'Express/priority shipping with faster delivery',
      baseRate: 10.0,
      weightMultiplier: 3.0,
      volumeMultiplier: 0.8,
      zoneMultiplier: 1.5,
      isExpress: true,
      expressRate: 15.0,
      isActive: true,
      priority: 2,
    },
  })

  console.log('Pricing rules created')

  // Create notification templates
  const templates = [
    {
      event: NotificationEvent.PACKAGE_RECEIVED,
      emailSubject: 'Package Received - {{trackingNumber}}',
      emailBody: 'Dear {{customerName}},\n\nYour package with tracking number {{trackingNumber}} has been received at our facility.\n\nThank you for choosing ConsignPro!',
      smsBody: 'Your package {{trackingNumber}} has been received. Track it at {{trackingUrl}}',
    },
    {
      event: NotificationEvent.IN_TRANSIT,
      emailSubject: 'Package In Transit - {{trackingNumber}}',
      emailBody: 'Dear {{customerName}},\n\nYour package {{trackingNumber}} is now in transit to {{destination}}.\n\nEstimated delivery: {{estimatedDelivery}}',
      smsBody: 'Your package {{trackingNumber}} is in transit. Expected delivery: {{estimatedDelivery}}',
    },
    {
      event: NotificationEvent.OUT_FOR_DELIVERY,
      emailSubject: 'Out for Delivery - {{trackingNumber}}',
      emailBody: 'Dear {{customerName}},\n\nYour package {{trackingNumber}} is out for delivery today!\n\nPlease ensure someone is available to receive it.',
      smsBody: 'Your package {{trackingNumber}} is out for delivery today!',
    },
    {
      event: NotificationEvent.DELIVERED,
      emailSubject: 'Package Delivered - {{trackingNumber}}',
      emailBody: 'Dear {{customerName}},\n\nYour package {{trackingNumber}} has been successfully delivered.\n\nThank you for using ConsignPro!',
      smsBody: 'Your package {{trackingNumber}} has been delivered. Thank you!',
    },
  ]

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { event: template.event },
      update: template,
      create: template,
    })
  }

  console.log('Notification templates created')

  // Create sample shipments
  const shipment1 = await prisma.shipment.create({
    data: {
      trackingNumber: 'CP' + Date.now() + '001',
      senderId: customer1.id,
      senderAddress: '123 Main St',
      senderCity: 'New York',
      senderState: 'NY',
      senderZip: '10001',
      receiverName: 'Jane Smith',
      receiverEmail: customer2.email,
      receiverPhone: customer2.phone!,
      receiverAddress: '456 Oak Ave',
      receiverCity: 'Los Angeles',
      receiverState: 'CA',
      receiverZip: '90001',
      weight: 2.5,
      length: 30,
      width: 20,
      height: 15,
      category: 'Electronics',
      description: 'Laptop computer',
      estimatedCost: 45.50,
      actualCost: 45.50,
      isPaid: true,
      status: ShipmentStatus.IN_TRANSIT,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      events: {
        create: [
          {
            status: ShipmentStatus.PENDING,
            location: 'New York, NY',
            notes: 'Package registered',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.RECEIVED,
            location: 'New York Facility',
            notes: 'Package received at origin facility',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.IN_TRANSIT,
            location: 'Chicago, IL',
            notes: 'In transit to destination',
            createdAt: new Date(),
          },
        ],
      },
    },
  })

  const shipment2 = await prisma.shipment.create({
    data: {
      trackingNumber: 'CP' + Date.now() + '002',
      senderId: customer2.id,
      senderAddress: '456 Oak Ave',
      senderCity: 'Los Angeles',
      senderState: 'CA',
      senderZip: '90001',
      receiverName: 'John Doe',
      receiverEmail: customer1.email,
      receiverPhone: customer1.phone!,
      receiverAddress: '123 Main St',
      receiverCity: 'New York',
      receiverState: 'NY',
      receiverZip: '10001',
      weight: 1.2,
      length: 25,
      width: 15,
      height: 10,
      category: 'Documents',
      description: 'Business documents',
      estimatedCost: 25.00,
      actualCost: 25.00,
      isPaid: true,
      status: ShipmentStatus.DELIVERED,
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      actualDelivery: new Date(),
      events: {
        create: [
          {
            status: ShipmentStatus.PENDING,
            location: 'Los Angeles, CA',
            notes: 'Package registered',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.RECEIVED,
            location: 'Los Angeles Facility',
            notes: 'Package received',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.IN_TRANSIT,
            location: 'Phoenix, AZ',
            notes: 'In transit',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.OUT_FOR_DELIVERY,
            location: 'New York, NY',
            notes: 'Out for delivery',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            status: ShipmentStatus.DELIVERED,
            location: 'New York, NY',
            notes: 'Successfully delivered',
            createdAt: new Date(),
          },
        ],
      },
    },
  })

  console.log('Sample shipments created')

  // Create settings
  const settings = [
    { key: 'company_name', value: 'ConsignPro Logistics', category: 'branding' },
    { key: 'company_email', value: 'info@consignpro.com', category: 'branding' },
    { key: 'company_phone', value: '+1-800-CONSIGN', category: 'branding' },
    { key: 'company_address', value: '123 Business Ave, Suite 100', category: 'branding' },
    { key: 'support_email', value: 'support@consignpro.com', category: 'support' },
    { key: 'enable_sms', value: 'true', category: 'notifications' },
    { key: 'enable_email', value: 'true', category: 'notifications' },
  ]

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('Settings created')

  console.log('Seed completed successfully!')
  console.log('\n=== Test Accounts ===')
  console.log('Admin: admin@consignpro.com / password123')
  console.log('Warehouse: warehouse@consignpro.com / password123')
  console.log('Driver: driver@consignpro.com / password123')
  console.log('Customer 1: john.doe@example.com / password123')
  console.log('Customer 2: jane.smith@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
