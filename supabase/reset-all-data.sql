-- TryCritique full database reset.
-- Run this in Supabase Dashboard -> SQL Editor.
-- WARNING: this deletes all registered users, profiles, trades, and billing rows.

begin;

delete from public.billing_subscriptions;
delete from public.trades;
delete from public.profiles;
delete from auth.users;

commit;

select 'auth.users' as table_name, count(*) as remaining_rows from auth.users
union all
select 'public.profiles', count(*) from public.profiles
union all
select 'public.trades', count(*) from public.trades
union all
select 'public.billing_subscriptions', count(*) from public.billing_subscriptions;
