'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Package } from 'lucide-react'

export default function NewShipmentPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Sender
    senderAddress: '',
    senderCity: '',
    senderState: '',
    senderZip: '',
    senderCountry: 'USA',

    // Receiver
    receiverName: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverCity: '',
    receiverState: '',
    receiverZip: '',
    receiverCountry: 'USA',

    // Package
    weight: '',
    length: '',
    width: '',
    height: '',
    category: '',
    description: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          weight: parseFloat(formData.weight),
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create shipment')
      }

      const data = await response.json()
      router.push(`/track/${data.shipment.trackingNumber}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Shipment</h1>
          <p className="text-gray-600 mt-1">Fill in the details to create a new shipment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Sender Information */}
          <Card title="Sender Information">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="City"
                name="senderCity"
                value={formData.senderCity}
                onChange={handleChange}
                required
              />
              <Input
                label="State"
                name="senderState"
                value={formData.senderState}
                onChange={handleChange}
                required
              />
              <Input
                label="ZIP Code"
                name="senderZip"
                value={formData.senderZip}
                onChange={handleChange}
                required
              />
              <Input
                label="Country"
                name="senderCountry"
                value={formData.senderCountry}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* Receiver Information */}
          <Card title="Receiver Information">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleChange}
                required
              />
              <div className="md:col-span-2">
                <Input
                  label="Email (Optional)"
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <Input
                  label="Address"
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  required
                />
              </div>
              <Input
                label="City"
                name="receiverCity"
                value={formData.receiverCity}
                onChange={handleChange}
                required
              />
              <Input
                label="State"
                name="receiverState"
                value={formData.receiverState}
                onChange={handleChange}
                required
              />
              <Input
                label="ZIP Code"
                name="receiverZip"
                value={formData.receiverZip}
                onChange={handleChange}
                required
              />
              <Input
                label="Country"
                name="receiverCountry"
                value={formData.receiverCountry}
                onChange={handleChange}
                required
              />
            </div>
          </Card>

          {/* Package Details */}
          <Card title="Package Details">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Weight (kg)"
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select category</option>
                  <option value="Documents">Documents</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="Length (cm, optional)"
                type="number"
                step="0.1"
                name="length"
                value={formData.length}
                onChange={handleChange}
              />
              <Input
                label="Width (cm, optional)"
                type="number"
                step="0.1"
                name="width"
                value={formData.width}
                onChange={handleChange}
              />
              <Input
                label="Height (cm, optional)"
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={handleChange}
              />
              <div className="md:col-span-2">
                <label className="label">Description (Optional)</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input"
                />
              </div>
            </div>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1" loading={loading}>
              <Package className="h-5 w-5 mr-2" />
              Create Shipment
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
