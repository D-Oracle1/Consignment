'use client'

import { useState } from 'react'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Calculator, Package } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function PricingCalculatorPage() {
  const [formData, setFormData] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
    originZip: '',
    destinationZip: '',
    isExpress: false,
    category: '',
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(formData.weight),
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          originZip: formData.originZip,
          destinationZip: formData.destinationZip,
          isExpress: formData.isExpress,
          category: formData.category || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to calculate pricing')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to calculate price')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pricing Calculator</h1>
          <p className="text-gray-600 mt-1">
            Get an instant estimate for your shipment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Package Information</h3>

                <div className="space-y-4">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    name="weight"
                    step="0.1"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      label="Length (cm)"
                      type="number"
                      name="length"
                      step="0.1"
                      value={formData.length}
                      onChange={handleChange}
                    />
                    <Input
                      label="Width (cm)"
                      type="number"
                      name="width"
                      step="0.1"
                      value={formData.width}
                      onChange={handleChange}
                    />
                    <Input
                      label="Height (cm)"
                      type="number"
                      name="height"
                      step="0.1"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </div>

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
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Route</h3>

                <div className="space-y-4">
                  <Input
                    label="Origin ZIP Code"
                    type="text"
                    name="originZip"
                    value={formData.originZip}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Destination ZIP Code"
                    type="text"
                    name="destinationZip"
                    value={formData.destinationZip}
                    onChange={handleChange}
                    required
                  />

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isExpress"
                      name="isExpress"
                      checked={formData.isExpress}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isExpress" className="ml-2 block text-sm text-gray-900">
                      Express Delivery
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                <Calculator className="h-5 w-5 mr-2" />
                Calculate Price
              </Button>
            </form>
          </Card>

          {/* Result */}
          <div>
            {result ? (
              <Card className="bg-primary-50 border-2 border-primary-200">
                <div className="text-center">
                  <Package className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Estimated Cost
                  </h2>
                  <div className="text-5xl font-bold text-primary-600 mb-4">
                    {formatCurrency(result.cost)}
                  </div>
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(result.estimatedDelivery)}
                    </p>
                  </div>
                  {formData.isExpress && (
                    <div className="bg-primary-100 text-primary-800 px-4 py-2 rounded-lg text-sm font-medium">
                      ⚡ Express Delivery Included
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Calculate Your Shipping Cost
                  </h3>
                  <p className="text-gray-600">
                    Fill in the form to get an instant price estimate
                  </p>
                </div>
              </Card>
            )}

            {/* Pricing Info */}
            <Card className="mt-6">
              <h3 className="font-semibold mb-3">Pricing Information</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Base rate starts at $5.00</li>
                <li>✓ Weight-based pricing: $2.00 per kg</li>
                <li>✓ Volume-based pricing for larger packages</li>
                <li>✓ Distance calculated from ZIP codes</li>
                <li>✓ Express delivery adds $15.00</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
