# SRS Migration Summary: Vue 3 → Next.js 16

## Document Updated: SRS-DC.md v3.2 → v4.0

### Major Framework Changes

| Component | Before (Vue 3) | After (Next.js 16) |
|-----------|----------------|-------------------|
| **Framework** | Vue 3 + Vite | Next.js 16 (App Router) + React 19 |
| **State Management** | Pinia + pinia-plugin-persistedstate | Zustand with persist middleware |
| **UI Framework** | PrimeVue + Tailwind | Radix UI + shadcn/ui + Tailwind CSS v4 |
| **PWA** | vite-plugin-pwa | @ducanh2912/next-pwa |
| **Charts** | PrimeVue Chart | Recharts (native React) |
| **Forms** | Vue composables | React Hook Form + Zod |
| **Build Tool** | Vite | Next.js built-in (Turbopack) |

### Technical Stack Updates

#### Core Dependencies
- **Frontend:** Next.js 16 + React 19
- **Routing:** App Router (built-in file-based routing)
- **State:** Zustand with persist middleware
- **Styling:** Tailwind CSS v4 + Radix UI primitives
- **Animation:** Framer Motion (same)
- **Backend:** Supabase (same) + Next.js Server Actions
- **Auth:** Supabase Auth with Next.js middleware
- **PWA:** @ducanh2912/next-pwa with Workbox

#### New Patterns Introduced
1. **Server Components** - Default for data fetching
2. **Client Components** - For interactivity (`'use client'`)
3. **Server Actions** - Server-side mutations
4. **API Route Handlers** - Modern API routes
5. **Middleware** - Route protection and session management
6. **Optimistic Updates** - Better UX with Zustand

### Architecture Changes

#### Component Structure
**Before (Vue):**
```
components/
├── HeroCard.vue
├── ActivityList.vue
└── DashboardChart.vue
```

**After (Next.js):**
```
app/
├── (dashboard)/
│   ├── layout.tsx
│   └── page.tsx
├── api/
│   └── strava/route.ts
components/
├── hero-card.tsx (client)
├── activity-list.tsx (server)
└── dashboard-chart.tsx (client)
```

#### State Management Migration
**Before (Pinia):**
```javascript
// store/activities.js
export const useActivitiesStore = defineStore('activities', {
  state: () => ({ activities: [] }),
  actions: { addActivity(activity) { ... } }
})
```

**After (Zustand):**
```typescript
// store/activities.ts
export const useActivitiesStore = create()(
  persist(
    (set) => ({
      activities: [],
      addActivity: (activity) => set(...)
    }),
    { name: 'activities-storage' }
  )
)
```

### Roadmap Adjustments

#### Phase 1: Project Scaffolding
- ✅ Next.js 16 project setup with App Router
- ✅ Tailwind CSS v4 + Radix UI/shadcn
- ✅ Mobile-first layouts and nested routing
- ✅ Zustand store setup

#### Phase 2: Backend Integration
- ✅ Supabase Auth with Next.js middleware
- ✅ Server Components for data fetching
- ✅ Server Actions for mutations
- ✅ Auth callback routes

#### Phase 3: Strava Integration
- ✅ OAuth flow with API Routes
- ✅ Token storage in Supabase
- ✅ Background sync with Server Actions
- ✅ VO2Max calculations (client + server)

#### Phase 4: Enrichment & Generation
- ✅ React Hook Form + Zod validation
- ✅ Supabase Storage integration
- ✅ Hero Card component (React)
- ✅ Recharts for analytics
- ✅ html-to-image for downloads

#### Phase 5: PWA & Deployment
- ✅ @ducanh2912/next-pwa configuration
- ✅ Service Worker with Workbox
- ✅ Zustand persist for offline
- ✅ Background sync queue
- ✅ Vercel deployment with Edge Runtime

### Database Schema (No Changes)
The Supabase database schema remains the same:
- `profiles` table
- `activities` table
- `biometrics_history` table
- `strava_tokens` table (added)

### New Implementation Examples Added

1. **Supabase Client Setup** (SSR-safe)
2. **Zustand Store with Persist** 
3. **Server Action Example**
4. **Server Component Data Fetching**
5. **PWA Configuration**
6. **Middleware for Auth Protection**

### Key Benefits of Migration

✅ **Better Performance:** Server Components, automatic code splitting, Edge Runtime
✅ **Better DX:** TypeScript-first, better tooling, integrated solutions
✅ **Better SEO:** SSR by default, metadata API
✅ **Better Caching:** Built-in request memoization, revalidation
✅ **Better Deployment:** Optimized for Vercel, Edge functions
✅ **Better Ecosystem:** Larger React ecosystem, more resources

### Migration Checklist

- [x] Update document version to v4.0
- [x] Replace Vue 3 references with Next.js 16
- [x] Update Pinia to Zustand
- [x] Update PrimeVue to Recharts
- [x] Update vite-plugin-pwa to @ducanh2912/next-pwa
- [x] Add App Router architecture documentation
- [x] Add Server Components vs Client Components guide
- [x] Add Server Actions examples
- [x] Add PWA configuration for Next.js
- [x] Add middleware examples
- [x] Add package dependencies list
- [x] Add environment variables template
- [x] Update AI prompt for Supabase schema
- [x] Add implementation code examples

### Next Steps

1. Initialize Next.js project: `npx create-next-app@latest`
2. Install dependencies from package.json
3. Setup Supabase integration
4. Implement auth flow with middleware
5. Build dashboard with Server Components
6. Implement Strava OAuth
7. Add PWA configuration
8. Deploy to Vercel

---

**Document Status:** ✅ Complete
**Last Updated:** January 12, 2026
**Migration Type:** Full stack migration (Vue 3 → Next.js 16)
