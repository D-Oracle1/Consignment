import nodemailer from 'nodemailer'
import { prisma } from '@/lib/db/prisma'
import { NotificationEvent, NotificationType } from '@prisma/client'

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER?.split('://')[1]?.split(':')[0] || 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
})

interface NotificationData {
  userId: string
  event: NotificationEvent
  type: NotificationType
  data: Record<string, any>
}

export async function sendNotification({ userId, event, type, data }: NotificationData) {
  try {
    // Get notification template
    const template = await prisma.notificationTemplate.findUnique({
      where: { event },
    })

    if (!template || !template.isActive) {
      console.log(`No active template found for event: ${event}`)
      return
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      console.error('User not found')
      return
    }

    // Replace template variables
    const replaceVariables = (text: string) => {
      let result = text
      Object.keys(data).forEach((key) => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key])
      })
      result = result.replace(/{{customerName}}/g, `${user.firstName} ${user.lastName}`)
      return result
    }

    let emailSent = false
    let smsSent = false

    // Send email
    if ((type === NotificationType.EMAIL || type === NotificationType.BOTH) && template.emailBody) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: replaceVariables(template.emailSubject || ''),
          text: replaceVariables(template.emailBody),
        })
        emailSent = true
        console.log(`Email sent to ${user.email}`)
      } catch (error) {
        console.error('Email sending failed:', error)
      }
    }

    // Send SMS (placeholder - integrate with Twilio or similar)
    if ((type === NotificationType.SMS || type === NotificationType.BOTH) && template.smsBody && user.phone) {
      try {
        // This is a placeholder. Integrate with actual SMS service like Twilio
        console.log(`SMS would be sent to ${user.phone}: ${replaceVariables(template.smsBody)}`)
        smsSent = true
      } catch (error) {
        console.error('SMS sending failed:', error)
      }
    }

    // Create notification record
    await prisma.notification.create({
      data: {
        userId,
        type,
        event,
        title: replaceVariables(template.emailSubject || event),
        message: replaceVariables(template.emailBody || template.smsBody || ''),
        emailSent,
        smsSent,
        metadata: data,
      },
    })

    return { success: true, emailSent, smsSent }
  } catch (error) {
    console.error('Notification error:', error)
    return { success: false, error }
  }
}

export async function sendShipmentNotification(
  shipmentId: string,
  event: NotificationEvent,
  receiverNotify = false
) {
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: {
      sender: true,
      receiver: true,
    },
  })

  if (!shipment) return

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${shipment.trackingNumber}`

  const data = {
    trackingNumber: shipment.trackingNumber,
    trackingUrl,
    destination: `${shipment.receiverCity}, ${shipment.receiverState}`,
    estimatedDelivery: shipment.estimatedDelivery?.toLocaleDateString() || 'TBD',
  }

  // Notify sender
  await sendNotification({
    userId: shipment.senderId,
    event,
    type: NotificationType.BOTH,
    data,
  })

  // Notify receiver if applicable and if they're a registered user
  if (receiverNotify && shipment.receiverId) {
    await sendNotification({
      userId: shipment.receiverId,
      event,
      type: NotificationType.BOTH,
      data,
    })
  }
}
