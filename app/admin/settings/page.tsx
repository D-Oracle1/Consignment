'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navbar from '@/components/dashboard/Navbar'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const { token } = useAuth()
  const [settings, setSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (token) {
      fetchSettings()
    }
  }, [token])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (key: string, value: string, category?: string) => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value, category }),
      })

      if (response.ok) {
        fetchSettings()
      }
    } catch (error) {
      console.error('Failed to save setting:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your application settings</p>
        </div>

        <div className="space-y-6">
          {/* Branding */}
          <Card title="Branding">
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={settings.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                onBlur={(e) => handleSave('company_name', e.target.value, 'branding')}
              />
              <Input
                label="Company Email"
                type="email"
                value={settings.company_email || ''}
                onChange={(e) => handleChange('company_email', e.target.value)}
                onBlur={(e) => handleSave('company_email', e.target.value, 'branding')}
              />
              <Input
                label="Company Phone"
                value={settings.company_phone || ''}
                onChange={(e) => handleChange('company_phone', e.target.value)}
                onBlur={(e) => handleSave('company_phone', e.target.value, 'branding')}
              />
              <Input
                label="Company Address"
                value={settings.company_address || ''}
                onChange={(e) => handleChange('company_address', e.target.value)}
                onBlur={(e) => handleSave('company_address', e.target.value, 'branding')}
              />
            </div>
          </Card>

          {/* Support */}
          <Card title="Support">
            <div className="space-y-4">
              <Input
                label="Support Email"
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => handleChange('support_email', e.target.value)}
                onBlur={(e) => handleSave('support_email', e.target.value, 'support')}
              />
            </div>
          </Card>

          {/* Notifications */}
          <Card title="Notifications">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Enable Email Notifications</label>
                  <p className="text-sm text-gray-600">Send email notifications to users</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_email === 'true'}
                  onChange={(e) => handleSave('enable_email', e.target.checked.toString(), 'notifications')}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Enable SMS Notifications</label>
                  <p className="text-sm text-gray-600">Send SMS notifications to users</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable_sms === 'true'}
                  onChange={(e) => handleSave('enable_sms', e.target.checked.toString(), 'notifications')}
                  className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </Card>

          {saving && (
            <div className="text-center text-sm text-gray-600">
              Saving settings...
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
