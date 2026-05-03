# Venice Parsley Booking Application - Installation Guide

## Overview

This guide provides comprehensive instructions for installing and deploying the Venice Parsley booking application in a production environment. The application is built with Next.js 16, uses Supabase for backend services, Stripe Payment Links for payments, and Resend for email notifications.

## Technical Requirements

### System Requirements
- **Node.js**: Version 18.17.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Operating System**: Linux, macOS, or Windows (with WSL2)
- **Memory**: Minimum 1GB RAM, recommended 2GB+
- **Storage**: 500MB free space

### External Services
- **Supabase Account**: For database and authentication
- **Stripe Account**: For payment processing (Payment Links only)
- **Resend Account**: For email notifications
- **Domain**: Custom domain for production deployment

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd venice-parsley
```

### 2. Install Dependencies

```bash
npm install
```

This will install all production and development dependencies as specified in `package.json`.

### 3. Environment Configuration

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=info@veniceparsley.com
RESEND_TO_EMAIL=admin@veniceparsley.com

# Application Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Security Note**: Never commit `.env.local` to version control. Use environment variables in your deployment platform.

### 4. Database Setup

#### Supabase Project Creation

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down the project URL and API keys from the project settings
3. Enable Row Level Security (RLS) for all tables

#### Database Schema

Execute the schema from `database-schema.sql`:

1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste the contents of `database-schema.sql`
3. Run the SQL script

**Note**: The current schema includes these tables:
- `apartments` - Luxury apartment listings with pricing and features
- `bookings` - Reservation records with status tracking
- `profiles` - User profiles extending Supabase auth
- `loyalty_points` - Customer loyalty program
- `content_sections` - CMS for homepage and other content
- `content_revisions` - Version history for content
- `menu_items` - Dynamic navigation menu items
- `settings` - Application configuration settings

#### Migrations

Apply migrations in order (located in `migrations/` directory):

1. `003_create_booking_system.sql` - Core booking system tables
2. `008_add_stripe_payment_link_to_apartments.sql` - Payment Links support
3. `009_convert_multilang_columns_to_jsonb.sql` - Multilingual support
4. `010_add_actual_check_in_out_to_bookings.sql` - Check-in/out tracking
5. `011_add_documents_to_menu_items.sql` - Document management

Run each migration file in numerical order using the SQL Editor in Supabase.

#### Seed Data

After applying migrations, run the seed data to populate initial content:

1. In Supabase Dashboard, go to SQL Editor
2. Copy and paste the contents of `seed-data.sql`
3. Run the SQL script

**Note**: This will create sample apartments, menu items, settings, and content sections. Update the apartment data with your actual Payment Link URLs and images.

### 5. Stripe Payment Links Setup

1. In your Stripe Dashboard, create Payment Links for each apartment
2. Update the `apartments` table with the Payment Link URLs:
    ```sql
    UPDATE apartments SET stripe_payment_link_url = 'https://buy.stripe.com/your-payment-link' WHERE id = 'apartment-id';
    ```

3. Configure Payment Links to redirect back to your application:
    - Success URL: `https://yourdomain.com/booking/confirmation/{CHECKOUT_SESSION_ID}`
    - Cancel URL: `https://yourdomain.com/apartments/{apartment-slug}`

**Note**: Unlike traditional Stripe integration, Payment Links don't require webhook setup or API keys in your application.

## Deployment Steps

### Option 1: Vercel Deployment (Recommended)

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project" and import your GitHub repository

2. **Environment Variables**:
   - In Vercel dashboard, go to Project Settings > Environment Variables
   - Add all variables from your `.env.local` file

3. **Build Configuration**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node Version: 18.x

4. **Domain Configuration**:
   - Add your custom domain in Vercel
   - Update DNS records as instructed

5. **Deploy**:
   - Push to main branch or deploy manually
   - Vercel will automatically build and deploy

### Option 2: Manual Server Deployment

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Start Production Server**:
   ```bash
   npm start
   ```

3. **Process Manager** (Recommended):
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start npm --name "venice-parsley" -- start
   pm2 save
   pm2 startup
   ```

4. **Reverse Proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Docker Deployment

1. **Build Docker Image**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Run Container**:
   ```bash
   docker build -t venice-parsley .
   docker run -p 3000:3000 --env-file .env.local venice-parsley
   ```

## Post-Deployment Configuration

### 1. Admin User Setup

1. Register a new user account
2. In Supabase, update the user role to 'administrator':
   ```sql
   UPDATE profiles SET role = 'administrator' WHERE id = 'user-id';
   ```

### 2. Content Management

Access the admin panel at `/admin` and configure:
- Apartment listings with pricing and Payment Links (update `stripe_payment_link_url` for each apartment)
- Content sections (homepage, about, contact) - multilingual support
- Menu items with optional content and map embeds
- Site settings and theme colors

### 3. Testing

- Verify user registration and login
- Test booking flow with Payment Links (ensure redirect URLs work correctly)
- Check email notifications via Resend
- Confirm admin panel functionality and content management
- Test multilingual features (English/Italian)
- Verify apartment availability and date restrictions

## Troubleshooting

### Common Issues

**1. Build Failures**
- Ensure Node.js version is 18+
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

**2. Database Connection Issues**
- Verify Supabase URL and keys are correct
- Check RLS policies are enabled
- Ensure migrations ran successfully

**3. Payment Link Issues**
- Confirm Payment Links are active in Stripe Dashboard
- Verify Payment Link URLs are correctly stored in apartment records
- Check that success/cancel redirect URLs are properly configured in Stripe
- Ensure booking records are created before redirecting to Payment Links

**4. Email Not Sending**
- Verify Resend API key
- Check spam folder
- Confirm domain is verified in Resend

**5. Authentication Problems**
- Clear browser cache and cookies
- Check Supabase auth settings
- Verify redirect URLs in Supabase

### Performance Optimization

1. **Enable Compression**:
   - In Vercel: Automatic
   - In nginx: Add `gzip on;` to server block

2. **Database Indexing**:
   ```sql
   CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
   CREATE INDEX idx_apartments_price ON apartments(price_per_night);
   ```

3. **Caching**:
   - Implement Redis for session storage if needed
   - Use Supabase's built-in caching for static content

### Security Checklist

- [ ] Environment variables not committed to repository
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Database RLS policies active
- [ ] Admin routes protected with role-based access
- [ ] Resend API key properly configured and restricted
- [ ] Supabase service role key protected
- [ ] Payment Link URLs validated and secure
- [ ] Regular security updates for dependencies
- [ ] File upload restrictions in place (if implemented)

## Support

For additional support:
- Check application logs in deployment platform
- Review Supabase dashboard for database issues
- Monitor Stripe webhook logs
- Contact development team with specific error messages</content>
<parameter name="filePath">INSTALLATION_GUIDE.md