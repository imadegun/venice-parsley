'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, AlertCircle, Calendar, Users, LogIn, LogOut } from 'lucide-react'
import type { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']

interface CheckInOutManagerProps {
  apartmentId?: string
  date?: Date
}

export function CheckInOutManager({ apartmentId, date }: CheckInOutManagerProps) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [apartmentNames, setApartmentNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw new Error('Supabase environment variables not set')
        }

        const supabase = createClient()
        const today = new Date().toISOString().split('T')[0]

        let query = supabase
          .from('bookings')
          .select(`
            *,
            apartments:apartment_id (
              name
            )
          `)
          .eq('status', 'confirmed')
          .order('check_in_date', { ascending: true })

        if (apartmentId) {
          query = query.eq('apartment_id', apartmentId)
        }

        if (date) {
          const dateStr = format(date, 'yyyy-MM-dd')
          query = query.lte('check_in_date', dateStr)
            .gte('check_out_date', dateStr)
        }

        const { data, error } = await query

        if (error) throw error

        const bookingsData = data || []
        setBookings(bookingsData)

        const names: Record<string, string> = {}
        bookingsData.forEach((b: any) => {
          if (b.apartments?.name) {
            names[b.apartment_id!] = b.apartments.name
          }
        })
        setApartmentNames(names)

      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [apartmentId, date])

  const updateCheckInOut = async (bookingId: string, type: 'check-in' | 'check-out') => {
    try {
      setProcessing(bookingId)
      setError(null)

      const supabase = createClient()
      const now = new Date().toISOString()

      const updateData = type === 'check-in' 
        ? { check_in_actual: now }
        : { check_out_actual: now }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updateData }
          : booking
      ))

    } catch (err) {
      console.error(`Error during ${type}:`, err)
      setError(err instanceof Error ? err.message : `Failed to process ${type}`)
    } finally {
      setProcessing(null)
    }
  }

  const getCheckInBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.check_in_date) return false
      const checkInDate = new Date(booking.check_in_date)
      checkInDate.setHours(0, 0, 0, 0)
      
      return checkInDate.getTime() === today.getTime() && !booking.check_in_actual
    })
  }

  const getCheckOutBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.check_out_date) return false
      const checkOutDate = new Date(booking.check_out_date)
      checkOutDate.setHours(0, 0, 0, 0)
      
      return checkOutDate.getTime() === today.getTime() && !!booking.check_in_actual && !booking.check_out_actual
    })
  }

  const getActiveBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.check_in_date || !booking.check_out_date) return false
      const checkInDate = new Date(booking.check_in_date)
      checkInDate.setHours(0, 0, 0, 0)
      const checkOutDate = new Date(booking.check_out_date)
      checkOutDate.setHours(0, 0, 0, 0)
      
      return booking.check_in_actual && !booking.check_out_actual && today >= checkInDate && today <= checkOutDate
    })
  }

  const checkInBookings = getCheckInBookings()
  const checkOutBookings = getCheckOutBookings()
  const activeBookings = getActiveBookings()

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <Calendar className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="text-gray-500 text-lg font-medium">Loading bookings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const renderBookingList = (bookings: Booking[], title: string, icon: any, actionType: 'check-in' | 'check-out' | null) => (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary" className="ml-auto">{bookings.length}</Badge>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
          <p>No bookings to {actionType || 'display'} today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{apartmentNames[booking.apartment_id!] || 'Apartment'}</h4>
                    <Badge variant="outline" className="text-xs">{booking.status}</Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Guest: {booking.contact_info && typeof booking.contact_info === 'object' && 'guest_name' in booking.contact_info ? (booking.contact_info as any).guest_name : 'N/A'}</p>
                    <p>Stay: {format(new Date(booking.check_in_date!), 'MMM d')} - {format(new Date(booking.check_out_date!), 'MMM d')}</p>
                    {booking.total_guests && (
                      <p className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.total_guests} guest{booking.total_guests !== 1 ? 's' : ''}
                      </p>
                    )}
                    {booking.check_in_actual && (
                      <p className="text-emerald-600 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Checked in: {format(new Date(booking.check_in_actual), 'MMM d, h:mm a')}
                      </p>
                    )}
                    {booking.check_out_actual && (
                      <p className="text-violet-600 text-xs flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        Checked out: {format(new Date(booking.check_out_actual), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
                
                {actionType && (
                  <Button
                    onClick={() => updateCheckInOut(booking.id, actionType)}
                    disabled={processing === booking.id}
                    variant={actionType === 'check-in' ? 'default' : 'outline'}
                    className={actionType === 'check-in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-gray-700'}
                  >
                    {processing === booking.id ? (
                      'Processing...'
                    ) : actionType === 'check-in' ? (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Check In
                      </>
                    ) : (
                      <>
                        <LogOut className="h-4 w-4 mr-2" />
                        Check Out
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Check-In / Check-Out Management</h2>
          {date && (
            <p className="text-sm text-gray-500">{format(date, 'MMMM d, yyyy')}</p>
          )}
        </div>
      </div>

      {/* Today's Check-Ins */}
      {renderBookingList(
        checkInBookings,
        'Today\'s Check-Ins',
        <LogIn className="h-5 w-5 text-emerald-600" />,
        'check-in'
      )}

      {/* Today's Check-Outs */}
      {renderBookingList(
        checkOutBookings,
        'Today\'s Check-Outs',
        <LogOut className="h-5 w-5 text-blue-600" />,
        'check-out'
      )}

      {/* Currently Occupied */}
      {renderBookingList(
        activeBookings,
        'Currently Occupied',
        <Users className="h-5 w-5 text-amber-600" />,
        null
      )}

      {checkInBookings.length === 0 && checkOutBookings.length === 0 && activeBookings.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No active bookings for the selected date</p>
        </div>
      )}
    </div>
  )
}
