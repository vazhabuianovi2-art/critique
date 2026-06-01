-- Critique Supabase schema
-- Run this in Supabase Dashboard -> SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_data jsonb default null,
  updated_at timestamptz not null default now()
);

alter table public.profiles
  alter column account_data drop not null,
  alter column account_data drop default;

update public.profiles
  set account_data = null
  where account_data = '{}'::jsonb;

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trades_user_id_created_at_idx
  on public.trades (user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.trades enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
  on public.trades for select
  using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
  on public.trades for insert
  with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
  on public.trades for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
  on public.trades for delete
  using (auth.uid() = user_id);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'dodo',
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  dodo_customer_id text,
  dodo_subscription_id text,
  dodo_product_id text,
  plan text,
  status text not null default 'unknown',
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_subscriptions
  add column if not exists provider text not null default 'dodo',
  add column if not exists dodo_customer_id text,
  add column if not exists dodo_subscription_id text,
  add column if not exists dodo_product_id text;

alter table public.billing_subscriptions
  alter column stripe_subscription_id drop not null;

create unique index if not exists billing_subscriptions_dodo_subscription_id_key
  on public.billing_subscriptions (dodo_subscription_id)
  ;

create index if not exists billing_subscriptions_user_id_updated_at_idx
  on public.billing_subscriptions (user_id, updated_at desc);

create index if not exists billing_subscriptions_email_updated_at_idx
  on public.billing_subscriptions (email, updated_at desc);

alter table public.billing_subscriptions enable row level security;

grant usage on schema public to authenticated, service_role;
grant select on public.billing_subscriptions to authenticated;
grant select, insert, update, delete on public.billing_subscriptions to service_role;

drop policy if exists "billing_subscriptions_select_own" on public.billing_subscriptions;
create policy "billing_subscriptions_select_own"
  on public.billing_subscriptions for select
  using (auth.uid() = user_id);

create table if not exists public.support_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  name text,
  type text not null default 'Bug',
  priority text not null default 'Medium',
  status text not null default 'open',
  title text not null,
  message text not null,
  page text,
  browser text,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_reports_user_id_created_at_idx
  on public.support_reports (user_id, created_at desc);

create index if not exists support_reports_status_created_at_idx
  on public.support_reports (status, created_at desc);

alter table public.support_reports enable row level security;

grant select, insert on public.support_reports to authenticated;
grant select, insert, update, delete on public.support_reports to service_role;

drop policy if exists "support_reports_select_own" on public.support_reports;
create policy "support_reports_select_own"
  on public.support_reports for select
  using (auth.uid() = user_id);

drop policy if exists "support_reports_insert_own" on public.support_reports;
create policy "support_reports_insert_own"
  on public.support_reports for insert
  with check (auth.uid() = user_id);
