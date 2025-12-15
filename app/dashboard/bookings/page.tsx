'use client'

import { useState, useEffect } from 'react'

interface Booking {
  id: string
  sponsor_name: string
  payment_status: string
  ad_copy: string | null
  creative_file_url: string | null
  slots: {
    date: string
    status: 'available' | 'booked' | 'fulfilled'
    slot_types: {
      name: string
    }
  }
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setLoading(true)
    const response = await fetch('/api/bookings')
    if (response.ok) {
      const data = await response.json()
      setBookings(data)
    } else {
      console.error('Error fetching bookings')
    }
    setLoading(false)
  }

  const handleFulfill = async (bookingId: string) => {
    const response = await fetch(`/api/bookings/${bookingId}/fulfill`, {
      method: 'POST'
    })
    if (response.ok) {
      // Refetch to update the status
      fetchBookings()
    } else {
      console.error('Error fulfilling booking')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Booked Ads Management</h1>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsor Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Type</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Copy</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creative File</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{booking.sponsor_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{booking.slots.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{booking.slots.slot_types.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{booking.payment_status}</td>
                  <td className="px-4 py-2 text-sm text-gray-500 max-w-xs truncate">{booking.ad_copy || 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {booking.creative_file_url ? (
                      <a href={booking.creative_file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        View File
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                    {booking.slots.status === 'fulfilled' ? (
                      <span className="text-green-600">Fulfilled</span>
                    ) : (
                      <button
                        onClick={() => handleFulfill(booking.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Mark as Fulfilled
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}