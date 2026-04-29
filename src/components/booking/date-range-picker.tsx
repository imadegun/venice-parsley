'use client'

import { useState, useEffect } from 'react'
import { format, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfDay, isWithinInterval, isAfter } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

import type { Database } from '@/types/database'

type Apartment = Database['public']['Tables']['apartments']['Row']

interface DateRangePickerProps {
  apartment: Apartment
  onDateRangeSelect: (checkIn: Date, checkOut: Date) => void
  refreshTrigger?: number  // Increment to force refresh of booked dates
}

export function DateRangePicker({ apartment, onDateRangeSelect, refreshTrigger }: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [pendingDates, setPendingDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // Fetch booked dates for this apartment
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        console.log('Fetching booked dates for apartment:', apartment.id)
        const response = await fetch(`/api/apartments/${apartment.id}/availability`)

        if (!response.ok) {
          console.error('API error:', response.status, response.statusText)
          setBookedDates(new Set())
          setPendingDates(new Set())
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log('Fetched availability:', data)

        const booked: Set<string> = new Set((data.bookedDates || []).map((date: unknown) => String(date)))
        const pending: Set<string> = new Set((data.pendingDates || []).map((date: unknown) => String(date)))

        console.log('Final booked dates:', Array.from(booked))
        console.log('Final pending dates:', Array.from(pending))
        setBookedDates(booked)
        setPendingDates(pending)
      } catch (error) {
        console.error('Error fetching booked dates:', error)
        setBookedDates(new Set())
        setPendingDates(new Set())
      } finally {
        setLoading(false)
      }
    }

    fetchBookedDates()
  }, [apartment.id, refreshTrigger])

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

  const isDateBooked = (date: Date) => bookedDates.has(format(date, 'yyyy-MM-dd'))
  const isDatePending = (date: Date) => pendingDates.has(format(date, 'yyyy-MM-dd'))
  const isDateUnavailable = (date: Date) => bookedDates.has(format(date, 'yyyy-MM-dd')) || pendingDates.has(format(date, 'yyyy-MM-dd'))
  const isDateDisabled = (date: Date) => isBefore(date, startOfDay(new Date())) || isDateUnavailable(date)

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return

    // Prevent selecting dates that would conflict with existing bookings
    const dateStr = format(date, 'yyyy-MM-dd')
    if (bookedDates.has(dateStr) || pendingDates.has(dateStr)) {
      return // Date is unavailable
    }

    if (!checkIn) {
      // First click: set check-in
      setCheckIn(date)
      setCheckOut(null)
    } else if (checkIn && !checkOut) {
      // Second click: set check-out (must be after check-in)
      if (isAfter(date, checkIn)) {
        // Check if any dates in the range are booked
        const rangeDates = eachDayOfInterval({ start: checkIn, end: date })
        const hasConflict = rangeDates.some(d => {
          const dStr = format(d, 'yyyy-MM-dd')
          return bookedDates.has(dStr) || pendingDates.has(dStr)
        })

        if (hasConflict) {
          // Don't allow selection if there's a conflict in the range
          return
        } else {
          setCheckOut(date)
        }
      } else {
        // If clicked before check-in, reset check-in to new date
        setCheckIn(date)
      }
    } else if (checkIn && checkOut) {
      // Third click: reset and start new selection
      setCheckIn(date)
      setCheckOut(null)
    }
  }

  const handleDateMouseEnter = (date: Date) => {
    if (checkIn && !checkOut && isAfter(date, checkIn)) {
      setHoverDate(date)
    }
  }

  const handleDateMouseLeave = () => {
    setHoverDate(null)
  }

  const getDateClassName = (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentMonth)
    const isDisabled = isDateDisabled(date)
    const isCheckIn = checkIn && isSameDay(date, checkIn)
    const isCheckOut = checkOut && isSameDay(date, checkOut)
    const isInRange = checkIn && (hoverDate || checkOut) && isWithinInterval(date, {
      start: checkIn,
      end: hoverDate || checkOut || checkIn
    })

    let className = 'relative h-10 w-10 p-0 text-sm font-medium rounded-md transition-all '

    if (!isCurrentMonth) {
      className += 'text-gray-300 '
    } else if (isDisabled) {
      className += 'text-gray-300 cursor-not-allowed bg-gray-100 '
    } else {
      className += 'text-gray-900 hover:bg-blue-50 cursor-pointer '
    }

    if (isCheckIn) {
      className += 'bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md '
    } else if (isCheckOut) {
      className += 'bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md '
    } else if (isInRange && isCurrentMonth) {
      // Show range highlighting even over disabled dates for visual feedback
      if (isDisabled) {
        className += 'bg-red-100 text-red-900 '
      } else {
        className += 'bg-blue-100 text-blue-900 '
      }
    }

    return className.trim()
  }

  const goToPrevMonth = () => setCurrentMonth(addMonths(currentMonth, -1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const confirmSelection = () => {
    if (checkIn && checkOut) {
      onDateRangeSelect(checkIn, checkOut)
    }
  }

  const nights = checkIn && checkOut ? Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)) : 0
  const totalPrice = checkIn && checkOut && nights > 0 ? nights * (apartment.base_price_cents / 100) : 0

  const displayCheckIn = checkIn ? format(checkIn, 'MMM d, yyyy') : null
  const displayCheckOut = checkOut ? format(checkOut, 'MMM d, yyyy') : null

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <div className={`flex items-center gap-2 ${checkIn ? 'text-blue-600' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${checkIn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
          <span>Select check-in</span>
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center gap-2 ${checkOut ? 'text-blue-600' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${checkOut ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
          <span>Select check-out</span>
        </div>
      </div>

      {/* Selected dates display */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Check-in</p>
            <p className="font-medium text-gray-900">
              {displayCheckIn || <span className="text-gray-400">Select date</span>}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Check-out</p>
            <p className="font-medium text-gray-900">
              {displayCheckOut || <span className="text-gray-400">Select date</span>}
            </p>
          </div>
        </div>
        {nights > 0 && (
          <>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
              <p className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</p>
            </div>
          </>
        )}
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={goToPrevMonth} className="h-9 w-9">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-9 w-9">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="h-9 flex items-center justify-center text-xs font-semibold text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {allDays.map((date, idx) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isDisabled = isDateDisabled(date)
          const isCheckIn = checkIn && isSameDay(date, checkIn)
          const isCheckOut = checkOut && isSameDay(date, checkOut)
          const isInRange = checkIn && (hoverDate || checkOut) && isWithinInterval(date, {
            start: checkIn,
            end: hoverDate || checkOut || checkIn
          })

          return (
            <button
              key={idx}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => handleDateMouseEnter(date)}
              onMouseLeave={handleDateMouseLeave}
              disabled={isDisabled}
              className={`
                relative h-10 w-10 p-0 text-sm font-medium rounded-md transition-all
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isDisabled ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'text-gray-900 hover:bg-blue-50 cursor-pointer'}
                ${isCheckIn ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md' : ''}
                ${isCheckOut ? 'bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-md' : ''}
                ${isInRange && isCurrentMonth && !isDisabled ? 'bg-blue-100 text-blue-900' : ''}
              `}
              title={
                isDisabled && isDateBooked(date)
                  ? 'Confirmed booking - Not available'
                  : isDisabled && isDatePending(date)
                  ? 'Pending booking - Not available'
                  : isDisabled && isBefore(date, startOfDay(new Date()))
                  ? 'Past date'
                  : format(date, 'MMMM d, yyyy')
              }
            >
              {format(date, 'd')}
              {isDateBooked(date) && isCurrentMonth && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full"></div>
              )}
              {isDatePending(date) && !isDateBooked(date) && isCurrentMonth && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-600"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
          <span>Your stay</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>Pending</span>
        </div>
      </div>

      {/* Action buttons */}
      {checkIn && checkOut && (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-600">Check-in</p>
              <p className="font-medium text-gray-900">{format(checkIn, 'EEE, MMM d, yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Check-out</p>
              <p className="font-medium text-gray-900">{format(checkOut, 'EEE, MMM d, yyyy')}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              {nights} night{nights !== 1 ? 's' : ''} × €{(apartment.base_price_cents / 100).toFixed(0)}
            </span>
            <span className="text-xl font-bold text-gray-900">€{totalPrice.toFixed(2)}</span>
          </div>
          <Button onClick={confirmSelection} className="w-full" size="lg">
            Continue to Guest Details
          </Button>
        </div>
      )}

      {checkIn && !checkOut && (
        <p className="text-sm text-blue-600 text-center py-2 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block"></span>
          Now select your check-out date
        </p>
      )}

      {!checkIn && (
        <p className="text-sm text-gray-500 text-center py-2">
          Select a check-in date to begin
        </p>
      )}
    </div>
  )
}
