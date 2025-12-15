'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = momentLocalizer(moment)

interface Slot {
  id: string
  date: string
  status: 'available' | 'booked' | 'fulfilled'
  slot_types: {
    id: string
    name: string
    price: number
  }
}

interface Creator {
  id: string
  newsletter_name: string
  timezone: string
}

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Slot
}

export default function BookingPage({ params }: { params: { slug: string } }) {
  const [creator, setCreator] = useState<Creator | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlotType, setSelectedSlotType] = useState<Slot['slot_types'] | null>(null)
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorEmail, setSponsorEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [adCopy, setAdCopy] = useState('')
  const [creativeFile, setCreativeFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [params.slug])

  const fetchData = async () => {
    setLoading(true)
    const response = await fetch(`/api/booking/public/${params.slug}`)
    if (response.ok) {
      const data = await response.json()
      setCreator(data.creator)
      setSlots(data.slots)
    } else {
      console.error('Error fetching data')
    }
    setLoading(false)
  }

  const events: Event[] = slots.map(slot => ({
    id: slot.id,
    title: `${slot.slot_types.name} - $${slot.slot_types.price}`,
    start: new Date(slot.date),
    end: new Date(slot.date),
    allDay: true,
    resource: slot
  }))

  const eventStyleGetter = () => ({
    style: {
      backgroundColor: 'green',
      color: 'white',
      borderRadius: '5px',
      border: 'none'
    }
  })

  const handleSelectSlot = (event: Event) => {
    setSelectedDate(new Date(event.start))
    setSelectedSlotType(null) // Reset slot type selection
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedSlotType) return

    setSubmitting(true)
    const formData = new FormData()
    formData.append('sponsorName', sponsorName)
    formData.append('sponsorEmail', sponsorEmail)
    formData.append('websiteUrl', websiteUrl)
    formData.append('adCopy', adCopy)
    formData.append('date', selectedDate.toISOString().split('T')[0])
    formData.append('slotTypeId', selectedSlotType.id)
    formData.append('creatorSlug', params.slug)
    if (creativeFile) {
      formData.append('creativeFile', creativeFile)
    }

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        alert('Booking submitted successfully!')
        // Reset form
        setSponsorName('')
        setSponsorEmail('')
        setWebsiteUrl('')
        setAdCopy('')
        setCreativeFile(null)
        setSelectedDate(null)
        setSelectedSlotType(null)
        // Refresh slots
        fetchData()
      } else {
        alert('Error submitting booking')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error submitting booking')
    }
    setSubmitting(false)
  }

  const availableSlotTypesForDate = selectedDate
    ? slots
        .filter(slot => moment(slot.date).isSame(selectedDate, 'day'))
        .map(slot => slot.slot_types)
        .filter((slotType, index, self) =>
          index === self.findIndex(st => st.id === slotType.id)
        )
    : []

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!creator) {
    return <div className="p-6">Creator not found</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Book a slot with {creator.newsletter_name}</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Dates</h2>
        <div style={{ height: '400px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectSlot}
            views={['month']}
            defaultView="month"
            selectable={false}
          />
        </div>
      </div>

      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Available Slot Types for {moment(selectedDate).format('MMMM D, YYYY')}
          </h2>
          {availableSlotTypesForDate.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableSlotTypesForDate.map(slotType => (
                <div
                  key={slotType.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSlotType?.id === slotType.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setSelectedSlotType(slotType)}
                >
                  <h3 className="font-semibold">{slotType.name}</h3>
                  <p className="text-gray-600">${slotType.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No slots available for this date.</p>
          )}
        </div>
      )}

      {selectedSlotType && (<>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Selected:</h3>
          <p className="text-green-700">
            Date: {moment(selectedDate).format('MMMM D, YYYY')}<br />
            Slot Type: {selectedSlotType.name} - ${selectedSlotType.price}
          </p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Booking Form</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="sponsorName" className="block text-sm font-medium text-gray-700">Sponsor Name</label>
              <input
                type="text"
                id="sponsorName"
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="sponsorEmail" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="sponsorEmail"
                value={sponsorEmail}
                onChange={(e) => setSponsorEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">Website URL</label>
              <input
                type="url"
                id="websiteUrl"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="adCopy" className="block text-sm font-medium text-gray-700">Ad Copy</label>
              <textarea
                id="adCopy"
                value={adCopy}
                onChange={(e) => setAdCopy(e.target.value)}
                required
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="creativeFile" className="block text-sm font-medium text-gray-700">Creative File (optional)</label>
              <input
                type="file"
                id="creativeFile"
                onChange={(e) => setCreativeFile(e.target.files ? e.target.files[0] : null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Booking'}
            </button>
          </form>
        </div>
      </>)}
    </div>
  )
}