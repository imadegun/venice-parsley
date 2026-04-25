import { requireRole } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookingCalendar } from '@/components/admin/booking-calendar'
import { CheckInOutManager } from '@/components/admin/check-in-out-manager'
import { Calendar, Check } from 'lucide-react'
import { Container } from '@/components/layout/container'
import { ScrollReveal } from '@/components/animations/scroll-reveal'

export default async function AdminCalendarPage() {
  await requireRole(['admin', 'administrator'])

  return (
    <Container spacing="xxl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <ScrollReveal direction="up" duration={1000} delay={0}>
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 font-josefin tracking-tight text-left">
              Calendar & Booking Status
            </h1>
            <p className="text-gray-600 text-lg max-w-3xl">
              View and manage booking statuses, check-ins, and check-outs. Track room occupancy and streamline guest arrivals and departures.
            </p>
            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mt-4"></div>
          </div>
        </ScrollReveal>

         {/* Main Content */}
         <ScrollReveal direction="up" duration={1000} delay={200}>
           <Card className="shadow-lg border-0">
             <CardContent className="p-4 sm:p-6 md:p-8">
               <Tabs defaultValue="calendar" className="w-full">
                 <TabsList className="w-full mb-6 h-14 bg-muted/50 rounded-lg p-1">
                   <TabsTrigger 
                     value="calendar" 
                     className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-md transition-all"
                   >
                     <Calendar className="h-4 w-4 mr-2" />
                     <span className="hidden sm:inline">Booking Calendar</span>
                     <span className="sm:hidden">Calendar</span>
                   </TabsTrigger>
                   <TabsTrigger 
                     value="check-in-out" 
                     className="flex-1 h-full data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-md transition-all"
                   >
                     <Check className="h-4 w-4 mr-2" />
                     <span className="hidden sm:inline">Check-In / Check-Out</span>
                     <span className="sm:hidden">Check-In</span>
                   </TabsTrigger>
                 </TabsList>

                 <TabsContent value="calendar" className="space-y-0">
                   <Card className="border-0 shadow-sm">
                     <CardContent className="p-4 sm:p-6">
                       <div className="flex justify-center">
                         <div className="w-full max-w-[1400px] mx-auto">
                           <BookingCalendar />
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </TabsContent>

                 <TabsContent value="check-in-out" className="space-y-6">
                   <Card className="border-0 shadow-sm">
                     <CardContent className="p-4 sm:p-6">
                       <div className="flex justify-center">
                         <div className="w-full max-w-[1400px] mx-auto">
                           <CheckInOutManager />
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 </TabsContent>
               </Tabs>
             </CardContent>
           </Card>
         </ScrollReveal>
      </div>
    </Container>
  )
}
