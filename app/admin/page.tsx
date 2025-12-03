'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import StatsCard from '@/components/dashboard/StatsCard'
import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { Package, TruckIcon, CheckCircle, DollarSign, Clock, Users } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const { user, token, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [recentShipments, setRecentShipments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard')
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
        fetch('/api/shipments?limit=10', {
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

  if (authLoading || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your logistics operations</p>
        </div>

        {/* Today's Stats */}
        {stats?.today && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Shipments Today"
                value={stats.today.shipments}
                icon={Package}
              />
              <StatsCard
                title="Delivered Today"
                value={stats.today.delivered}
                icon={CheckCircle}
              />
              <StatsCard
                title="Revenue Today"
                value={formatCurrency(stats.today.revenue)}
                icon={DollarSign}
              />
            </div>
          </>
        )}

        {/* This Month */}
        {stats?.month && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">This Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Shipments"
                value={stats.month.shipments}
                icon={Package}
              />
              <StatsCard
                title="Total Delivered"
                value={stats.month.delivered}
                icon={CheckCircle}
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats.month.revenue)}
                icon={DollarSign}
              />
            </div>
          </>
        )}

        {/* Current Status */}
        {stats?.current && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StatsCard
                title="Pending Shipments"
                value={stats.current.pending}
                icon={Clock}
              />
              <StatsCard
                title="In Transit"
                value={stats.current.inTransit}
                icon={TruckIcon}
              />
            </div>
          </>
        )}

        {/* Status Breakdown */}
        {stats?.statusBreakdown && (
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4">Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.statusBreakdown.map((item: any) => (
                <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <StatusBadge status={item.status} />
                  <p className="text-2xl font-bold mt-2">{item._count}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Shipments */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Shipments</h2>
            <Link href="/admin/shipments" className="text-primary-600 hover:text-primary-700 font-medium">
              View All →
            </Link>
          </div>

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
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentShipments.slice(0, 10).map((shipment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {shipment.receiverCity}, {shipment.receiverState}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(shipment.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}
