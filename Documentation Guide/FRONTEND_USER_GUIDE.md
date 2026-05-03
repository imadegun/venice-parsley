# Venice Parsley Booking Application - Frontend User Guide

## Overview

Venice Parsley is a luxury booking platform for artistic apartments in Venice. This guide explains how users can browse, book, and manage their stays through the intuitive web interface.

## Getting Started

### Accessing the Application

- **URL**: https://yourdomain.com
- **Supported Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support**: Fully responsive design optimized for mobile devices

### User Authentication

Users access the booking system through Supabase authentication. User accounts are required for making bookings and managing contact information.

## Browsing Apartments

### Homepage

- **Hero Section**: Featured apartment with high-quality images
- **Apartment Grid**: Overview of all available apartments
- **Search Functionality**: Filter by dates, guest count, and amenities
- **Content Sections**: About Venice Parsley, location information

**Screenshot Description**: Full-width hero image of a Venice apartment, followed by a grid of apartment cards showing key details like price, location, and amenities.

### Apartment Details Page

**URL Structure**: `/apartments/[apartment-slug]`

**Features**:
- **Image Gallery**: Multiple high-resolution photos
- **Property Details**: Size, amenities, location description
- **Pricing Information**: Per night rates, minimum stay requirements
- **Availability Calendar**: Interactive calendar showing booked dates
- **Booking Widget**: Integrated booking form on the right sidebar

**Screenshot Description**: Large image carousel at the top, detailed description below, with a fixed booking sidebar showing date picker, guest count, and total price calculation.

### Search and Filtering

- **Date Range Picker**: Select check-in and check-out dates
- **Guest Count**: Specify number of guests (1-8)
- **Price Range**: Filter by budget
- **Amenities**: Filter by specific features (WiFi, kitchen, etc.)

**Screenshot Description**: Search bar with calendar dropdown, guest selector, and filter checkboxes. Results update dynamically as filters are applied.

## Booking Process

### Step 1: Select Dates and Guests

1. Choose your preferred apartment
2. Select check-in and check-out dates using the calendar
3. Specify number of guests
4. Check real-time availability and pricing

**Screenshot Description**: Calendar interface with unavailable dates grayed out, guest dropdown menu, and price breakdown showing nightly rates and total cost.

### Step 2: Enter Guest Information

**Required Information**:
- Full name
- Email address
- Phone number
- Number of guests
- Special requests (optional)

**Screenshot Description**: Multi-step booking form with progress indicator, validation messages, and clear field labels.

### Step 3: Payment Processing

1. Review booking details and total cost
2. Click "Book Now" to proceed to payment
3. Redirected to Stripe Payment Link (secure Stripe-hosted page)
4. Complete payment with credit card or other payment methods

**Screenshot Description**: Booking summary page showing apartment details, dates, guest info, and total amount. "Book Now" button leads to Stripe's secure payment page.

### Step 4: Booking Confirmation

- **Success Page**: Confirmation email sent automatically
- **Booking Reference**: Unique booking number for reference
- **Next Steps**: Instructions for check-in, contact information

**Screenshot Description**: Green checkmark confirmation page with booking details, timeline of next steps, and contact information for questions.

## Special Features

### Multi-Language Support

- Available in multiple languages
- Automatic language detection based on browser settings
- Manual language selection in footer

### Contact Form

**Location**: `/contact`

**Features**:
- General inquiries
- Booking support
- Location information requests
- Emergency contact during stay

**Screenshot Description**: Contact form with fields for name, email, phone, message type dropdown, and message textarea.

## Mobile Experience

### Responsive Design

- **Optimized Layouts**: All features work seamlessly on mobile devices
- **Touch-Friendly**: Large buttons and easy navigation
- **Fast Loading**: Optimized images and lazy loading

### Mobile-Specific Features

- **Swipe Gestures**: Navigate image galleries with swipe
- **Calendar Picker**: Native mobile date picker
- **One-Touch Booking**: Streamlined booking process

## Troubleshooting

### Common User Issues

**1. Booking Not Available**
- Dates may be already booked
- Check minimum stay requirements
- Try different date ranges

**2. Payment Issues**
- Ensure valid credit card information
- Check internet connection during payment
- Contact support if payment fails

**3. Account Access Problems**
- Reset password via "Forgot Password" link
- Clear browser cache and cookies
- Try different browser or incognito mode

**4. Mobile Display Issues**
- Update browser to latest version
- Clear browser cache
- Try rotating device or using landscape mode

### Getting Help

- **Contact Form**: Available 24/7 for inquiries
- **Email Support**: Response within 24 hours
- **Phone Support**: Available during business hours (Italian time zone)
- **FAQ Section**: Common questions and answers

## Terms and Policies

### Booking Policies

- **Cancellation**: Free cancellation up to 48 hours before check-in
- **Check-in/Check-out**: Flexible times, contact host for exact details
- **Pets**: Must be approved in advance
- **Smoking**: Non-smoking properties
- **Minimum Stay**: 2 nights minimum for all apartments

### Privacy Policy

- Personal data used only for booking processing
- Secure payment processing through Stripe
- Data retention for legal and operational purposes
- Right to access and delete personal data

### Accessibility

- WCAG 2.1 AA compliant
- Screen reader compatible
- Keyboard navigation support
- High contrast mode available

</content>
<parameter name="filePath">FRONTEND_USER_GUIDE.md