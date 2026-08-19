# Ask It Out — Setup & Deployment Guide

## Overview

Ask It Out is a mobile-first anonymous opinion-sharing app for college students.
Built with **Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase · Vercel**.

---

## Step 1 — Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (free tier is enough)
2. Click **New Project**
3. Choose a name (e.g. `askitout`), set a strong database password, pick a region
4. Wait ~1–2 minutes for the project to be created

---

## Step 2 — Run Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Paste the entire contents of [`supabase-schema.sql`](./supabase-schema.sql) from this project
4. Click **Run** (the green button)
5. You should see: *"Success. No rows returned."*

---

## Step 3 — Enable Realtime

1. In Supabase, go to **Database → Replication** (or search "Replication" in the left nav)
2. Under **Supabase Realtime**, toggle ON:
   - `members`
   - `opinions`
3. Click **Save**

---

## Step 4 — Get API Keys

1. Go to **Project Settings → API** (gear icon in sidebar)
2. Copy:
   - **Project URL** → looks like `https://abcdefghij.supabase.co`
   - **anon / public** key → long JWT string

---

## Step 5 — Configure Environment Variables

In the project root, create a file called `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with what you copied in Step 4.

---

## Step 6 — Run Locally (Optional Test)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Test the full flow:
- Create a room → see QR code
- Open QR link in another tab → join as a different name
- Send an anonymous thought
- Check My Thoughts to see it appear

---

## Step 7 — Deploy to Vercel

### Option A — GitHub (Recommended)

1. Push this project to a GitHub repository
2. Go to [https://vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**
6. Done! You'll get a `.vercel.app` URL

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

---

## Security Notes

- **Sender names are never exposed.** The database stores `sender_id` internally, but the app only shows `Anonymous · Gender` to recipients.
- **Row Level Security (RLS) is enabled** on all tables. The schema includes public read/insert policies that are appropriate for this use case.
- **Session IDs** are random UUIDs stored in `localStorage` — no email or password required.
- **Room expiry** — rooms auto-expire after 24 hours (configurable in the schema).

---

## File Structure

```
ask/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/page.tsx             # Create Room
│   ├── join/page.tsx               # Join Room (manual code entry)
│   ├── join/[code]/page.tsx        # Join Room (from QR code)
│   └── room/[code]/
│       ├── page.tsx                # Room Ready (QR + share)
│       ├── people/page.tsx         # People list (send thoughts)
│       ├── send/page.tsx           # Send Thought
│       └── thoughts/page.tsx       # My Thoughts
├── components/ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── BottomNav.tsx
├── lib/
│   ├── supabase.ts                 # Supabase browser client
│   └── utils.ts                    # Helpers
├── types/index.ts                  # TypeScript types
├── supabase-schema.sql             # Database schema (run this in Supabase)
└── .env.local                      # Your secrets (not committed to git)
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "Room not found" on join | Make sure you ran the SQL schema and enabled RLS policies |
| QR code doesn't work | Ensure your Vercel domain is correct; test locally first |
| Realtime not updating | Enable Replication for `members` and `opinions` tables |
| Build error | Run `npm run build` and check TypeScript errors |
| Blank page | Check `.env.local` has correct values and no extra spaces |
