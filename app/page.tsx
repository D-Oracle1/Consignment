import Link from 'next/link'
import { Package, Search, TruckIcon, BarChart3 } from 'lucide-react'
import TrackingForm from '@/components/tracking/TrackingForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">ConsignPro</span>
            </div>
            <div className="flex space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Track Your Shipments in Real-Time
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Fast, reliable, and secure logistics solutions for your business
          </p>
        </div>

        {/* Tracking Form */}
        <div className="max-w-2xl mx-auto mb-16">
          <TrackingForm />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <Search className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600">
              Track your packages in real-time with detailed status updates
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <TruckIcon className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Reliable and timely delivery to your destination
            </p>
          </div>

          <div className="card text-center">
            <div className="flex justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">
              Comprehensive insights into your shipping operations
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-6">Join thousands of satisfied customers</p>
          <div className="flex justify-center space-x-4">
            <Link href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-colors">
              Create Account
            </Link>
            <Link href="/pricing" className="bg-primary-700 hover:bg-primary-800 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 ConsignPro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
