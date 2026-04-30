import { requireRole } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingCalendar } from '@/components/admin/booking-calendar'
import { CheckInOutManager } from '@/components/admin/check-in-out-manager'
import { Calendar, Check } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/animations/scroll-reveal'

export default async function AdminCalendarPage() {
  await requireRole(['admin', 'administrator'])
  const supabase = createServerSupabaseClient()

  const [{ data: bookings }, { data: apartments }] = await Promise.all([
    supabase
      .from('bookings')
      .select(`
        *,
        apartments:apartment_id (
          id,
          name
        )
      `)
      .order('check_in_date', { ascending: true }),
    supabase
      .from('apartments')
        .select('id, name')
      .order('name', { ascending: true }),
  ])

  return (
    <Container spacing="xxl">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <ScrollReveal direction="up" duration={1000} delay={0}>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-josefin tracking-tight">
              Calendar & Booking Status
            </h1>
            <p className="text-gray-500 text-sm sm:text-base max-w-2xl">
              View and manage booking statuses, check-ins, and check-outs. Track room occupancy and streamline guest arrivals and departures.
            </p>
          </div>
        </ScrollReveal>

        {/* Tabs Section - Tabs on top, content below */}
        <ScrollReveal direction="up" duration={1000} delay={100}>
          <Tabs defaultValue="calendar" className="w-full flex flex-col gap-4">
            {/* Tabs bar - always on top */}
            <div className="w-full">
              <TabsList className="w-full h-12 bg-gray-100 rounded-lg p-1">
                <TabsTrigger
                  value="calendar"
                  className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-all"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Booking Calendar</span>
                  <span className="sm:hidden">Calendar</span>
                </TabsTrigger>
                <TabsTrigger
                  value="check-in-out"
                  className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md transition-all"
                >
                  <Check className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Check-In / Check-Out</span>
                  <span className="sm:hidden">Check-In</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab content panels - always below tabs */}
            <div className="w-full">
              <TabsContent value="calendar">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <BookingCalendar
                    bookings={bookings || []}
                    apartments={apartments || []}
                  />
                </div>
              </TabsContent>

              <TabsContent value="check-in-out">
                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
                  <CheckInOutManager
                    bookings={bookings || []}
                    apartments={apartments || []}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </ScrollReveal>
      </div>
    </Container>
  )
}
