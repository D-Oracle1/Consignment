'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { TruckIcon } from 'lucide-react'

export default function PickupRequestPage() {
  const { token } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupCity: '',
    pickupState: '',
    pickupZip: '',
    pickupCountry: 'USA',
    preferredDate: '',
    preferredTime: '',
    packageCount: '1',
    notes: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/pickup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          packageCount: parseInt(formData.packageCount),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create pickup request')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create pickup request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Pickup</h1>
          <p className="text-gray-600 mt-1">Request a pickup for your packages</p>
        </div>

        {success ? (
          <Card className="bg-green-50 border-2 border-green-200">
            <div className="text-center py-8">
              <TruckIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pickup Request Submitted!
              </h2>
              <p className="text-gray-600">
                We'll contact you shortly to confirm your pickup schedule.
              </p>
            </div>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-4">Pickup Location</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Address"
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Input
                    label="City"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="State"
                    name="pickupState"
                    value={formData.pickupState}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    name="pickupZip"
                    value={formData.pickupZip}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Country"
                    name="pickupCountry"
                    value={formData.pickupCountry}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Pickup Schedule</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Preferred Date"
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <Input
                    label="Preferred Time"
                    type="time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Number of Packages"
                    type="number"
                    name="packageCount"
                    min="1"
                    value={formData.packageCount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Special Instructions (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Any special instructions for the pickup..."
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" loading={loading}>
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Submit Pickup Request
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
          </Card>
        )}
      </main>
    </div>
  )
}
