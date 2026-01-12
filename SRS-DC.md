## **Software Requirement Specification (SRS) v4.0**

**Project Name:** Runner's Health & Performance Aggregator (PWA)
**Target Platform:** Mobile-First Progressive Web App (Next.js 16)
**Version:** 4.0 (Next.js Migration)

### **Summary & Background**

- **Background**
    - Pelari seringkali menggunakan Strava untuk merekam aktivitas, namun data tersebut seringkali terisolasi dari data kesehatan harian (berat badan, lemak tubuh) dan metrik dari perangkat non-GPS (Smartband). Selain itu, visualisasi progres jangka panjang yang "estetik" untuk dibagikan ke media sosial masih terbatas pada template standar.
- **Objective**
    - Membangun PWA yang berfungsi sebagai agregator data kebugaran pelari. Aplikasi ini akan menarik data otomatis dari Strava, memungkinkan input manual metrik kesehatan harian, menghitung prediksi performa (VO2Max), serta menyediakan fitur pembuatan "Hero Card" yang estetik.

### **User Stories & Flow**

- **Sync:** User melakukan otentikasi Strava; sistem menarik aktivitas lari terbaru secara otomatis.
- **Enrich:** User membuka aplikasi (bahkan saat offline), memilih aktivitas lari, lalu menambahkan data detak jantung (Avg/Max), skala kelelahan, dan foto.
- **Analyze:** Sistem menghitung estimasi VO2Max dan memperbarui grafik tren kebugaran mingguan.
- **Share:** User men-generate Hero Card dari aktivitas lari yang telah diperkaya dan mengunduhnya untuk dibagikan.

### **Functional Requirements**

- **Integrasi & Pengolahan Data**
    - **Strava OAuth 2.0:** Alur otentikasi aman untuk akses data aktivitas (jarak, waktu, pace, polyline).
    - **Manual Enrichment:** Form input untuk data biometrik (HR, Berat Badan, % Lemak) dan data kualitatif (Foto & Caption).
    - **Calculated Metrics:** * Estimasi VO2Max menggunakan metode *Heart Rate Ratio*.
        - Skor intensitas latihan (Suffer Score) berdasarkan zona detak jantung.
- **Modul Utama Aplikasi**
    - **Dashboard:** Menampilkan widget statistik mingguan dan grafik tren menggunakan PrimeVue Chart.
    - **Activity Feed:** Daftar aktivitas yang tersinkron dengan indikator status (Enriched/Pending).
    - **Hero Card Engine:** Komponen visual berbasis HTML/CSS yang dikonversi menjadi gambar via `html-to-image`.
    - **Profile Management:** Pengaturan profil fisik untuk akurasi kalkulasi VO2Max.
- **Offline & PWA Architecture**
    - **Service Worker:** Manajemen cache otomatis untuk static assets dan API responses via `@ducanh2912/next-pwa` dengan Workbox strategies.
    - **Offline-First Storage:** Menggunakan **Zustand** dengan persist middleware (localStorage/IndexedDB) agar data tetap tersedia saat tidak ada internet.
    - **Background Sync Logic:** Mekanisme antrean (queue) menggunakan Zustand store untuk menyimpan pending mutations saat offline dan mengirimkannya ke Supabase via Server Actions saat koneksi kembali stabil.
    - **Optimistic Updates:** Client-side state updates dengan rollback strategy jika server mutation gagal.

### **Technical Stack**

| Layer | Technology |
|-------|------------|
| **Frontend Framework** | Next.js 16 (App Router) + React 19 |
| **State Management** | Zustand (with persist middleware) atau React Context API |
| **Styling & UI** | Tailwind CSS v4 + Radix UI primitives + shadcn/ui components + Framer Motion |
| **PWA Engine** | `@ducanh2912/next-pwa` (recommended) or `next-pwa` |
| **Charts & Visualizations** | Recharts (native React) |
| **Image Generation** | `html-to-image` or `@vercel/og` for dynamic OG images |
| **Backend & Database** | Supabase (PostgreSQL + Auth + Storage) |
| **API Layer** | Next.js 16 App Router API Routes (Route Handlers) |
| **Authentication** | Supabase Auth with Next.js middleware |
| **Deployment** | Vercel (Edge Runtime support) |

### **Database Schema (Supabase)**

- **Table `profiles`:** `id (uuid)`, `full_name`, `age`, `height`, `gender`, `weight_goal`.
- **Table `activities`:** `id`, `user_id`, `strava_id (unique)`, `distance`, `moving_time`, `map_polyline`, `avg_hr`, `max_hr`, `vo2max_est`, `photo_url`, `is_synced`.
- **Table `biometrics_history`:** `id`, `user_id`, `weight`, `fat_percentage`, `recorded_at`.

### **Roadmap & Fase Pengerjaan**

- **Fase 1: Project Scaffolding & UI Dasar (Minggu 1)**
    - Setup Next.js 16 project dengan App Router, Tailwind CSS v4, dan Radix UI/shadcn.
    - Pembuatan Root Layout dan nested layouts dengan Mobile-First Bottom Navigation.
    - Implementasi halaman Dashboard statis (app/dashboard/page.tsx) dan Activity List dengan data mockup.
    - Setup Zustand store untuk state management global.
- **Fase 2: Backend Integration & Auth (Minggu 2)**
    - Konfigurasi Supabase Project dan tabel database (SQL migrations).
    - Implementasi Supabase Auth dengan Next.js middleware untuk route protection.
    - Setup Server Components dan Server Actions untuk data fetching.
    - Implementasi auth callback route (app/auth/callback/route.ts).
    - Koneksi data profil user menggunakan Supabase Client (SSR-safe).
- **Fase 3: Strava API & Logic Sync (Minggu 3)**
    - Implementasi OAuth Strava flow menggunakan Next.js API Routes (app/api/strava).
    - Token Exchange dan storage menggunakan Supabase database.
    - Pembuatan Server Actions untuk Background Sync dari Strava ke Supabase.
    - Kalkulasi logic VO2Max di client-side (Zustand store) dan server-side (Server Actions).
- **Fase 4: Enrichment & Image Generation (Minggu 4)**
    - Pembuatan form enrichment (HR input & Photo upload) dengan React Hook Form + Zod.
    - Setup Supabase Storage untuk photo uploads.
    - Pengembangan komponen Hero Card (React component) dan fitur "Download as Image" menggunakan html-to-image.
    - Integrasi grafik progres menggunakan Recharts (LineChart, AreaChart).
    - Implementasi Server Actions untuk data mutation (create/update activities).
- **Fase 5: PWA Optimization & Launch (Minggu 5)**
    - Konfigurasi Web App Manifest dan Service Worker via `@ducanh2912/next-pwa`.
    - Setup next.config.js dengan PWA configuration (offline fallback, precaching).
    - Implementasi Zustand persist middleware untuk offline-first storage.
    - Implementasi background sync strategy untuk queue-ing offline mutations.
    - Uji coba instalasi PWA di Android/iOS dan deployment ke Vercel.
    - Setup Edge Runtime untuk optimal performance.

### **Next.js-Specific Architecture**

#### **App Router Structure**
```
app/
├── (auth)/                 # Route group untuk auth pages
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/           # Route group dengan layout dashboard
│   ├── layout.tsx         # Dashboard layout dengan nav
│   ├── page.tsx          # Dashboard home
│   ├── activities/
│   │   ├── page.tsx      # Activity list
│   │   └── [id]/page.tsx # Activity detail
│   ├── profile/page.tsx
│   └── hero-card/page.tsx
├── api/
│   ├── strava/
│   │   ├── auth/route.ts     # Strava OAuth initiation
│   │   ├── callback/route.ts # OAuth callback
│   │   └── sync/route.ts     # Manual sync trigger
│   ├── activities/route.ts   # Activity CRUD
│   └── upload/route.ts       # Photo upload handler
├── auth/
│   └── callback/route.ts # Supabase auth callback
├── layout.tsx            # Root layout
├── page.tsx             # Landing page
├── error.tsx            # Error boundary
└── loading.tsx          # Loading state
```

#### **Server Components vs Client Components**
- **Server Components (default):**
  - Dashboard statistik (data fetching dari Supabase)
  - Activity list dengan server-side filtering
  - Profile page
- **Client Components ('use client'):**
  - Forms dengan interaksi (enrichment form, profile form)
  - Charts (Recharts components)
  - Hero Card generator
  - Interactive maps
  - State management dengan Zustand

#### **Data Fetching Patterns**
- **Server Components:** Direct Supabase queries dengan `@supabase/ssr`
- **Client Components:** Menggunakan Server Actions atau API Routes via fetch/SWR
- **Real-time Updates:** Supabase Realtime subscriptions di client components
- **Optimistic Updates:** Zustand untuk immediate UI feedback

#### **Middleware Configuration**
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Refresh Supabase session
  // 2. Protect dashboard routes
  // 3. Handle Strava OAuth redirects
  // 4. Set security headers
}
```

## Techinical

### **Package Dependencies**

#### **Core Dependencies**
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.47.0",
    "zustand": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^3.0.0",
    "framer-motion": "^12.0.0",
    "recharts": "^2.15.0",
    "react-hook-form": "^7.54.0",
    "@hookform/resolvers": "^3.10.0",
    "zod": "^3.25.0",
    "html-to-image": "^1.11.0",
    "lucide-react": "^0.454.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@ducanh2912/next-pwa": "^10.2.0",
    "typescript": "^5.7.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### **Environment Variables (.env.local)**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Strava OAuth
NEXT_PUBLIC_STRAVA_CLIENT_ID=your-client-id
STRAVA_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1. Activity Data Contract (The Core)

Ini adalah objek utama yang akan disimpan di database dan dikonsumsi oleh Dashboard & Hero Card.

JSON

`{
  "activity_id": "uuid-string", 
  "strava_id": 123456789, // ID asli dari Strava untuk mapping
  "user_id": "uuid-user",
  "display_name": "Morning Run in Dago",
  
  // --- Data Otomatis dari Strava ---
  "strava_data": {
    "distance": 5020.5, // dalam meter
    "moving_time": 1815, // dalam detik
    "elapsed_time": 1900,
    "total_elevation_gain": 45.2,
    "start_date_local": "2024-05-20T07:00:00Z",
    "map_polyline": "a~_fE...polyline_string", // Untuk render rute kecil di Hero Card
    "average_speed": 2.76 // m/s
  },

  // --- Data Manual Enrichment (Input User) ---
  "enrichment_data": {
    "avg_heart_rate": 155,
    "max_heart_rate": 182,
    "feeling_scale": 8, // 1-10 level kelelahan
    "photo_url": "https://supabase-storage/run_001.jpg",
    "caption": "Pace stabil, udara segar!",
    "weight_at_time": 70.5 // Berat badan saat lari ini dilakukan
  },

  // --- Data Hasil Kalkulasi (Processed) ---
  "analytics": {
    "avg_pace": "06:02", // mm:ss per km
    "vo2max_estimate": 45.8,
    "fitness_impact": "Improving", // Level kebugaran berdasarkan algoritma
    "is_personal_best": false
  }
}`

---

### 2. Biometric & Profile Contract

Untuk melacak progres kebugaran jangka panjang (Smart Scale data).

JSON

`{
  "user_profile": {
    "age": 28,
    "height": 175,
    "gender": "male",
    "current_vo2max_avg": 44.5,
    "fitness_level": "Intermediate"
  },
  "biometrics_history": [
    {
      "recorded_at": "2024-05-01",
      "weight": 72.0,
      "fat_percentage": 18.5
    },
    {
      "recorded_at": "2024-05-20",
      "weight": 70.5,
      "fat_percentage": 18.0
    }
  ]
}`

---

### 3. Hero Card Payload

Data yang dikirim ke komponen `HeroCard.tsx` (React component) untuk dirender menjadi gambar.

JSON

`{
  "template_version": "v1-minimalist",
  "background_image": "enrichment_data.photo_url",
  "stats": [
    { "label": "Distance", "value": "5.02", "unit": "KM" },
    { "label": "Pace", "value": "06:02", "unit": "/KM" },
    { "label": "VO2Max", "value": "45.8", "unit": "Index" }
  ],
  "route_thumb": "map_polyline" 
}`

---

### 4. Strategi Implementasi di Supabase

Berdasarkan contract di atas, kita akan membagi data menjadi 3 tabel utama:

1. **`profiles`**: Menyimpan data biometrik dasar.
2. **`activities`**: Menyimpan gabungan data Strava + Manual (HR, VO2Max).
3. **`biometrics_history`**: Tabel log khusus untuk grafik berat badan/lemak (Smart Scale).

### **AI Prompt: Supabase Database Schema Implementation**

**Context:**
Saya sedang membangun Web App (PWA) bernama "Runner’s Health & Performance Aggregator". Aplikasi ini berfungsi menggabungkan data aktivitas lari dari Strava API dengan data manual (Enrichment) seperti Heart Rate dari Smartband dan metrik dari Smart Scale.

**Tech Stack:** Next.js 16 (App Router) + Supabase (PostgreSQL + Auth + Storage) + Zustand + Tailwind CSS v4.

**Goal:**
Buatlah SQL Script (DDL) dan Row Level Security (RLS) untuk di-setup di Supabase SQL Editor dengan spesifikasi sebagai berikut:

**1. Database Schema Requirements:**

- **Table `profiles`**: Menyimpan data user (id dari auth.users, full_name, age, height, gender).
- **Table `activities`**:
    - Harus memiliki `strava_id` (BIGINT) yang bersifat **UNIQUE** untuk caching strategy dan menghindari duplikasi.
    - Data otomatis dari Strava: distance (float), moving_time (int), elapsed_time (int), total_elevation_gain (float), start_date_local (timestamp), map_polyline (text).
    - Data Manual Enrichment: avg_heart_rate (int), max_heart_rate (int), feeling_scale (int 1-10), photo_url (text), caption (text), weight_at_time (float).
    - Data Analytics: vo2max_estimate (float), fitness_impact (text).
- **Table `biometrics_history`**: Log harian/berkala untuk weight (float), fat_percentage (float), dan recorded_at (date).

**2. Security (RLS) Requirements:**

- Aktifkan Row Level Security (RLS) di semua tabel.
- Buat Policy agar user **HANYA** bisa melakukan CRUD (Create, Read, Update, Delete) pada datanya sendiri berdasarkan `auth.uid()`.

**3. Output Format:**

- Berikan SQL script yang bersih dan siap eksekusi.
- Gunakan `uuid_generate_v4()` untuk primary key non-profile.
- Sertakan komentar singkat pada setiap tabel untuk dokumentasi.- Include indexes untuk optimasi query (user_id, strava_id, start_date_local).
- Tambahkan table `strava_tokens` untuk menyimpan OAuth access/refresh tokens.

---

## **Implementation Examples (Next.js Patterns)**

### **1. Supabase Client Setup**

```typescript
// lib/supabase/client.ts (Client Component)
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts (Server Component/Action)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### **2. Zustand Store with Persist**

```typescript
// store/activities.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Activity {
  id: string
  strava_id: number
  distance: number
}

interface ActivitiesState {
  activities: Activity[]
  pendingSync: Activity[]
  addActivity: (activity: Activity) => void
  queueForSync: (activity: Activity) => void
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set) => ({
      activities: [],
      pendingSync: [],
      addActivity: (activity) => set((state) => ({ activities: [...state.activities, activity] })),
      queueForSync: (activity) => set((state) => ({ pendingSync: [...state.pendingSync, activity] })),
    }),
    { name: 'activities-storage' }
  )
)
```

### **3. Server Action Example**

```typescript
// app/actions/activities.ts
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function enrichActivity(activityId: string, data: any) {
  const supabase = await createServerSupabaseClient()
  const { data: activity, error } = await supabase
    .from('activities')
    .update(data)
    .eq('id', activityId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard/activities')
  return activity
}
```

### **4. PWA Configuration (next.config.js)**

```javascript
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'supabase-api', expiration: { maxAgeSeconds: 86400 } },
    },
  ],
})

module.exports = withPWA({ reactStrictMode: true })
```

