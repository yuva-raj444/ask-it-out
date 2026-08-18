-- =============================================
-- Ask It Out — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- =============================================

-- Rooms table
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- Members table
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  session_id text not null,
  name text not null,
  gender text not null check (gender in ('male', 'female', 'prefer_not_to_say')),
  joined_at timestamptz default now(),
  unique(room_id, session_id)
);

-- Opinions (thoughts) table
create table if not exists opinions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms(id) on delete cascade,
  sender_id uuid references members(id),
  recipient_id uuid references members(id),
  message text not null,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security
-- =============================================
alter table rooms enable row level security;
alter table members enable row level security;
alter table opinions enable row level security;

-- Rooms policies
create policy "rooms_select_all" on rooms for select using (true);
create policy "rooms_insert_all" on rooms for insert with check (true);

-- Members policies
create policy "members_select_all" on members for select using (true);
create policy "members_insert_all" on members for insert with check (true);

-- Opinions policies
create policy "opinions_insert_all" on opinions for insert with check (true);
create policy "opinions_select_all" on opinions for select using (true);

-- =============================================
-- Enable Realtime
-- =============================================
-- Go to: Supabase Dashboard → Database → Replication
-- Enable replication for: members, opinions
-- =============================================
