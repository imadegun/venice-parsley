'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  format, 
  addMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  startOfDay,
  isBefore,
  isAfter,
  isWithinInterval,
  addDays
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import type { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type Apartment = Database['public']['Tables']['apartments']['Row']

interface BookingWithApartment extends Booking {
  apartments: Pick<Apartment, 'id' | 'name'> | null
}

interface BookingCalendarProps {
  apartmentId?: string
  onDateSelect?: (date: Date, bookings: BookingWithApartment[]) => void
}

interface DayBookings {
  date: Date
  bookings: BookingWithApartment[]
  status: 'available' | 'booked' | 'occupied' | 'completed' | 'cancelled'
}

export function BookingCalendar({ apartmentId, onDateSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState<BookingWithApartment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingWithApartment[]>([])

  // Fetch bookings for the apartment (or all bookings if no apartment specified)
  const fetchBookings = async () => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase environment variables not set')
        setLoading(false)
        return
      }

      const supabase = createClient()
      let query = supabase
        .from('bookings')
        .select(`
          *,
          apartments:apartment_id (
            id,
            name
          )
        `)
        .order('check_in_date', { ascending: true })

      if (apartmentId) {
        query = query.eq('apartment_id', apartmentId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bookings:', error)
        setBookings([])
        return
      }

      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [apartmentId])

  // Get day status based on bookings
  const getDayStatus = (date: Date, dayBookings: BookingWithApartment[]): DayBookings['status'] => {
    if (dayBookings.length === 0) return 'available'

    const today = startOfDay(new Date())
    const checkDate = startOfDay(date)

    // Check if any booking is occupied (checked in but not checked out)
    const hasOccupied = dayBookings.some(booking => {
      if (booking.status !== 'confirmed') return false
      if (!booking.check_in_actual) return false
      const checkIn = startOfDay(new Date(booking.check_in_actual))
      const checkOut = booking.check_out_actual ? startOfDay(new Date(booking.check_out_actual)) : null
      
      // Occupied if checked in but not checked out, and date is within range
      if (!checkOut) {
        return isSameDay(checkDate, checkIn) || isAfter(checkDate, checkIn)
      }
      return isWithinInterval(checkDate, { start: checkIn, end: checkOut })
    })

    if (hasOccupied) return 'occupied'

    // Check if any booking is completed (checked out)
    const hasCompleted = dayBookings.some(booking => {
      if (booking.status !== 'confirmed') return false
      if (!booking.check_out_actual) return false
      const checkOut = startOfDay(new Date(booking.check_out_actual))
      return isSameDay(checkDate, checkOut)
    })

    if (hasCompleted) return 'completed'

    // Check if any booking is cancelled
    const hasCancelled = dayBookings.some(booking => booking.status === 'cancelled')
    if (hasCancelled) return 'cancelled'

    // Check if any booking is confirmed (booked)
    const hasBooked = dayBookings.some(booking => booking.status === 'confirmed')
    if (hasBooked) return 'booked'

    return 'available'
  }

  // Get all days with their statuses
  const daysWithStatus = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

    return days.map(day => {
      const dayBookings = bookings.filter(booking => {
        if (!booking.check_in_date || !booking.check_out_date) return false
        const checkIn = startOfDay(new Date(booking.check_in_date))
        const checkOut = startOfDay(new Date(booking.check_out_date))
        return isWithinInterval(day, { start: checkIn, end: checkOut })
      })

      const status = getDayStatus(day, dayBookings)

      return {
        date: day,
        bookings: dayBookings,
        status
      }
    })
  }, [currentMonth, bookings])

  // Calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startPadding = monthStart.getDay()
  const endPadding = 6 - monthEnd.getDay()

  const prevMonthDays = startPadding > 0
    ? eachDayOfInterval({ start: addDays(monthStart, -startPadding), end: addDays(monthStart, -1) })
    : []

  const nextMonthDays = endPadding > 0
    ? eachDayOfInterval({ start: addDays(monthEnd, 1), end: addDays(monthEnd, endPadding) })
    : []

  const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

  const handleDateClick = (day: DayBookings) => {
    setSelectedDate(day.date)
    setSelectedDateBookings(day.bookings)
    onDateSelect?.(day.date, day.bookings)
  }

  const goToPrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getStatusColor = (status: DayBookings['status']) => {
    switch (status) {
      case 'available':
        return 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
      case 'booked':
        return 'bg-blue-100 text-blue-900 border-blue-200'
      case 'occupied':
        return 'bg-orange-100 text-orange-900 border-orange-200'
      case 'completed':
        return 'bg-green-100 text-green-900 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-900 border-red-200'
      default:
        return 'bg-white text-gray-900 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading bookings...</p>
        </CardContent>
      </Card>
    )
  }

  return (
      <Card>
      <CardHeader className="border-b bg-muted/50">
        <CardTitle className="flex items-center gap-2 text-xl">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          Booking Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border bg-white border-gray-200"></div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
            <span className="text-sm font-medium text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
            <span className="text-sm font-medium text-gray-700">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
            <span className="text-sm font-medium text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
            <span className="text-sm font-medium text-gray-700">Cancelled</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <Button variant="outline" size="icon" onClick={goToPrevMonth} className="hover:bg-blue-50 hover:border-blue-200">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="icon" onClick={goToNextMonth} className="hover:bg-blue-50 hover:border-blue-200">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {allDays.map((date, idx) => {
            const isCurrentMonth = isSameMonth(date, currentMonth)
            const dayData = daysWithStatus.find(d => isSameDay(d.date, date))
            const status = dayData?.status || 'available'
            const isSelected = selectedDate && isSameDay(date, selectedDate)

            return (
              <button
                key={idx}
                onClick={() => isCurrentMonth && dayData && handleDateClick(dayData)}
                disabled={!isCurrentMonth || !dayData}
                className={`
                  relative h-12 w-12 p-0 text-sm font-medium rounded-md border
                  transition-all cursor-pointer
                  ${!isCurrentMonth ? 'text-gray-300 bg-gray-50 cursor-default' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  ${getStatusColor(status)}
                `}
                title={`${format(date, 'MMM d, yyyy')} - ${status}`}
              >
                <span className="relative z-10">{format(date, 'd')}</span>
                {dayData && dayData.bookings.length > 0 && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current opacity-50"></span>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Date Details */}
        {selectedDate && selectedDateBookings.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Bookings for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedDateBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-3 bg-gray-50 rounded-lg text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {(booking as any).apartments?.name || 'Apartment'}
                    </span>
                    <Badge
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    {format(new Date(booking.check_in_date!), 'MMM d')} - {format(new Date(booking.check_out_date!), 'MMM d')}
                  </div>
                  {booking.check_in_actual && (
                    <div className="text-green-600 text-xs mt-1">
                      ✓ Checked in: {format(new Date(booking.check_in_actual), 'MMM d, h:mm a')}
                    </div>
                  )}
                  {booking.check_out_actual && (
                    <div className="text-blue-600 text-xs mt-1">
                      ✓ Checked out: {format(new Date(booking.check_out_actual), 'MMM d, h:mm a')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
