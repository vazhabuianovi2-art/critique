# Critique — Supabase + Trades Restore Backup

This version includes the database-related parts:

- Supabase Auth connection
- `trades` table sync
- `profiles` table for account data
- localStorage fallback
- Export Backup JSON
- Restore Backup JSON
- CSV import/export for trades

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill your Supabase values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
```

3. In Supabase Dashboard open SQL Editor and run:

```text
supabase/schema.sql
```

4. Run the app:

```bash
npm run dev
```

## Important

Use the public anon key only. Do not put the service role key in Vite/frontend code.
