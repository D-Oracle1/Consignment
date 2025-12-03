'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Package, MapPin, Clock, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export default function TrackingPage() {
  const params = useParams()
  const trackingNumber = params?.trackingNumber as string
  const [shipment, setShipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (trackingNumber) {
      fetchTracking()
    }
  }, [trackingNumber])

  const fetchTracking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tracking/${trackingNumber}`)

      if (!response.ok) {
        throw new Error('Shipment not found')
      }

      const data = await response.json()
      setShipment(data.shipment)
    } catch (err: any) {
      setError(err.message || 'Failed to load tracking information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <div className="text-center py-8">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Shipment Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                {error || 'We couldn\'t find a shipment with that tracking number.'}
              </p>
              <Link href="/" className="btn-primary inline-block">
                Try Another Tracking Number
              </Link>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Shipment
          </h1>
          <p className="text-gray-600">Tracking Number: {shipment.trackingNumber}</p>
        </div>

        {/* Status Overview */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold">Current Status</h2>
                <StatusBadge status={shipment.status} />
              </div>
              <p className="text-gray-600">
                {shipment.status === 'DELIVERED'
                  ? `Delivered on ${formatDateTime(shipment.actualDelivery)}`
                  : shipment.estimatedDelivery
                  ? `Estimated delivery: ${formatDateTime(shipment.estimatedDelivery)}`
                  : 'Delivery date to be determined'}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-600">From</p>
              <p className="font-semibold">
                {shipment.senderCity}, {shipment.senderState}
              </p>
              <p className="text-sm text-gray-600 mt-2">To</p>
              <p className="font-semibold">
                {shipment.receiverCity}, {shipment.receiverState}
              </p>
            </div>
          </div>
        </Card>

        {/* Package Details */}
        <Card className="mb-6" title="Package Details">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="font-semibold">{shipment.weight} kg</p>
            </div>
            {shipment.category && (
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold">{shipment.category}</p>
              </div>
            )}
            {shipment.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Description</p>
                <p className="font-semibold">{shipment.description}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Tracking History */}
        <Card title="Tracking History">
          <div className="space-y-4">
            {shipment.events.map((event: any, index: number) => (
              <div key={event.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-2 ${
                      index === 0
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {event.status === 'DELIVERED' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  {index < shipment.events.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 my-1 flex-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={event.status} />
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                  {event.location && (
                    <p className="text-sm text-gray-600 mb-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {event.location}
                    </p>
                  )}
                  {event.notes && (
                    <p className="text-sm text-gray-700">{event.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="text-center mt-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Track Another Shipment
          </Link>
        </div>
      </div>
    </div>
  )
}
