# Supabase Database Setup

This directory contains SQL migration files for the Realth database schema.

## Quick Start

### 1. Create Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Copy your project URL and anon key
4. Update `.env.local` with your Supabase credentials

### 2. Run Migrations
Option A: Using Supabase Dashboard
1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `migrations/001_initial_schema.sql`
4. Paste and click **Run**

Option B: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema

### Tables

#### `profiles`
- User profile information linked to `auth.users`
- Stores biometric data (age, height, weight goals)
- Automatically created when user signs up

#### `activities`
- Running activities from Strava + manual enrichment
- Contains Strava automatic data (distance, time, pace)
- Manual enrichment fields (HR, photos, captions)
- Calculated analytics (VO2max, fitness impact)
- Unique `strava_id` constraint prevents duplicates

#### `biometrics_history`
- Daily/periodic logs from Smart Scale
- Weight and fat percentage tracking
- Used for progress charts

#### `strava_tokens`
- OAuth tokens for Strava API
- Securely stores access/refresh tokens
- One token set per user

### Security (RLS)

All tables have Row Level Security (RLS) enabled with policies that:
- Users can only view their own data
- Users can only modify their own data
- Data isolation per user via `auth.uid()`

### Indexes

Performance indexes created on:
- `activities.user_id`
- `activities.strava_id`
- `activities.start_date_local`
- `biometrics_history.user_id`
- `biometrics_history.recorded_at`

### Triggers

- **Auto-update timestamps**: `updated_at` automatically updates on record modification
- **Auto-create profile**: Profile automatically created when user signs up

## Environment Variables

Update your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Testing the Setup

After running migrations, test in Supabase Dashboard → Table Editor:
- Verify all 4 tables exist
- Check RLS is enabled (green shield icon)
- Try inserting test data as authenticated user

## Next Steps

After database setup is complete:
1. ✅ Database schema created
2. → Implement authentication (login/register)
3. → Update API routes to use Supabase
4. → Create Server Actions for data mutations
