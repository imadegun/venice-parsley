# Booking Status Calendar Feature

## Overview
This feature implements a calendar-based booking status system that tracks the lifecycle of bookings through different statuses:

1. **Booked** - When a user books a room, the room is marked as booked for the selected date range (status = 'confirmed')
2. **Cancelled** - When a user cancels, the room becomes available again (status = 'cancelled')
3. **Occupied** - When a guest checks in, the room is marked as occupied (check_in_actual timestamp)
4. **Completed** - When a guest checks out, the room is marked as available (check_out_actual timestamp)

## Database Changes

### Migration: `010_add_actual_check_in_out_to_bookings.sql`

Added two new timestamp fields to the `bookings` table:
- `check_in_actual` - Actual check-in timestamp (when guest physically checks in)
- `check_out_actual` - Actual check-out timestamp (when guest physically checks out)

These fields allow tracking the real occupancy status of rooms beyond just the booking dates.

## Type Definitions

### `src/types/database.ts`

Updated the `bookings` table definition to include:
- `check_in_actual: string | null`
- `check_out_actual: string | null`

## Components

### 1. BookingCalendar (`src/components/admin/booking-calendar.tsx`)

A visual calendar component that displays booking statuses for each day:

**Features:**
- Color-coded day cells based on booking status
- Legend showing status colors
- Click on any day to see detailed booking information
- Shows all bookings for the selected date
- Displays check-in/check-out timestamps when available

**Status Colors:**
- 🟦 Blue - Booked (confirmed booking)
- 🟧 Orange - Occupied (checked in, not checked out)
- 🟩 Green - Completed (checked out)
- 🟥 Red - Cancelled
- ⬜ White - Available

**Usage:**
```tsx
import { BookingCalendar } from '@/components/admin/booking-calendar'

<BookingCalendar />
```

**Props:**
- `apartmentId?: string` - Filter by specific apartment
- `onDateSelect?: (date: Date, bookings: Booking[]) => void` - Callback when date is selected

### 2. CheckInOutManager (`src/components/admin/check-in-out-manager.tsx`)

A management interface for processing guest check-ins and check-outs:

**Features:**
- Shows today's check-ins (guests arriving today)
- Shows today's check-outs (guests departing today)
- Shows currently occupied rooms
- One-click check-in/check-out processing
- Real-time status updates

**Usage:**
```tsx
import { CheckInOutManager } from '@/components/admin/check-in-out-manager'

<CheckInOutManager />
```

**Props:**
- `apartmentId?: string` - Filter by specific apartment
- `date?: Date` - Show check-ins/check-outs for specific date (defaults to today)

### 3. Admin Calendar Page (`src/app/admin/calendar/page.tsx`)

Main calendar page with tabbed interface:
- **Booking Calendar** tab - Visual calendar view
- **Check-In / Check-Out** tab - Management interface

**Access:** `/admin/calendar`

## How It Works

### Booking Lifecycle

1. **Booking Created** → Status: `confirmed`
   - Room is marked as "Booked" on calendar
   - Dates are reserved

2. **Guest Checks In** → `check_in_actual` timestamp set
   - Room status changes to "Occupied"
   - Orange indicator on calendar

3. **Guest Checks Out** → `check_out_actual` timestamp set
   - Room status changes to "Completed"
   - Green indicator on calendar
   - Room becomes available for new bookings

4. **Booking Cancelled** → Status: `cancelled`
   - Room becomes available
   - Red indicator on calendar

### API Integration

The check-in/out functionality updates the booking record via Supabase:

```typescript
// Check-in
await supabase
  .from('bookings')
  .update({ check_in_actual: new Date().toISOString() })
  .eq('id', bookingId)

// Check-out
await supabase
  .from('bookings')
  .update({ check_out_actual: new Date().toISOString() })
  .eq('id', bookingId)
```

## Benefits

1. **Real-time Occupancy Tracking** - Know exactly which rooms are occupied at any time
2. **Streamlined Operations** - Quick check-in/check-out processing
3. **Visual Planning** - Calendar view for easy management
4. **Historical Data** - Track actual guest stays vs. bookings
5. **Better Guest Experience** - Faster check-in/out process

## Future Enhancements

- Automated check-out reminders
- Occupancy reports and analytics
- Integration with housekeeping schedules
- Mobile check-in/out via QR codes
- Automated status transitions based on time
