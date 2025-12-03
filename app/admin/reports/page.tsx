'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { FileText, Download } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import StatusBadge from '@/components/ui/StatusBadge'

export default function ReportsPage() {
  const { token } = useAuth()
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  })
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)

      const response = await fetch(`/api/reports/shipments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!reportData?.shipments) return

    const headers = ['Tracking Number', 'Status', 'Sender', 'Receiver', 'Origin', 'Destination', 'Cost', 'Date']
    const rows = reportData.shipments.map((s: any) => [
      s.trackingNumber,
      s.status,
      `${s.sender?.firstName} ${s.sender?.lastName}`,
      s.receiverName,
      `${s.senderCity}, ${s.senderState}`,
      `${s.receiverCity}, ${s.receiverState}`,
      s.actualCost || s.estimatedCost || 0,
      new Date(s.createdAt).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shipments-report-${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export shipment reports</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Filters */}
          <Card className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Report Filters</h2>
            <div className="space-y-4">
              <Input
                label="Start Date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
              <Input
                label="End Date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
              <Button onClick={generateReport} className="w-full" loading={loading}>
                <FileText className="h-5 w-5 mr-2" />
                Generate Report
              </Button>
              {reportData && (
                <Button variant="secondary" onClick={exportToCSV} className="w-full">
                  <Download className="h-5 w-5 mr-2" />
                  Export to CSV
                </Button>
              )}
            </div>
          </Card>

          {/* Report Results */}
          <div className="md:col-span-2 space-y-6">
            {reportData && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Shipments</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {reportData.statistics.totalShipments}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-primary-600 mt-2">
                        {formatCurrency(reportData.statistics.totalRevenue)}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Status Breakdown */}
                <Card title="Status Breakdown">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {reportData.statistics.statusCounts.map((item: any) => (
                      <div key={item.status} className="text-center p-4 bg-gray-50 rounded-lg">
                        <StatusBadge status={item.status} />
                        <p className="text-2xl font-bold mt-2">{item._count}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Shipments Table */}
                <Card title="Shipments">
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
                            Route
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Cost
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.shipments.slice(0, 20).map((shipment: any) => (
                          <tr key={shipment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {shipment.trackingNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={shipment.status} />
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {shipment.senderCity}, {shipment.senderState} →{' '}
                              {shipment.receiverCity}, {shipment.receiverState}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatCurrency(shipment.actualCost || shipment.estimatedCost || 0)}
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
              </>
            )}

            {!reportData && !loading && (
              <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Report Generated
                  </h3>
                  <p className="text-gray-600">
                    Select a date range and click "Generate Report" to view statistics
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
