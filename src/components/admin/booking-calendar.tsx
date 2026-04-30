'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfDay,
  isAfter,
  isWithinInterval,
  addDays
} from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Clock } from 'lucide-react'
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

const statusConfig = {
  available: { label: 'Available', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  booked: { label: 'Booked', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  occupied: { label: 'Occupied', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  completed: { label: 'Completed', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
}

export function BookingCalendar({ apartmentId, onDateSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookings, setBookings] = useState<BookingWithApartment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDateBookings, setSelectedDateBookings] = useState<BookingWithApartment[]>([])

  const fetchBookings = useCallback(async () => {
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
  }, [apartmentId])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const getDayStatus = (date: Date, dayBookings: BookingWithApartment[]): DayBookings['status'] => {
    if (dayBookings.length === 0) return 'available'

    const checkDate = startOfDay(date)

    const hasOccupied = dayBookings.some(booking => {
      if (booking.status !== 'confirmed') return false
      if (!booking.check_in_actual) return false
      const checkIn = startOfDay(new Date(booking.check_in_actual))
      const checkOut = booking.check_out_actual ? startOfDay(new Date(booking.check_out_actual)) : null
      
      if (!checkOut) {
        return isSameDay(checkDate, checkIn) || isAfter(checkDate, checkIn)
      }
      return isWithinInterval(checkDate, { start: checkIn, end: checkOut })
    })

    if (hasOccupied) return 'occupied'

    const hasCompleted = dayBookings.some(booking => {
      if (booking.status !== 'confirmed') return false
      if (!booking.check_out_actual) return false
      const checkOut = startOfDay(new Date(booking.check_out_actual))
      return isSameDay(checkDate, checkOut)
    })

    if (hasCompleted) return 'completed'

    const hasCancelled = dayBookings.some(booking => booking.status === 'cancelled')
    if (hasCancelled) return 'cancelled'

    const hasBooked = dayBookings.some(booking => booking.status === 'confirmed')
    if (hasBooked) return 'booked'

    return 'available'
  }

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

      return { date: day, bookings: dayBookings, status }
    })
  }, [currentMonth, bookings, getDayStatus])

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

  const totalBookings = bookings.length
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <CalendarIcon className="h-8 w-8 text-blue-500 animate-pulse" />
        </div>
        <p className="text-gray-500 text-lg font-medium">Loading bookings...</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
              <p className="text-xs text-gray-500">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{confirmedBookings}</p>
              <p className="text-xs text-gray-500">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingBookings}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{format(currentMonth, 'MMM')}</p>
              <p className="text-xs text-gray-500">Current Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Booking Calendar</h2>
                <p className="text-xs text-gray-500">Manage and track all bookings</p>
              </div>
            </div>
            
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-[140px] text-center px-4 py-2 bg-gray-100 rounded-xl">
                <p className="text-lg font-bold text-gray-900">{format(currentMonth, 'MMMM')}</p>
                <p className="text-xs text-gray-500">{format(currentMonth, 'yyyy')}</p>
              </div>
              <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-10 w-10 rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {Object.entries(statusConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${config.dot}`} />
                <span className="text-xs font-medium text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-1.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}

            {allDays.map((date, idx) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const dayData = daysWithStatus.find(d => isSameDay(d.date, date))
              const status = dayData?.status || 'available'
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const config = statusConfig[status]

              return (
                <button
                  key={idx}
                  onClick={() => isCurrentMonth && dayData && handleDateClick(dayData)}
                  disabled={!isCurrentMonth || !dayData}
                  className={`
                    relative h-14 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center
                    ${!isCurrentMonth ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-default' : 'cursor-pointer'}
                    ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-400' : ''}
                    ${isCurrentMonth ? `${config.bg} ${config.border} ${config.text} hover:shadow-md hover:scale-105` : ''}
                  `}
                  title={`${format(date, 'MMM d, yyyy')} - ${config.label}`}
                >
                  <span className="text-sm font-bold">{format(date, 'd')}</span>
                  {dayData && dayData.bookings.length > 0 && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        {selectedDate && selectedDateBookings.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              Bookings for {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {selectedDateBookings.map(booking => {
                const aptName = (booking as any).apartments?.name
                const displayName = typeof aptName === 'object' && aptName !== null 
                  ? (aptName as any).en || (aptName as any).it || 'Apartment'
                  : aptName || 'Apartment'

                return (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900">{displayName}</span>
                          <Badge className={`${statusConfig[booking.status as keyof typeof statusConfig]?.bg} ${statusConfig[booking.status as keyof typeof statusConfig]?.text} border ${statusConfig[booking.status as keyof typeof statusConfig]?.border}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.total_guests || 1} guest{(booking.total_guests || 1) !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(booking.check_in_date!), 'MMM d')} - {format(new Date(booking.check_out_date!), 'MMM d')}
                          </span>
                        </div>
                      </div>
                      {booking.check_in_actual && (
                        <div className="text-xs text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Checked in
                        </div>
                      )}
                      {booking.check_out_actual && (
                        <div className="text-xs text-violet-600 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-violet-500" />
                          Checked out
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
