'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, AlertCircle, Calendar, Users } from 'lucide-react'
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

  // Fetch bookings that can be checked in/out
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

        // Extract apartment names
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

  // Update booking with check-in/out timestamp
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

      // Update local state
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

  // Filter bookings by status
  const getCheckInBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.check_in_date) return false
      const checkInDate = new Date(booking.check_in_date)
      checkInDate.setHours(0, 0, 0, 0)
      const checkOutDate = new Date(booking.check_out_date!)
      checkOutDate.setHours(0, 0, 0, 0)
      
      // Can check in if: today is check-in date, not already checked in
      return checkInDate.getTime() === today.getTime() && 
             !booking.check_in_actual
    })
  }

  const getCheckOutBookings = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return bookings.filter(booking => {
      if (!booking.check_out_date) return false
      const checkOutDate = new Date(booking.check_out_date)
      checkOutDate.setHours(0, 0, 0, 0)
      
      // Can check out if: today is check-out date, checked in but not checked out
      return checkOutDate.getTime() === today.getTime() && 
             !!booking.check_in_actual && 
             !booking.check_out_actual
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
      
      // Currently active if: checked in but not checked out
      return booking.check_in_actual && 
             !booking.check_out_actual &&
             today >= checkInDate &&
             today <= checkOutDate
    })
  }

  const checkInBookings = getCheckInBookings()
  const checkOutBookings = getCheckOutBookings()
  const activeBookings = getActiveBookings()

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading bookings...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const renderBookingList = (bookings: Booking[], title: string, icon: any, actionType: 'check-in' | 'check-out' | null) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">{bookings.length}</Badge>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
          <p>No bookings to {actionType || 'display'} today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(booking => (
            <Card key={booking.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">
                      {apartmentNames[booking.apartment_id!] || 'Apartment'}
                    </h4>
                    <Badge variant="outline">{booking.status}</Badge>
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
                      <p className="text-green-600 text-xs">
                        ✓ Checked in: {format(new Date(booking.check_in_actual), 'MMM d, h:mm a')}
                      </p>
                    )}
                    {booking.check_out_actual && (
                      <p className="text-blue-600 text-xs">
                        ✓ Checked out: {format(new Date(booking.check_out_actual), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>
                
                {actionType && (
                  <Button
                    onClick={() => updateCheckInOut(booking.id, actionType)}
                    disabled={processing === booking.id}
                    variant={actionType === 'check-in' ? 'default' : 'outline'}
                  >
                    {processing === booking.id ? (
                      'Processing...'
                    ) : actionType === 'check-in' ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Check In
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Check Out
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-5 w-5 text-blue-600" />
          Check-In / Check-Out Management
          {date && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              {format(date, 'MMMM d, yyyy')}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Today's Check-Ins */}
        {renderBookingList(
          checkInBookings,
          'Today\'s Check-Ins',
          <Check className="h-5 w-5 text-green-600" />,
          'check-in'
        )}

        {/* Today's Check-Outs */}
        {renderBookingList(
          checkOutBookings,
          'Today\'s Check-Outs',
          <Check className="h-5 w-5 text-blue-600" />,
          'check-out'
        )}

        {/* Currently Occupied */}
        {renderBookingList(
          activeBookings,
          'Currently Occupied',
          <Users className="h-5 w-5 text-orange-600" />,
          null
        )}

        {checkInBookings.length === 0 && 
         checkOutBookings.length === 0 && 
         activeBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No active bookings for the selected date</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
