# Venice Parcley - Epics and User Stories

**Project:** Venice Parcley
**Version:** 1.0
**Date:** 2026-04-09

---

## Epic Overview

| Epic ID | Title | Priority | Story Points | Sprint |
|---------|-------|----------|--------------|--------|
| EPIC-1 | Guest Transportation Discovery | P0 | 13 | Sprint 1 |
| EPIC-2 | Booking Flow | P0 | 21 | Sprint 2 |
| EPIC-3 | Member Experience | P1 | 16 | Sprint 3 |
| EPIC-4 | Admin Management | P1 | 18 | Sprint 4 |
| EPIC-5 | Content Management | P0 | 13 | Sprint 1 |
| EPIC-6 | UI/UX Enhancements | P1 | 6 | Sprint 4 |
| EPIC-7 | System Operations | P0 | 8 | Sprint 1-2 |

**Total Estimated Effort:** 95 story points

---

## EPIC-1: Guest Transportation Discovery

**Description:** Allow guests to browse, search, and filter premium transportation services to find options that match their needs.

### User Stories

#### STORY-1.1: Browse Transportation Services
```
As a: Guest
I want: To see all available transportation services on a listing page
So that: I can discover transportation options at Venice Parcley

Acceptance Criteria:
- [ ] Services display with image, name, category, capacity, price
- [ ] Grid layout with responsive design (mobile-first)
- [ ] Lazy loading for performance
- [ ] Empty state when no services available

Story Points: 3
Priority: P0
```

#### STORY-1.2: Filter Treatments
```
As a: Guest
I want: To filter treatments by category, duration, and price
So that: I can quickly find treatments that match my preferences

Acceptance Criteria:
- [ ] Filter by category (Massage, Facial, Body, Packages)
- [ ] Filter by duration range (30, 60, 90, 120 min)
- [ ] Filter by price range (slider or preset)
- [ ] Multiple filters can be combined
- [ ] Filter state persists during session

Story Points: 5
Priority: P0
```

#### STORY-1.3: View Treatment Details
```
As a: Guest
I want: To view detailed information about a treatment
So that: I can make an informed booking decision

Acceptance Criteria:
- [ ] Full description with benefits
- [ ] High-quality image gallery
- [ ] Duration and price clearly displayed
- [ ] Preparation instructions
- [ ] Related treatments shown

Story Points: 3
Priority: P0
```

#### STORY-1.4: Search Treatments
```
As a: Guest
I want: To search treatments by keyword
So that: I can find specific services quickly

Acceptance Criteria:
- [ ] Search by treatment name
- [ ] Search by description text
- [ ] Instant search results (debounced)
- [ ] Highlight matching text in results

Story Points: 2
Priority: P1
```

---

## EPIC-2: Booking Flow

**Description:** Enable guests to check availability and complete treatment bookings with confirmation.

### User Stories

#### STORY-2.1: Check Treatment Availability
```
As a: Guest
I want: To see available time slots for a treatment
So that: I can choose a convenient appointment time

Acceptance Criteria:
- [ ] Calendar date picker for date selection
- [ ] Display available time slots for selected date
- [ ] Show therapist options
- [ ] Real-time availability (no double-booking)
- [ ] Grey out unavailable slots

Story Points: 5
Priority: P0
```

#### STORY-2.2: Complete Guest Booking
```
As a: Guest
I want: To enter my details and complete a booking
So that: I can reserve my spa appointment

Acceptance Criteria:
- [ ] Form fields: name, email, phone, special requests
- [ ] Client-side validation with error messages
- [ ] Booking summary before confirmation
- [ ] Payment via Stripe (card details)
- [ ] Loading state during processing
- [ ] Success/error feedback

Story Points: 8
Priority: P0
```

#### STORY-2.3: Receive Booking Confirmation
```
As a: Guest
I want: To receive confirmation of my booking
So that: I have proof of my reservation

Acceptance Criteria:
- [ ] On-screen confirmation with booking ID
- [ ] Email sent immediately with booking details
- [ ] SMS sent to phone number (if provided)
- [ ] Include: treatment, date, time, location, cancellation policy

Story Points: 3
Priority: P0
```

#### STORY-2.4: View My Bookings
```
As a: Guest
I want: To view my upcoming and past bookings
So that: I can manage my spa appointments

Acceptance Criteria:
- [ ] List of upcoming bookings with details
- [ ] List of past bookings (history)
- [ ] Filter by status (confirmed, cancelled, completed)
- [ ] Sort by date (upcoming first)
- [ ] Empty state when no bookings

Story Points: 3
Priority: P1
```

#### STORY-2.5: Cancel Booking
```
As a: Guest
I want: To cancel my booking
So that: I can change my plans if needed

Acceptance Criteria:
- [ ] Cancel button on booking details
- [ ] Confirmation dialog with cancellation policy
- [ ] Refund processing (per policy rules)
- [ ] Update loyalty points (deduct earned)
- [ ] Email notification of cancellation
- [ ] Status updated to "cancelled"

Story Points: 2
Priority: P1
```

---

## EPIC-3: Member Experience

**Description:** Provide registered members with enhanced features including saved preferences, loyalty program, and faster checkout.

### User Stories

#### STORY-3.1: Member Registration & Login
```
As a: Guest
I want: To create an account and log in
So that: I can access member features

Acceptance Criteria:
- [ ] Registration form: name, email, password
- [ ] Email verification required
- [ ] Login with email/password
- [ ] "Remember me" option
- [ ] Password reset via email
- [ ] Session persistence (stay logged in)

Story Points: 5
Priority: P0
```

#### STORY-3.2: Member Profile Management
```
As a: Member
I want: To manage my profile information
So that: My details are up to date

Acceptance Criteria:
- [ ] View/edit name, email, phone
- [ ] Update notification preferences
- [ ] Change password
- [ ] Delete account (with confirmation)

Story Points: 3
Priority: P1
```

#### STORY-3.3: Saved Preferences
```
As a: Member
I want: To save my preferred therapist and time slots
So that: I can book faster

Acceptance Criteria:
- [ ] Save preferred therapist (optional)
- [ ] Save preferred time of day
- [ ] Saved preferences used as defaults
- [ ] Easy update in profile settings

Story Points: 2
Priority: P1
```

#### STORY-3.4: Quick Checkout
```
As a: Member
I want: To book with pre-filled details
So that: I can complete bookings faster

Acceptance Criteria:
- [ ] Auto-fill name, email, phone from profile
- [ ] Option to use saved preferences
- [ ] Streamlined 2-step checkout (select + confirm)

Story Points: 3
Priority: P0
```

#### STORY-3.5: Loyalty Points System
```
As a: Member
I want: To earn and redeem loyalty points
So that: I can get rewards for my bookings

Acceptance Criteria:
- [ ] Earn points per booking (1 point per $1)
- [ ] View points balance in dashboard
- [ ] Points history (earned/redeemed)
- [ ] Redeem points at checkout (100 points = $1)
- [ ] Points expiry after 12 months

Story Points: 5
Priority: P1
```

#### STORY-3.6: Member Exclusives
```
As a: Member
I want: To access exclusive deals and early booking
So that: I can get better value

Acceptance Criteria:
- [ ] Members-only pricing displayed
- [ ] Early access to new treatments
- [ ] Special promotions badge
- [ ] Email notifications for exclusive offers

Story Points: 2
Priority: P2
```

---

## EPIC-4: Admin Management

**Description:** Provide spa staff with tools to manage bookings, treatments, therapists, and availability.

### User Stories

#### STORY-4.1: Admin Dashboard
```
As an: Admin
I want: To see an overview of daily operations
So that: I can monitor business performance

Acceptance Criteria:
- [ ] Today's booking count
- [ ] Revenue summary (today, week, month)
- [ ] Popular treatments chart
- [ ] Upcoming appointments list
- [ ] Quick actions (add booking, block time)

Story Points: 3
Priority: P0
```

#### STORY-4.2: Manage All Bookings
```
As an: Admin
I want: To view and manage all bookings
So that: I can handle guest requests

Acceptance Criteria:
- [ ] List all bookings with filters
- [ ] Search by guest name, email, booking ID
- [ ] Filter by date range, status
- [ ] View booking details
- [ ] Update booking (change time, therapist)
- [ ] Cancel booking with reason

Story Points: 5
Priority: P0
```

#### STORY-4.3: Manage Treatments
```
As an: Admin
I want: To add, edit, and archive treatments
So that: I can keep the catalog up to date

Acceptance Criteria:
- [ ] CRUD operations for treatments
- [ ] Upload treatment images
- [ ] Set pricing and duration
- [ ] Assign therapists to treatments
- [ ] Archive (soft delete) treatments
- [ ] View treatment performance

Story Points: 5
Priority: P0
```

#### STORY-4.4: Manage Therapist Schedules
```
As an: Admin
I want: To manage therapist availability
So that: I can ensure proper coverage

Acceptance Criteria:
- [ ] View therapist schedule
- [ ] Add/edit availability blocks
- [ ] Block time off (vacation, breaks)
- [ ] Set working hours per day
- [ ] Assign therapists to treatments

Story Points: 5
Priority: P1
```

---

## EPIC-5: Content Management

**Description:** Enable administrators to manage dynamic page content for the website's menu-driven pages through a rich text editor.

### User Stories

#### STORY-5.1: Menu Item CRUD
```
As an: Admin
I want: To create, edit, and delete menu items
So that: I can manage the website navigation structure

Acceptance Criteria:
- [ ] Create menu item with label, URL (href), and display order
- [ ] Auto-generate URL-friendly slug from label
- [ ] Edit all menu item properties
- [ ] Delete menu items (with confirmation)
- [ ] Reorder menu items via drag-and-drop or order index
- [ ] Toggle active/inactive status

Story Points: 3
Priority: P0
```

#### STORY-5.2: Rich Text Content Editor
```
As an: Admin
I want: To edit page content using a rich text editor
So that: I can update website content without code changes

Acceptance Criteria:
- [ ] WYSIWYG editor (Markdown or HTML)
- [ ] Format text (bold, italic, headings, lists)
- [ ] Insert links and images
- [ ] Preview content before saving
- [ ] Auto-save draft functionality
- [ ] Content version history

Story Points: 5
Priority: P0
```

#### STORY-5.3: Page-Specific Content Management
```
As an: Admin
I want: To assign content to specific pages (About, Contact, Neighbourhood, How to Get Here)
So that: Each page displays its unique content

Acceptance Criteria:
- [ ] List all editable pages in admin panel
- [ ] Show current content status (has content / empty)
- [ ] Edit content per page via dedicated interface
- [ ] Changes reflect immediately on frontend
- [ ] System pages (apartments, login, register, admin) are excluded

Story Points: 3
Priority: P0
```

#### STORY-5.4: Map Embed Support
```
As an: Admin
I want: To embed a Google Map on the Contact page
So that: visitors can see the location

Acceptance Criteria:
- [ ] Textarea for Google Maps embed code (iframe)
- [ ] Preview of embedded map in admin
- [ ] Map displays on frontend Contact page
- [ ] Responsive map rendering
- [ ] Optional field (only show if embed code provided)

Story Points: 2
Priority: P1
```

---

## EPIC-6: UI/UX Enhancements

**Description:** Improve the visual design and user experience with better spacing, smooth animations, and modern text effects.

### User Stories

#### STORY-6.1: Container Spacing System
```
As a: Developer
I want: A configurable container spacing system
So that: I can control vertical padding across pages consistently

Acceptance Criteria:
- [ ] Container component accepts spacing prop (none, sm, md, lg, xl)
- [ ] Each spacing level maps to Tailwind py-* classes
- [ ] Default spacing is generous (lg)
- [ ] All pages use Container with appropriate spacing

Story Points: 2
Priority: P1
```

#### STORY-6.2: Header Entrance Animation
```
As a: User
I want: The header to animate smoothly on page load
So that: The interface feels dynamic and polished

Acceptance Criteria:
- [ ] Header slides down from top on page load
- [ ] Animation duration ~0.6s with ease-out
- [ ] Fade-in effect combined with slide
- [ ] GPU-accelerated (transform, opacity only)
- [ ] Respects prefers-reduced-motion

Story Points: 2
Priority: P1
```

#### STORY-6.3: Title Text Animations
```
As a: User
I want: Page titles to animate smoothly when they appear
So that: The content feels modern and engaging

Acceptance Criteria:
- [ ] Titles fade in and slide up
- [ ] Animation duration ~0.8s with ease-out
- [ ] Staggered delays for multi-section pages
- [ ] Applied to all major page titles
- [ ] Accessible (respects motion preferences)

Story Points: 2
Priority: P1
```

---

## EPIC-7: System Operations

**Description:** Technical foundation for email notifications, error handling, and system reliability.

### User Stories

#### STORY-7.1: Email Notifications
```
As the: System
I want: To send email notifications for key events
So that: Guests stay informed

Acceptance Criteria:
- [ ] Booking confirmation email
- [ ] Booking cancellation email
- [ ] Booking reminder (24h before)
- [ ] Professional email templates
- [ ] Handle email delivery failures gracefully

Story Points: 3
Priority: P0
```

#### STORY-7.2: Error Handling & Logging
```
As the: System
I want: To handle errors gracefully and log issues
So that: We can debug problems

Acceptance Criteria:
- [ ] User-friendly error messages
- [ ] Error boundaries for React
- [ ] Sentry integration for error tracking
- [ ] API error logging
- [ ] Failed operation retry logic

Story Points: 3
Priority: P0
```

#### STORY-7.3: Security Measures
```
As the: System
I want: To protect user data and prevent abuse
So that: We maintain trust and compliance

Acceptance Criteria:
- [ ] Input sanitization on all forms
- [ ] SQL injection prevention
- [ ] CSRF protection
- [ ] Rate limiting on API endpoints
- [ ] Secure HTTP headers
- [ ] Environment variable security

Story Points: 2
Priority: P0
```

---

## Story Prioritization Matrix

```
                     Low Effort          High Effort
                ┌────────────────────┬────────────────────┐
    High       │  STORY-1.4 Search   │  STORY-2.2 Booking  │
    Value      │  STORY-3.3 Prefs    │  STORY-3.5 Points   │
                │  STORY-3.6 Exclusive│  STORY-4.4 Schedule │
                ├────────────────────┼────────────────────┤
    Low        │  STORY-2.5 Cancel   │  STORY-4.1 Dashboard│
    Value      │  STORY-3.2 Profile  │  STORY-4.2 Bookings │
                │                     │  STORY-4.3 Treatments│
                └────────────────────┴────────────────────┘
```

---

## Sprint Planning

### Sprint 1: Foundation (26 points)
- STORY-1.1 Browse Treatments
- STORY-1.2 Filter Treatments
- STORY-1.3 Treatment Details
- STORY-7.1 Email Notifications
- STORY-7.2 Error Handling
- STORY-7.3 Security Measures
- STORY-5.1 Menu Item CRUD
- STORY-5.2 Rich Text Content Editor

### Sprint 2: Booking (24 points)
- STORY-2.1 Check Availability
- STORY-2.2 Complete Guest Booking
- STORY-2.3 Receive Confirmation
- STORY-3.1 Member Registration & Login
- STORY-5.3 Page-Specific Content Management

### Sprint 3: Members (19 points)
- STORY-2.4 View My Bookings
- STORY-2.5 Cancel Booking
- STORY-3.2 Profile Management
- STORY-3.3 Saved Preferences
- STORY-3.4 Quick Checkout
- STORY-3.5 Loyalty Points

### Sprint 4: Admin (20 points)
- STORY-4.1 Admin Dashboard
- STORY-4.2 Manage All Bookings
- STORY-4.3 Manage Treatments
- STORY-4.4 Manage Therapist Schedules
- STORY-3.6 Member Exclusives
- STORY-6.1 Container Spacing System
- STORY-6.2 Header Entrance Animation
- STORY-6.3 Title Text Animations

---

## Definition of Done (per story)

- [ ] Code implemented and follows style guide
- [ ] Unit tests written (>80% coverage)
- [ ] Feature tested in staging environment
- [ ] No critical or high-severity bugs open
- [ ] Acceptance criteria all checked
- [ ] Documentation updated
- [ ] PR reviewed and merged to main

---

**End of Epics and Stories Document**
