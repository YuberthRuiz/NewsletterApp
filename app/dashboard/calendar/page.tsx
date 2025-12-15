'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { supabase } from '@/utils/supabase'

const localizer = momentLocalizer(moment)

interface Slot {
  id: string
  date: string
  status: 'available' | 'booked' | 'fulfilled'
  slot_types: {
    name: string
  }
}

interface SlotType {
  id: string
  name: string
  price: number
}

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Slot
}

export default function CalendarPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotTypes, setSlotTypes] = useState<SlotType[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedSlotType, setSelectedSlotType] = useState<string>('')

  useEffect(() => {
    fetchSlotTypes()
    if (currentRange) {
      fetchSlots(currentRange.start, currentRange.end)
    }
  }, [currentRange])

  const fetchSlots = async (start: Date, end: Date) => {
    setLoading(true)
    const startStr = moment(start).format('YYYY-MM-DD')
    const endStr = moment(end).format('YYYY-MM-DD')
    const response = await fetch(`/api/slots?start=${startStr}&end=${endStr}`)
    if (response.ok) {
      const data = await response.json()
      setSlots(data)
    } else {
      console.error('Error fetching slots')
    }
    setLoading(false)
  }

  const fetchSlotTypes = async () => {
    const { data, error } = await supabase
      .from('slot_types')
      .select('*')

    if (error) {
      console.error('Error fetching slot types:', error)
    } else {
      setSlotTypes(data || [])
      if (data && data.length > 0 && !selectedSlotType) {
        setSelectedSlotType(data[0].id)
      }
    }
  }

  const events: Event[] = slots.map(slot => ({
    id: slot.id,
    title: slot.slot_types.name,
    start: new Date(slot.date),
    end: new Date(slot.date),
    allDay: true,
    resource: slot
  }))

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = ''
    switch (event.resource.status) {
      case 'available':
        backgroundColor = 'green'
        break
      case 'booked':
        backgroundColor = 'yellow'
        break
      case 'fulfilled':
        backgroundColor = 'gray'
        break
      default:
        backgroundColor = 'blue'
    }
    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '5px',
        border: 'none'
      }
    }
  }

  const handleSelectEvent = async (event: Event) => {
    if (event.resource.status === 'available') {
      // Delete to toggle availability
      const response = await fetch(`/api/slots/${event.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        // Refetch
        if (currentRange) {
          fetchSlots(currentRange.start, currentRange.end)
        }
      } else {
        console.error('Error deleting slot')
      }
    }
  }

  const handleRangeChange = (range: Date[] | { start: Date; end: Date }) => {
    if (Array.isArray(range)) {
      setCurrentRange({ start: range[0], end: range[range.length - 1] })
    } else {
      setCurrentRange(range)
    }
  }

  const handleSelectSlot = async (slotInfo: { start: Date; end: Date }) => {
    if (!selectedSlotType) {
      alert('Please select a slot type first')
      return
    }
    const date = moment(slotInfo.start).format('YYYY-MM-DD')
    const response = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_type_id: selectedSlotType, date })
    })
    if (response.ok) {
      // Refetch
      if (currentRange) {
        fetchSlots(currentRange.start, currentRange.end)
      }
    } else {
      console.error('Error creating slot')
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li><a href="/dashboard/bookings" className="text-blue-600 hover:text-blue-800">Bookings</a></li>
          <li><a href="/dashboard/calendar" className="text-blue-600 hover:text-blue-800">Calendar</a></li>
          <li><a href="/dashboard/profile" className="text-blue-600 hover:text-blue-800">Profile</a></li>
          <li><a href="/dashboard/slot-types" className="text-blue-600 hover:text-blue-800">Slot Types</a></li>
        </ul>
      </nav>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Select Slot Type to Add</label>
        <select
          value={selectedSlotType}
          onChange={(e) => setSelectedSlotType(e.target.value)}
          className="p-2 border rounded"
        >
          {slotTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name} - ${type.price}</option>
          ))}
        </select>
      </div>
      <p className="mb-4 text-sm text-gray-600">Click on a date to add an available slot. Click on an existing slot to remove it.</p>
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onRangeChange={handleRangeChange}
          views={['month']}
          defaultView="month"
          selectable
        />
      </div>
    </div>
  )
}