'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

interface SlotType {
  id: string
  name: string
  price: number
}

export default function SlotTypesPage() {
  const [slotTypes, setSlotTypes] = useState<SlotType[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', price: '' })

  useEffect(() => {
    fetchSlotTypes()
  }, [])

  const fetchSlotTypes = async () => {
    const { data, error } = await supabase
      .from('slot_types')
      .select('*')

    if (error) {
      console.error('Error fetching slot types:', error)
    } else {
      setSlotTypes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      // Update
      const { error } = await supabase
        .from('slot_types')
        .update({ name: formData.name, price: parseFloat(formData.price) })
        .eq('id', editing)

      if (error) {
        console.error('Error updating slot type:', error)
      } else {
        setEditing(null)
        setFormData({ name: '', price: '' })
        fetchSlotTypes()
      }
    } else {
      // Create
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('User not authenticated')
        return
      }
      const { error } = await supabase
        .from('slot_types')
        .insert({ creator_id: user.id, name: formData.name, price: parseFloat(formData.price) })

      if (error) {
        console.error('Error creating slot type:', error)
      } else {
        setFormData({ name: '', price: '' })
        fetchSlotTypes()
      }
    }
  }

  const handleEdit = (slotType: SlotType) => {
    setEditing(slotType.id)
    setFormData({ name: slotType.name, price: slotType.price.toString() })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this slot type?')) {
      const { error } = await supabase
        .from('slot_types')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting slot type:', error)
      } else {
        fetchSlotTypes()
      }
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Slot Types Management</h1>

      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li><a href="/dashboard/bookings" className="text-blue-600 hover:text-blue-800">Bookings</a></li>
          <li><a href="/dashboard/calendar" className="text-blue-600 hover:text-blue-800">Calendar</a></li>
          <li><a href="/dashboard/profile" className="text-blue-600 hover:text-blue-800">Profile</a></li>
          <li><a href="/dashboard/slot-types" className="text-blue-600 hover:text-blue-800">Slot Types</a></li>
        </ul>
      </nav>

      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Slot Type' : 'Add New Slot Type'}</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            {editing ? 'Update' : 'Add'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setFormData({ name: '', price: '' })
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Slot Types</h2>
        {slotTypes.length === 0 ? (
          <p>No slot types found. Add your first one above.</p>
        ) : (
          slotTypes.map((slotType) => (
            <div key={slotType.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-medium">{slotType.name}</h3>
                <p className="text-gray-600">${slotType.price}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(slotType)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slotType.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}