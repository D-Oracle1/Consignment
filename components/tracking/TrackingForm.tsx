'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Search } from 'lucide-react'

export default function TrackingForm() {
  const [trackingNumber, setTrackingNumber] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingNumber.trim()) {
      router.push(`/track/${trackingNumber.trim()}`)
    }
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-4 text-center">Track Your Shipment</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Enter tracking number..."
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Track
        </Button>
      </form>
    </div>
  )
}
