'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Package, Bell, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  const navLinks = {
    CUSTOMER: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/shipments/new', label: 'New Shipment' },
      { href: '/shipments', label: 'My Shipments' },
      { href: '/pickup', label: 'Schedule Pickup' },
      { href: '/pricing', label: 'Pricing Calculator' },
    ],
    ADMIN: [
      { href: '/admin', label: 'Dashboard' },
      { href: '/admin/shipments', label: 'All Shipments' },
      { href: '/admin/staff', label: 'Staff' },
      { href: '/admin/reports', label: 'Reports' },
      { href: '/admin/settings', label: 'Settings' },
    ],
    WAREHOUSE: [
      { href: '/staff', label: 'Dashboard' },
      { href: '/staff/shipments', label: 'Shipments' },
      { href: '/staff/pickup', label: 'Pickups' },
    ],
    DRIVER: [
      { href: '/staff', label: 'Dashboard' },
      { href: '/staff/deliveries', label: 'Deliveries' },
    ],
  }

  const links = navLinks[user.role as keyof typeof navLinks] || []

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">ConsignPro</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/notifications" className="text-gray-600 hover:text-gray-900">
              <Bell className="h-6 w-6" />
            </Link>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user.firstName} {user.lastName}
              </span>
              <Button variant="ghost" onClick={logout} size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="sm:hidden text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
              className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
