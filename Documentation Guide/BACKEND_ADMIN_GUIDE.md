# Venice Parsley Booking Application - Backend Admin Guide

## Overview

This guide provides comprehensive instructions for administrators managing the Venice Parsley booking platform. The admin interface allows full control over apartments, bookings, users, content, and system settings.

## Accessing Admin Panel

### Login Requirements

- **URL**: `/admin`
- **Required Role**: `administrator` or `admin`
- **Authentication**: Supabase authentication with role-based access

### First-Time Setup

1. **Before deploying**, run the auto-admin trigger in Supabase SQL Editor:
   ```sql
   CREATE OR REPLACE FUNCTION public.handle_new_admin()
   RETURNS TRIGGER AS $$
   BEGIN
     IF LOWER(NEW.email) = LOWER('your-admin-email@example.com') THEN
       UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE id = NEW.id;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;

   DROP TRIGGER IF EXISTS auto_admin_on_signup ON public.profiles;
   CREATE TRIGGER auto_admin_on_signup AFTER INSERT ON public.profiles
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin();
   ```
   Replace `your-admin-email@example.com` with your actual admin email.

2. Register a user account through the frontend using that email — role is automatically set to `admin`

3. Log in at `/admin-login` and access `/admin`

> **Note**: The login URL is `/admin-login` (not `/admin/login`) to avoid redirect loop conflicts.

**Screenshot Description**: Admin login page with email/password fields, styled consistently with the main application.

## Dashboard Overview

### Main Dashboard (`/admin`)

**Key Metrics**:
- Total apartments listed
- Active bookings this month
- Total registered users
- Revenue statistics

**Quick Actions**:
- Add new apartment
- View recent bookings
- Manage users
- Edit content

**Screenshot Description**: Dashboard grid with metric cards, recent activity feed, and navigation menu to different admin sections.

### Navigation Structure

- **Apartments**: Manage property listings
- **Bookings**: View and manage reservations
- **Users**: User account management
- **Content**: CMS for website content
- **Menu**: Navigation menu configuration
- **Settings**: System-wide configuration

## Apartment Management

### Viewing Apartments (`/admin/apartments`)

**List View Features**:
- Sortable table with key information
- Search by apartment name or location
- Filter by status (active/inactive)
- Bulk actions for multiple apartments

**Columns**:
- Name, Location, Price/Night, Status, Stripe Link, Actions

**Screenshot Description**: Data table with apartment rows, search bar, filter dropdowns, and action buttons (edit, delete, view).

### Adding New Apartments (`/admin/apartments/new`)

**Required Fields**:
- **Basic Info**: Name, slug, description, location
- **Pricing**: Price per night, minimum stay, currency
- **Images**: Multiple high-resolution photos (recommended 10+ images)
- **Amenities**: Checkbox list of available features
- **Stripe Integration**: Payment Link URL from Stripe dashboard

**Advanced Settings**:
- Maximum guests
- Square meters
- Floor number
- Special notes

**Screenshot Description**: Multi-tab form with file upload for images, rich text editor for description, and Stripe URL input field.

### Editing Apartments (`/admin/apartments/[id]/edit`)

**Same form as creation with pre-filled data**

**Additional Features**:
- Image management (reorder, delete, add new)
- Booking calendar integration
- Performance metrics (views, bookings)

### Stripe Payment Link Configuration

1. **Create Payment Link in Stripe**:
   - Go to Stripe Dashboard > Payment Links
   - Set amount, currency, description
   - Configure success/failure URLs
   - Copy the generated URL

2. **Update Apartment**:
   - Paste URL in `stripe_payment_link_url` field
   - Test the link to ensure it works
   - Update pricing if changed

**Screenshot Description**: Stripe dashboard showing Payment Link creation interface, with URL copy button.

## Booking Management

### Calendar View (`/admin/bookings`)

**Features**:
- Monthly calendar display
- Color-coded bookings by status
- Hover for booking details
- Click to edit booking

**Status Types**:
- `confirmed`: Payment successful
- `pending`: Awaiting payment
- `cancelled`: Booking cancelled
- `completed`: Stay finished

**Screenshot Description**: Full calendar grid with date cells containing booking summaries, legend for status colors.

### Booking List View (`/admin/bookings/list`)

**Detailed List**:
- Sort by date, status, guest name
- Search functionality
- Export to CSV
- Bulk status updates

**Columns**:
- Booking ID, Guest Name, Apartment, Check-in/Check-out, Status, Total Amount, Actions

**Screenshot Description**: Comprehensive table with booking details, status badges, and action dropdowns.

### Managing Individual Bookings (`/admin/bookings/[id]`)

**Booking Details**:
- Guest information and contact details
- Apartment details
- Payment information
- Special requests
- Booking timeline

**Actions Available**:
- Update status
- Send confirmation email
- Cancel booking
- Add internal notes
- Contact guest

**Screenshot Description**: Detailed booking view with tabbed interface for information, timeline, and actions.

## User Management

### User List (`/admin/users`)

**Features**:
- View all registered users
- Filter by role (guest, member, admin)
- Search by name or email
- Role management

**User Roles**:
- `guest`: Default user role
- `member`: Verified user with benefits
- `admin`: Administrative access
- `administrator`: Full system access

**Screenshot Description**: User management table with role badges, registration dates, and action buttons.

### User Profile Management

**View/Edit User Details**:
- Personal information
- Booking history
- Loyalty points balance
- Role assignment

**Actions**:
- Change user role
- Reset password (send reset email)
- View user's bookings
- Deactivate account

## Content Management System (CMS)

### Content Sections (`/admin/content`)

**Available Sections**:
- Homepage hero content
- About page content
- Contact information
- Terms and conditions
- Privacy policy

**Features**:
- Rich text editor (supports formatting, images, links)
- Draft/Published status
- Version history
- Multi-language support

**Screenshot Description**: CMS interface with content section selector, WYSIWYG editor, and publish controls.

### Menu Management (`/admin/menu`)

**Navigation Configuration**:
- Add/edit menu items
- Nested menu structure
- External/internal links
- Language-specific menus

**Screenshot Description**: Drag-and-drop menu builder with item properties panel.

## System Settings

### General Settings (`/admin/settings`)

**Configurable Options**:
- Site title and description
- Contact information
- Default currency
- Booking policies
- Email templates

**Screenshot Description**: Settings form with categorized sections and save/reset buttons.

### Email Configuration

**Templates Available**:
- Booking confirmation
- Payment success/failure
- Contact form notifications
- Admin alerts

**Variables Support**: Dynamic content insertion (guest name, booking details, etc.)

## Monitoring and Analytics

### System Health

**Database Monitoring**:
- Connection status
- Query performance
- Storage usage

**External Services**:
- Stripe webhook status
- Email delivery rates
- Supabase service status

### Booking Analytics

**Key Metrics**:
- Occupancy rates by apartment
- Revenue by month/quarter
- Popular booking periods
- Guest demographics

**Reports**:
- Export booking data
- Generate financial reports
- User activity logs

## Security and Permissions

### Role-Based Access Control

**Administrator Permissions**:
- Full system access
- User management
- System configuration

**Admin Permissions**:
- Apartment and booking management
- Content editing
- Limited user management

### Data Protection

**Backup Procedures**:
- Regular database backups via Supabase
- File storage backups
- Configuration exports

**Security Measures**:
- HTTPS enforcement
- Input validation and sanitization
- SQL injection prevention via parameterized queries
- XSS protection

## Troubleshooting

### Common Admin Issues

**1. Cannot Access Admin Panel**
- Verify user role in database
- Clear browser cache
- Check authentication status

**2. Payment Link Issues**
- Confirm URL is correct and active in Stripe
- Test link independently
- Check webhook logs

**3. Content Not Updating**
- Check publish status
- Clear application cache
- Verify database connection

**4. User Role Changes Not Applying**
- Refresh user session
- Check database for role updates
- Verify RLS policies

### Maintenance Tasks

**Regular Tasks**:
- Update apartment availability
- Process booking cancellations
- Review user reports
- Monitor system performance

**Monthly Tasks**:
- Generate financial reports
- Update content and pricing
- Review user feedback
- Backup system data

## API and Integration

### Webhook Management

**Stripe Webhooks**:
- Monitor webhook delivery
- Handle failed deliveries
- Test webhook endpoints

**Configuration**:
- Webhook URL: `/api/stripe/webhook`
- Secret: Environment variable `STRIPE_WEBHOOK_SECRET`

### Email Integration

**Resend Configuration**:
- API key validation
- Delivery monitoring
- Template testing

## Best Practices

### Content Management

- Use high-quality, consistent images
- Keep descriptions engaging and informative
- Regularly update pricing and availability
- Maintain consistent branding

### Customer Service

- Respond to inquiries within 24 hours
- Keep detailed booking notes
- Follow up on completed stays
- Handle cancellations professionally

### System Maintenance

- Monitor error logs regularly
- Keep dependencies updated
- Test new features in staging environment
- Maintain comprehensive backups

## Support and Resources

### Documentation Links

- Supabase documentation for database management
- Stripe documentation for payment processing
- Next.js documentation for application updates

### Emergency Contacts

- Development team for technical issues
- Hosting provider for infrastructure problems
- Payment processor support

### Training Resources

- Video tutorials for new admin users
- Knowledge base articles
- Best practices guide

## Future Enhancements

### Planned Features

- Advanced analytics dashboard
- Automated email campaigns
- Mobile admin application
- API for third-party integrations
- Advanced reporting tools</content>
<parameter name="filePath">BACKEND_ADMIN_GUIDE.md