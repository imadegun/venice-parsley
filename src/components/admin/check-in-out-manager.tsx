'use client'

import { useState, useTransition } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { processCheckInOut } from '@/app/admin/bookings/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  LogIn,
  LogOut,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react'
import type { Database } from '@/types/database'

type Booking = Database['public']['Tables']['bookings']['Row']
type Apartment = Database['public']['Tables']['apartments']['Row']

interface BookingWithApartment extends Booking {
  apartments: Pick<Apartment, 'id' | 'name' | 'slug'> | null
}

interface CheckInOutManagerProps {
  bookings: BookingWithApartment[]
  apartments: Pick<Apartment, 'id' | 'name' | 'slug'>[]
  apartmentId?: string
  date?: Date
}

export function CheckInOutManager({ bookings, apartments, apartmentId, date }: CheckInOutManagerProps) {
  const [processing, setProcessing] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCheckInOut = (bookingId: string, type: 'check-in' | 'check-out') => {
    setError(null)
    setSuccess(null)
    setProcessing(bookingId)

    startTransition(async () => {
      try {
        await processCheckInOut(bookingId, type)
        setSuccess(`${type === 'check-in' ? 'Check-in' : 'Check-out'} processed successfully`)
        window.location.reload()
      } catch (err) {
        setError(err instanceof Error ? err.message : `Failed to process ${type}`)
      } finally {
        setProcessing(null)
      }
    })
  }

  const getApartmentName = (apt: any): string => {
    if (!apt?.name) return 'Unknown'
    if (typeof apt.name === 'object') {
      return apt.name.en || apt.name.it || 'Apartment'
    }
    return apt.name
  }

  const getGuestName = (booking: any): string => {
    if (booking.contact_info && typeof booking.contact_info === 'object' && 'guest_name' in booking.contact_info) {
      return (booking.contact_info as any).guest_name || 'N/A'
    }
    return 'N/A'
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')

  const checkInBookings = confirmedBookings.filter(booking => {
    if (!booking.check_in_date) return false
    const targetDate = date || new Date()
    const checkInDate = parseISO(booking.check_in_date)
    return isSameDay(checkInDate, targetDate) && !booking.check_in_actual
  })

  const checkOutBookings = confirmedBookings.filter(booking => {
    if (!booking.check_out_date) return false
    const targetDate = date || new Date()
    const checkOutDate = parseISO(booking.check_out_date)
    return isSameDay(checkOutDate, targetDate) && booking.check_in_actual && !booking.check_out_actual
  })

  const activeBookings = confirmedBookings.filter(booking => {
    if (!booking.check_in_date || !booking.check_out_date) return false
    const today = date || new Date()
    const checkInDate = parseISO(booking.check_in_date)
    const checkOutDate = parseISO(booking.check_out_date)
    return booking.check_in_actual && !booking.check_out_actual && today >= checkInDate && today <= checkOutDate
  })

  const targetDate = date || new Date()

  const renderBookingCard = (booking: any, actionType: 'check-in' | 'check-out' | null) => {
    const nights = booking.check_in_date && booking.check_out_date
      ? Math.ceil((parseISO(booking.check_out_date).getTime() - parseISO(booking.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return (
      <div key={booking.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-gray-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-gray-900 truncate">{getApartmentName(booking.apartments)}</h4>
                  <Badge variant="outline" className="text-xs">
                    {getGuestName(booking)}
                  </Badge>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {booking.check_in_date ? format(parseISO(booking.check_in_date), 'MMM d') : 'TBD'}
                    <span className="text-gray-400">→</span>
                    {booking.check_out_date ? format(parseISO(booking.check_out_date), 'MMM d, yyyy') : 'TBD'}
                  </span>
                  {nights > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {nights} night{nights !== 1 ? 's' : ''}
                    </span>
                  )}
                  {booking.total_guests && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      {booking.total_guests} guest{booking.total_guests !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {booking.check_in_actual && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Checked in: {format(parseISO(booking.check_in_actual), 'MMM d, h:mm a')}
                  </p>
                )}
                {booking.check_out_actual && (
                  <p className="text-xs text-violet-600 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    Checked out: {format(parseISO(booking.check_out_actual), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {actionType && (
            <div className="shrink-0">
              <Button
                onClick={() => handleCheckInOut(booking.id, actionType)}
                disabled={processing === booking.id || isPending}
                variant={actionType === 'check-in' ? 'default' : 'outline'}
                className={`w-full sm:w-auto ${
                  actionType === 'check-in' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {processing === booking.id ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
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
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderSection = (title: string, icon: React.ReactNode, iconBg: string, items: any[], actionType: 'check-in' | 'check-out' | null, emptyMessage: string) => (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">{items.length}</Badge>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(booking => renderBookingCard(booking, actionType))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Check-In / Check-Out</h2>
        <p className="text-sm text-gray-500">{format(targetDate, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700">{success}</p>
        </div>
      )}

      {/* Check-Ins */}
      {renderSection(
        'Arrivals',
        <LogIn className="h-4 w-4 text-emerald-600" />,
        'bg-emerald-50',
        checkInBookings,
        'check-in',
        'No arrivals scheduled for today'
      )}

      {/* Check-Outs */}
      {renderSection(
        'Departures',
        <LogOut className="h-4 w-4 text-orange-600" />,
        'bg-orange-50',
        checkOutBookings,
        'check-out',
        'No departures scheduled for today'
      )}

      {/* Currently Occupied */}
      {renderSection(
        'Currently Occupied',
        <Users className="h-4 w-4 text-blue-600" />,
        'bg-blue-50',
        activeBookings,
        null,
        'No rooms currently occupied'
      )}
    </div>
  )
}
