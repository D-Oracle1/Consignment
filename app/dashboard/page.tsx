'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import StatsCard from '@/components/dashboard/StatsCard'
import { Package, TruckIcon, CheckCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDateTime } from '@/lib/utils'

export default function DashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    } else if (user && token) {
      fetchDashboardData()
    }
  }, [user, token, authLoading])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, shipmentsRes] = await Promise.all([
        fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/shipments?limit=5', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (shipmentsRes.ok) {
        const shipmentsData = await shipmentsRes.json()
        setRecentShipments(shipmentsData.shipments)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's an overview of your shipments
          </p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Total Shipments"
              value={stats.totalShipments || 0}
              icon={Package}
            />
            <StatsCard
              title="In Transit"
              value={stats.inTransit || 0}
              icon={TruckIcon}
            />
            <StatsCard
              title="Delivered"
              value={stats.delivered || 0}
              icon={CheckCircle}
            />
          </div>
        )}

        {/* Recent Shipments */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Shipments</h2>
            <Link href="/shipments" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

          {recentShipments.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first shipment</p>
              <Link href="/shipments/new" className="btn-primary inline-block">
                Create Shipment
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destination
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentShipments.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.receiverCity}, {shipment.receiverState}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(shipment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/track/${shipment.trackingNumber}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Track
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Link href="/shipments/new" className="card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">New Shipment</h3>
              <p className="text-sm text-gray-600">Create a new shipment request</p>
            </div>
          </Link>

          <Link href="/pickup" className="card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Schedule Pickup</h3>
              <p className="text-sm text-gray-600">Request a package pickup</p>
            </div>
          </Link>

          <Link href="/pricing" className="card hover:shadow-lg transition-shadow">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Calculate Price</h3>
              <p className="text-sm text-gray-600">Estimate shipping costs</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
