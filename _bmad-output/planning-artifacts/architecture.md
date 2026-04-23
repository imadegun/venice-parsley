# Venice Parcley - Architecture Document

**Project:** Venice Parcley
**Version:** 1.0
**Date:** 2026-04-09
**Status:** Draft

---

## 1. Project Context

### 1.1 Overview

Venice Parcley is a premium resort and apartments booking platform built as a modern web application. The system enables guests to discover, browse, and book premium transportation services (cars, taxis, chauffeurs) with an elegant, mobile-first experience.

### 1.2 Technology Strategy

**Primary Decision: Next.js Full-Stack Framework**

We will use Next.js as a unified full-stack solution that combines frontend and backend capabilities. This architectural choice optimizes for:

- **Developer Velocity**: Single codebase, shared types, unified deployment
- **Performance**: Server-side rendering, image optimization, edge caching
- **Scalability**: Serverless functions, automatic scaling, global CDN
- **Type Safety**: End-to-end TypeScript with shared types

### 1.3 Constraints

| Constraint | Impact | Decision |
|------------|--------|----------|
| Single developer team | Limited bandwidth | Minimize complexity, use managed services |
| MVP timeline (4-6 weeks) | Fast delivery needed | Use proven patterns, avoid custom solutions |
| Budget (free-tier focus) | Cost optimization | Use Supabase free tier, Vercel hobby |
| Browser support | Compatibility | Last 2 versions only |

---

## 2. Starter Template

### 2.1 Selected Template

**Next.js 14 with App Router**

### 2.2 Template Features

| Category | Feature | Status |
|----------|---------|--------|
| Framework | Next.js 14 App Router | ✓ |
| Language | TypeScript (strict mode) | ✓ |
| Styling | Tailwind CSS 3.4 | ✓ |
| Components | shadcn/ui components | ✓ |
| Forms | React Hook Form + Zod | ✓ |
| State | Zustand for client state | ✓ |
| Database | Supabase (PostgreSQL) | ✓ |
| Auth | Supabase Auth | ✓ |
| Deployment | Vercel (configured) | ✓ |

### 2.3 Why This Stack?

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 14 App Router                    │
├─────────────────────────────────────────────────────────────────┤
│  Server Components  │  Server Actions  │  Route Handlers       │
│  (default)          │  (form actions)  │  (API routes)         │
├─────────────────────────────────────────────────────────────────┤
│                     Supabase Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL   │  │ Auth         │  │ Realtime             │  │
│  │ Database     │  │ (JWT)        │  │ Subscriptions        │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Stripe       │  │ Resend       │  │ Vercel               │  │
│  │ Payments     │  │ Email        │  │ Hosting/Edge         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Co-location**: UI and data fetching in same files
- **Streaming**: Progressive loading with Suspense
- **Caching**: Automatic fetch caching + revalidation
- **Forms**: Native form actions with progressive enhancement

---

## 3. Core Decisions

### 3.1 Database Schema

```sql
-- Core Tables

-- Menu items for navigation and page content
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT UNIQUE NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  content TEXT, -- Rich text/HTML content for editable pages
  map_embed TEXT, -- Google Maps embed code for Contact page
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Theme settings for UI customization
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transportation services
CREATE TABLE transportation_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  features TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drivers
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  specialties TEXT[],
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Treatments
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  benefits TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Therapists
CREATE TABLE therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  specialties TEXT[],
  license_number TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction table: which therapists can perform which treatments
CREATE TABLE treatment_therapists (
  treatment_id UUID REFERENCES treatments(id),
  therapist_id UUID REFERENCES therapists(id),
  PRIMARY KEY (treatment_id, therapist_id)
);

-- Availability slots for therapists
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID REFERENCES therapists(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID REFERENCES auth.users(id),
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  treatment_id UUID REFERENCES treatments(id),
  therapist_id UUID REFERENCES therapists(id),
  slot_id UUID REFERENCES availability_slots(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed', -- confirmed, cancelled, completed
  total_cents INTEGER NOT NULL,
  loyalty_points INTEGER DEFAULT 0,
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Loyalty points tracking
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  points INTEGER NOT NULL,
  type TEXT NOT NULL, -- earned, redeemed
  booking_id UUID REFERENCES bookings(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_menu_items_order ON menu_items(order_index);
CREATE INDEX idx_menu_items_active ON menu_items(is_active);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_slots_therapist_date ON availability_slots(therapist_id, date);
CREATE INDEX idx_treatments_category ON treatments(category);
CREATE INDEX idx_treatments_active ON treatments(is_active);
```

### 3.2 API Design

#### Public Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/treatments` | GET | List all treatments |
| `/api/treatments/[slug]` | GET | Get treatment details |
| `/api/availability` | GET | Check slots for date/treatment |
| `/api/booking` | POST | Create new booking |

#### Protected Routes (Guest/Member)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings` | GET | List user's bookings |
| `/api/bookings/[id]` | GET | Get booking details |
| `/api/bookings/[id]` | PATCH | Modify booking |
| `/api/bookings/[id]` | DELETE | Cancel booking |
| `/api/profile` | GET/PATCH | User profile |

#### Admin Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/bookings` | GET | List all bookings (with filters) |
| `/api/admin/bookings/[id]` | PATCH | Update booking |
| `/api/admin/treatments` | GET/POST | Manage treatments |
| `/api/admin/treatments/[id]` | PATCH/DELETE | Update treatment |
| `/api/admin/availability` | GET/POST | Manage slots |
| `/api/admin/therapists` | GET/POST | Manage therapists |

### 3.3 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Authentication Flow                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Guest ──────────────────────────────────────────────────────── │
│    │                                                           │
│    ├── Sign Up ──> Email/Password ──> Email Verification       │
│    │                   │                                        │
│    │                   ▼                                        │
│    │            Supabase Auth                                  │
│    │            (JWT issued)                                   │
│    │                                                           │
│    ├── Login ────> Validate ────> JWT + Refresh Token          │
│    │                          │                                │
│    │                          ▼                                │
│    │                   Store in cookies                        │
│    │                   (httpOnly, secure)                      │
│    │                                                           │
│    └── Protected Route                                         │
│            │                                                   │
│            ▼                                                   │
│    Middleware checks JWT                                       │
│    ├── Valid ────> Allow access                                │
│    └── Invalid ──> Redirect to login                           │
│                                                                  │
│  Admin ──────────────────────────────────────────────────────── │
│    │                                                           │
│    └── Additional role check via custom claim                  │
│            │                                                   │
│            ▼                                                   │
│    hasRole('admin') ? allow : deny                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                        State Architecture                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Server State (React Server Components)                          │
│  ├── Treatment data (fetched on server)                         │
│  ├── Booking data (for authenticated users)                    │
│  └── SEO metadata                                              │
│                                                                  │
│  Client State (Zustand)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ authStore                                                  │   │
│  │ ├── user: User | null                                    │   │
│  │ ├── isAdmin: boolean                                     │   │
│  │ └── isLoading: boolean                                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ bookingStore                                               │   │
│  │ ├── selectedTreatment: Treatment | null                   │   │
│  │ ├── selectedDate: Date | null                            │   │
│  │ ├── selectedSlot: Slot | null                            │   │
│  │ └── guestDetails: GuestDetails | null                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ uiStore                                                    │   │
│  │ ├── mobileMenuOpen: boolean                              │   │
│  │ ├── bookingModalOpen: boolean                            │   │
│  │ └── notifications: Notification[]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Form State (React Hook Form + Zod)                             │
│  ├── Booking form validation                                    │
│  ├── Contact form validation                                    │
│  └── Login/Register validation                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Patterns

### 4.1 Component Architecture

```
components/
├── ui/                    # Base UI components (shadcn)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── layout/                # Layout components
│   ├── header.tsx
│   ├── footer.tsx
│   ├── mobile-nav.tsx
│   └── container.tsx
├── transportation/       # Transportation-specific
│   ├── service-card.tsx
│   ├── service-grid.tsx
│   ├── service-filter.tsx
│   └── service-detail.tsx
├── booking/               # Booking-specific
│   ├── date-picker.tsx
│   ├── time-slots.tsx
│   ├── booking-form.tsx
│   ├── booking-summary.tsx
│   └── booking-confirmation.tsx
├── auth/                  # Authentication
│   ├── login-form.tsx
│   ├── register-form.tsx
│   └── profile-form.tsx
└── admin/                 # Admin-specific
    ├── dashboard.tsx
    ├── booking-table.tsx
    └── treatment-form.tsx
```

### 4.2 Data Fetching Patterns

**Server Components (Default)**
```typescript
// app/treatments/page.tsx
async function TreatmentsPage() {
  const treatments = await getTreatments();
  return <TreatmentGrid treatments={treatments} />;
}
```

**Client Components (Interactive)**
```typescript
// components/booking/date-picker.tsx
'use client';

export function DatePicker() {
  const [date, setDate] = useState<Date | null>(null);
  // Interactive calendar logic
}
```

**Server Actions (Form Mutations)**
```typescript
// app/booking/actions.ts
'use server';

export async function createBooking(formData: FormData) {
  const booking = await db.booking.create({
    data: parseBookingForm(formData)
  });
  revalidatePath('/bookings');
  return booking;
}
```

### 4.3 Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                        Error Handling Strategy                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Client Errors (4xx)                                            │
│  ├── Validation errors → Show inline field errors              │
│  ├── Not found → 404 page with navigation                      │
│  └── Unauthorized → Redirect to login                          │
│                                                                  │
│  Server Errors (5xx)                                            │
│  ├── Database errors → Log + generic error message              │
│  ├── External service errors → Retry with backoff               │
│  └── Unexpected errors → Sentry + error boundary                │
│                                                                  │
│  User Feedback                                                  │
│  ├── Toast notifications for non-blocking errors               │
│  ├── Error pages for critical failures                          │
│  └── Loading states during async operations                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Validation Strategy

```typescript
// schemas/booking.ts
import { z } from 'zod';

export const bookingSchema = z.object({
  treatmentId: z.string().uuid(),
  slotId: z.string().uuid(),
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
```

---

## 5. Project Structure

```
villa-spa/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx             # Homepage
│   │   ├── treatments/
│   │   │   ├── page.tsx         # Treatment listing
│   │   │   └── [slug]/page.tsx  # Treatment detail
│   │   └── about/page.tsx
│   ├── (auth)/                  # Auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/             # Protected pages
│   │   ├── bookings/page.tsx    # My bookings
│   │   ├── profile/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/                 # Admin pages
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   ├── bookings/page.tsx
│   │   │   ├── treatments/page.tsx
│   │   │   └── availability/page.tsx
│   │   └── layout.tsx
│   ├── api/                     # API routes
│   │   ├── treatments/route.ts
│   │   ├── booking/route.ts
│   │   ├── bookings/route.ts
│   │   └── admin/
│   ├── layout.tsx               # Root layout
│   ├── globals.css
│   └── error.tsx                # Root error boundary
├── components/                   # React components
├── lib/                          # Utilities
│   ├── db.ts                    # Database client
│   ├── auth.ts                  # Auth helpers
│   ├── stripe.ts                # Stripe client
│   ├── email.ts                 # Email service
│   └── utils.ts                 # General utilities
├── schemas/                      # Zod schemas
│   ├── booking.ts
│   ├── treatment.ts
│   └── auth.ts
├── stores/                       # Zustand stores
│   ├── auth-store.ts
│   ├── booking-store.ts
│   └── ui-store.ts
├── types/                        # TypeScript types
│   ├── database.ts              # Generated from Supabase
│   └── api.ts
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables
├── next.config.js
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## 6. Validation

### 6.1 Architecture Checklist

| Category | Item | Status |
|----------|------|--------|
| **Database** | Schema supports all FRs | ✓ |
| | Indexes for common queries | ✓ |
| | RLS policies defined | ⏳ |
| **API** | REST endpoints for all operations | ✓ |
| | Error responses standardized | ✓ |
| | Rate limiting configured | ⏳ |
| **Auth** | JWT-based authentication | ✓ |
| | Role-based access control | ✓ |
| | Session management | ✓ |
| **Frontend** | Server/Client component split | ✓ |
| | Form validation with Zod | ✓ |
| | Loading/error states | ⏳ |
| **External Services** | Stripe integration | ✓ |
| | Email service integration | ✓ |
| | Error handling for failures | ⏳ |

### 6.2 Known Gaps

| Gap | Impact | Resolution |
|-----|--------|------------|
| RLS policies | Security | Define before launch |
| Rate limiting | Performance | Add Vercel KV or Upstash |
| Loading states | UX | Implement Suspense boundaries |
| Error boundaries | UX | Add error.tsx to route groups |

### 6.3 Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Supabase quota exceeded | Low | High | Monitor usage, upgrade plan |
| Stripe webhook failures | Medium | Medium | Retry queue, email alerts |
| Cold starts on serverless | Low | Low | Vercel caching |

---

## Appendix

### A. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### B. Deployment Configuration

```javascript
// next.config.js
module.exports = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['images.unsplash.com'],
  },
};
```

### C. Monitoring Setup

| Service | Purpose | Configuration |
|---------|---------|---------------|
| Vercel Analytics | Performance | Built-in |
| Sentry | Error tracking | npm install @sentry/nextjs |
| Supabase Dashboard | Database metrics | Built-in |
| Stripe Dashboard | Payment metrics | Built-in |
