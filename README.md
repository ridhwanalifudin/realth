# Realth - Fitness Activity Tracking Platform

A modern fitness tracking application built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## Features

- 🏃‍♂️ Activity tracking and management
- 📊 Dashboard with stats and analytics
- 💓 Heart rate and VO2max monitoring
- 📈 Distance and performance trends
- 👤 User authentication and profiles
- 📁 Activity file upload (GPX/FIT/TCX)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Animation:** Framer Motion
- **Charts:** Recharts
- **UI Components:** Radix UI primitives
- **Icons:** Lucide React
- **Language:** TypeScript

## Project Structure

```
realth/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── activities/   # Activity CRUD endpoints
│   │   └── upload/       # File upload endpoint
│   ├── auth/             # Auth pages (login/register)
│   ├── dashboard/        # Dashboard and activity pages
│   ├── error.tsx         # Global error boundary
│   ├── loading.tsx       # Global loading state
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── auth-card.tsx
│   ├── dashboard-nav.tsx
│   └── activity-upload-dialog.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/              # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realth
```

2. Install dependencies:
```bash
pnpm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration (see [Environment Variables](#environment-variables))

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/realth"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
JWT_SECRET="your-jwt-secret"

# Optional integrations
STRAVA_CLIENT_ID=""
STRAVA_CLIENT_SECRET=""
```

See `.env.example` for all available options.

## API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Activities
- `GET /api/activities` - List user activities
- `POST /api/activities` - Create new activity
- `GET /api/activities/[id]` - Get activity details
- `PUT /api/activities/[id]` - Update activity
- `DELETE /api/activities/[id]` - Delete activity

### Upload
- `POST /api/upload` - Upload activity file (GPX/FIT/TCX)

## Development

### Available Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Build for production
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

### Code Structure

- **Pages:** Use App Router conventions (page.tsx, layout.tsx, error.tsx, loading.tsx)
- **Components:** Organized by feature or UI primitives
- **API Routes:** RESTful endpoints with proper error handling
- **Styling:** Utility-first with Tailwind CSS

## TODO / Roadmap

- [ ] Implement real database integration (Prisma + PostgreSQL)
- [ ] Add proper authentication (NextAuth.js)
- [ ] Implement GPX/FIT file parsing
- [ ] Add route mapping with Mapbox/Leaflet
- [ ] Implement real-time activity tracking
- [ ] Add social features (follow, share)
- [ ] Implement training plans
- [ ] Add mobile app (React Native)
- [ ] Integration with Strava/Garmin
- [ ] Advanced analytics and insights

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
