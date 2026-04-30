'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  format,
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  parseISO,
  differenceInDays,
  max,
  min,
} from 'date-fns'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Users,
  MapPin,
  Search,
  Filter,
  X,
  ChevronDown,
  LogIn,
  Info,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type Apartment = Database['public']['Tables']['apartments']['Row']

interface BookingWithApartment extends Booking {
  apartments: Pick<Apartment, 'id' | 'name' | 'slug'> | null
}

interface BookingCalendarProps {
  bookings: BookingWithApartment[]
  apartments: Pick<Apartment, 'id' | 'name' | 'slug'>[]
  apartmentId?: string
  onDateSelect?: (date: Date, bookings: BookingWithApartment[]) => void
}

const statusConfig = {
  pending: { label: 'Pending', bg: 'bg-amber-400', bgLight: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', ring: 'ring-amber-400' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500', bgLight: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', ring: 'ring-blue-400' },
  occupied: { label: 'Occupied', bg: 'bg-orange-500', bgLight: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300', ring: 'ring-orange-400' },
  completed: { label: 'Completed', bg: 'bg-emerald-500', bgLight: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', ring: 'ring-emerald-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-400', bgLight: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', ring: 'ring-red-400' },
}

const DAY_WIDTH = 48
const APARTMENT_ROW_HEIGHT = 56

export function BookingCalendar({ bookings, apartments, apartmentId, onDateSelect }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<BookingWithApartment | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  const filteredBookings = useMemo(() => {
    if (!apartmentId) return bookings
    return bookings.filter(b => b.apartment_id === apartmentId)
  }, [bookings, apartmentId])

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const scrollContainer = scrollRef.current
      const todayElement = todayRef.current
      const todayOffset = todayElement.offsetLeft
      const containerWidth = scrollContainer.clientWidth
      scrollContainer.scrollLeft = Math.max(0, todayOffset - containerWidth / 3)
    }
  }, [currentMonth])

  const startDate = useMemo(() => {
    return startOfMonth(currentMonth)
  }, [currentMonth])

  const endDate = useMemo(() => {
    return addDays(startOfMonth(addMonths(currentMonth, 1)), -1)
  }, [currentMonth])

  const calendarDays = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const getBookingStatus = (booking: BookingWithApartment): string => {
    if (booking.status === 'cancelled') return 'cancelled'
    if (booking.status === 'completed') return 'completed'
    if (booking.check_in_actual && !booking.check_out_actual) return 'occupied'
    if (booking.status === 'confirmed') return 'confirmed'
    if (booking.status === 'pending') return 'pending'
    return booking.status
  }

  const getApartmentName = (apt: Pick<Apartment, 'id' | 'name' | 'slug'> | null): string => {
    if (!apt?.name) return 'Unknown'
    if (typeof apt.name === 'object') {
      return (apt.name as any).en || (apt.name as any).it || 'Apartment'
    }
    return apt.name
  }

  const apartmentsWithBookings = useMemo(() => {
    const usedAptIds = new Set(filteredBookings.map(b => b.apartment_id).filter(Boolean))
    let list = apartments.filter(a => usedAptIds.has(a.id))
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(a => getApartmentName(a).toLowerCase().includes(q))
    }

    return list
  }, [apartments, filteredBookings, searchQuery])

  const getBookingForDay = useCallback((apartmentId: string, date: Date) => {
    return filteredBookings.find(b => {
      if (b.apartment_id !== apartmentId) return false
      if (!b.check_in_date || !b.check_out_date) return false
      if (statusFilter !== 'all' && getBookingStatus(b) !== statusFilter) return false
      const checkIn = parseISO(b.check_in_date)
      const checkOut = parseISO(b.check_out_date)
      if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return false
      return date >= checkIn && date <= checkOut
    })
  }, [filteredBookings, statusFilter])

  const getBookingSpan = useCallback((booking: BookingWithApartment): number => {
    if (!booking.check_in_date || !booking.check_out_date) return 1
    const checkIn = parseISO(booking.check_in_date)
    const checkOut = parseISO(booking.check_out_date)
    const start = max([checkIn, startDate])
    const end = min([checkOut, endDate])
    return Math.max(1, differenceInDays(end, start) + 1)
  }, [startDate, endDate])

  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return {
      total: filteredBookings.length,
      active: filteredBookings.filter(b => {
        if (!b.check_in_date || !b.check_out_date) return false
        const checkIn = parseISO(b.check_in_date)
        const checkOut = parseISO(b.check_out_date)
        return today >= checkIn && today <= checkOut && b.status === 'confirmed'
      }).length,
      checkingIn: filteredBookings.filter(b => {
        if (!b.check_in_date) return false
        const checkIn = parseISO(b.check_in_date)
        return isSameDay(checkIn, today) && b.status === 'confirmed' && !b.check_in_actual
      }).length,
      checkingOut: filteredBookings.filter(b => {
        if (!b.check_out_date) return false
        const checkOut = parseISO(b.check_out_date)
        return isSameDay(checkOut, today) && b.status === 'confirmed' && b.check_in_actual && !b.check_out_actual
      }).length,
    }
  }, [filteredBookings])

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Currently Active</p>
          <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checking In Today</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">{stats.checkingIn}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checking Out Today</p>
          <p className="text-2xl font-semibold text-orange-600 mt-1">{stats.checkingOut}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Month Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center">
              <p className="text-sm font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search apartments..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-8 w-full sm:w-48 pl-8 pr-3 text-sm rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${
                  statusFilter === key
                    ? `${config.bgLight} ${config.text} ${config.border} ring-1 ${config.ring}`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {config.label}
              </button>
            ))}
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-1">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${config.bg}`} />
            <span className="text-xs text-gray-600">{config.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <div className="w-3 h-3 rounded-sm bg-blue-600 ring-2 ring-blue-200" />
          <span className="text-xs text-gray-600">Today</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="flex" ref={scrollRef}>
          {/* Apartment Names Column (sticky) */}
          <div className="sticky left-0 z-10 bg-white border-r border-gray-200 w-48 shrink-0">
            <div className={`h-10 border-b border-gray-200 bg-gray-50 px-3 flex items-center`}>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Apartment</span>
            </div>
            {apartmentsWithBookings.map(apt => (
              <div
                key={apt.id}
                className="h-14 border-b border-gray-100 px-3 flex items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">{getApartmentName(apt)}</span>
                </div>
              </div>
            ))}
            {apartmentsWithBookings.length === 0 && (
              <div className="h-24 flex items-center justify-center">
                <p className="text-sm text-gray-500">No apartments found</p>
              </div>
            )}
          </div>

          {/* Calendar Area */}
          <div className="flex-1 overflow-x-auto">
            {/* Date Headers */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {calendarDays.map((date, idx) => {
                const today = isToday(date)
                const weekend = date.getDay() === 0 || date.getDay() === 6
                return (
                  <div
                    key={idx}
                    ref={today ? todayRef : undefined}
                    className={`shrink-0 border-r border-gray-100 text-center py-2 ${
                      today ? 'bg-blue-50' : weekend ? 'bg-gray-50/50' : ''
                    }`}
                    style={{ width: DAY_WIDTH }}
                  >
                    <p className={`text-xs font-medium ${today ? 'text-blue-600' : 'text-gray-500'}`}>
                      {format(date, 'EEE')}
                    </p>
                    <p className={`text-sm font-semibold mt-0.5 ${
                      today
                        ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto'
                        : 'text-gray-900'
                    }`}>
                      {format(date, 'd')}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Booking Rows */}
            {apartmentsWithBookings.map(apt => (
                <div key={apt.id} className="flex border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  {calendarDays.map((date, dayIdx) => {
                    const booking = getBookingForDay(apt.id, date)
                    const today = isToday(date)
                    const isBookingStart = booking && isSameDay(parseISO(booking.check_in_date!), date)
                    const isBookingEnd = booking && isSameDay(parseISO(booking.check_out_date!), date)

                    return (
                      <div
                        key={dayIdx}
                        className={`shrink-0 border-r border-gray-100 relative ${
                          today ? 'bg-blue-50/30' : ''
                        }`}
                        style={{ width: DAY_WIDTH, height: APARTMENT_ROW_HEIGHT }}
                      >
                        {booking && isBookingStart && (
                          <button
                            onClick={() => {
                              setSelectedBooking(booking)
                              onDateSelect?.(date, [booking])
                            }}
                            className={`absolute inset-y-1 left-0.5 right-1 rounded-md ${statusConfig[getBookingStatus(booking) as keyof typeof statusConfig]?.bg} text-white text-[10px] font-medium px-1.5 flex items-center overflow-hidden truncate hover:opacity-90 transition-opacity cursor-pointer z-10`}
                            style={{ width: `calc(${getBookingSpan(booking) * DAY_WIDTH}px - 4px)` }}
                            title={`${getApartmentName(booking.apartments)} - ${format(parseISO(booking.check_in_date!), 'MMM d')} to ${format(parseISO(booking.check_out_date!), 'MMM d')}`}
                          >
                            <span className="truncate">
                              {booking.contact_info && typeof booking.contact_info === 'object' && 'guest_name' in booking.contact_info
                                ? (booking.contact_info as any).guest_name
                                : 'Guest'}
                            </span>
                            {isBookingEnd && (
                              <span className="ml-1 shrink-0">
                                {booking.check_in_actual ? <LogIn className="h-3 w-3 inline" /> : null}
                              </span>
                            )}
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
            ))}

            {apartmentsWithBookings.length === 0 && (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <CalendarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No bookings to display</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Booking Details */}
      {selectedBooking && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Booking Details</h3>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Guest</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {selectedBooking.contact_info && typeof selectedBooking.contact_info === 'object' && 'guest_name' in selectedBooking.contact_info
                  ? (selectedBooking.contact_info as any).guest_name
                  : 'N/A'}
              </p>
              {selectedBooking.contact_info && typeof selectedBooking.contact_info === 'object' && 'guest_email' in selectedBooking.contact_info && (selectedBooking.contact_info as any).guest_email && (
                <p className="text-xs text-gray-500 mt-0.5">{(selectedBooking.contact_info as any).guest_email}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Apartment</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{getApartmentName(selectedBooking.apartments)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Dates</p>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {selectedBooking.check_in_date && selectedBooking.check_out_date
                  ? `${format(parseISO(selectedBooking.check_in_date), 'MMM d')} - ${format(parseISO(selectedBooking.check_out_date), 'MMM d, yyyy')}`
                  : 'N/A'}
              </p>
              {selectedBooking.check_in_date && selectedBooking.check_out_date && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {differenceInDays(parseISO(selectedBooking.check_out_date), parseISO(selectedBooking.check_in_date))} nights
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${statusConfig[getBookingStatus(selectedBooking) as keyof typeof statusConfig]?.bgLight} ${statusConfig[getBookingStatus(selectedBooking) as keyof typeof statusConfig]?.text} border ${statusConfig[getBookingStatus(selectedBooking) as keyof typeof statusConfig]?.border}`}>
                  {getBookingStatus(selectedBooking).charAt(0).toUpperCase() + getBookingStatus(selectedBooking).slice(1)}
                </Badge>
              </div>
              {selectedBooking.total_guests && (
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {selectedBooking.total_guests} guest{selectedBooking.total_guests !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
