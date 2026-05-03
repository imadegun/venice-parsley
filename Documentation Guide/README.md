# Venice Parsley - Booking Application

A modern, full-stack booking application for luxury artistic apartments in Venice, built with Next.js 16, Supabase, and Stripe Payment Links.

## 🚀 Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd venice-parsley
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Database Setup**
   ```bash
   # Run the installation guide for complete setup
   # See INSTALLATION_GUIDE.md for detailed instructions
   ```

4. **Development**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── apartments/        # Apartment detail pages
│   │   ├── booking/           # Booking flow pages
│   │   └── bookings/          # User bookings page
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── booking/          # Booking flow components
│   │   └── ui/               # Reusable UI components
│   └── lib/                  # Utility libraries
├── migrations/               # Database migrations
├── database-schema.sql       # Complete database schema
├── seed-data.sql            # Initial seed data
├── INSTALLATION_GUIDE.md    # Production deployment guide
├── FRONTEND_USER_GUIDE.md   # User manual
└── BACKEND_ADMIN_GUIDE.md   # Admin documentation
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Payment Links
- **Email**: Resend
- **Styling**: Tailwind CSS, shadcn/ui components
- **Language**: English/Italian (i18next)

## 🎯 Key Features

- **User Authentication**: Supabase Auth with role-based access
- **Apartment Management**: CRUD operations for luxury apartments
- **Booking System**: Date range picker with availability checking
- **Payment Processing**: Stripe Payment Links integration
- **Content Management**: Multilingual CMS for pages and content
- **Admin Panel**: Comprehensive management interface
- **Email Notifications**: Automated booking confirmations
- **Mobile Responsive**: Optimized for all devices

## 📚 Documentation

- **[Installation Guide](INSTALLATION_GUIDE.md)** - Complete production deployment
- **[Frontend User Guide](FRONTEND_USER_GUIDE.md)** - User experience documentation
- **[Backend Admin Guide](BACKEND_ADMIN_GUIDE.md)** - Administrative management

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
```

## 🌍 Environment Variables

See `INSTALLATION_GUIDE.md` for complete environment variable setup.

## 🤝 Contributing

1. Follow the existing code style and conventions
2. Use TypeScript for all new code
3. Update documentation for any new features
4. Test thoroughly before committing

## 📄 License

This project is proprietary. See license file for details.

## 🆘 Support

For support and questions:
- Check the documentation files
- Review existing issues
- Contact the development team

---

**Built with ❤️ in Venice, Italy**