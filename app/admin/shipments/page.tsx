'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function AdminShipmentsPage() {
  const { token } = useAuth()
  const [shipments, setShipments] = useState<any[]>([])
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [updateData, setUpdateData] = useState({
    status: '',
    location: '',
    notes: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchShipments()
    }
  }, [token])

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments?limit=100', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setShipments(data.shipments)
      }
    } catch (error) {
      console.error('Failed to fetch shipments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedShipment) return

    try {
      const response = await fetch(`/api/shipments/${selectedShipment.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        setShowUpdateModal(false)
        fetchShipments()
        setUpdateData({ status: '', location: '', notes: '' })
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const openUpdateModal = (shipment: any) => {
    setSelectedShipment(shipment)
    setUpdateData({
      status: shipment.status,
      location: '',
      notes: '',
    })
    setShowUpdateModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Shipments</h1>
          <p className="text-gray-600 mt-1">Manage and track all shipments</p>
        </div>

        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tracking #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Sender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/track/${shipment.trackingNumber}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          {shipment.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {shipment.sender?.firstName} {shipment.sender?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {shipment.senderCity}, {shipment.senderState} →{' '}
                        {shipment.receiverCity}, {shipment.receiverState}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(shipment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openUpdateModal(shipment)}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          Update
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Update Modal */}
        {showUpdateModal && selectedShipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4">
                Update Shipment Status
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="input"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="RECEIVED">Received</option>
                    <option value="IN_TRANSIT">In Transit</option>
                    <option value="SORTING_FACILITY">Sorting Facility</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="RETURNED">Returned</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={updateData.location}
                    onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
                    className="input"
                    placeholder="e.g., Chicago, IL"
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateStatus} className="flex-1">
                    Update Status
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
