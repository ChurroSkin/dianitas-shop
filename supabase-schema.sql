-- Dianita's Shop: run this in Supabase SQL Editor.
-- Before running, replace the admin email placeholder with the shop owner's login email.
-- This creates a private orders table and private image bucket. Public visitors can INSERT
-- orders only; they cannot read orders or access stored images. Only the configured admin
-- account can read/update orders and view reference images.

create extension if not exists pgcrypto;

create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null check (char_length(customer_name) between 1 and 50),
    customer_email text not null check (char_length(customer_email) <= 254 and customer_email like '%@%.%'),
    item_type text not null check (item_type in ('mug', 'tops', 'tumbler', 'headwear', 'other')),
    design_description text check (design_description is null or char_length(design_description) <= 1000),
    status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
    reference_image_path text,
    created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Public can submit pending orders" on public.orders;
create policy "Public can submit pending orders"
on public.orders for insert to anon, authenticated
with check (status = 'pending');

create or replace function public.is_shop_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1
        from auth.users
        where id = (select auth.uid())
          and lower(email) = lower('REPLACE_WITH_SHOP_ADMIN_EMAIL')
    );
$$;

revoke all on function public.is_shop_admin() from public;
grant execute on function public.is_shop_admin() to authenticated;

drop policy if exists "Shop admin can read orders" on public.orders;
create policy "Shop admin can read orders"
on public.orders for select to authenticated
using (public.is_shop_admin());

drop policy if exists "Shop admin can update orders" on public.orders;
create policy "Shop admin can update orders"
on public.orders for update to authenticated
using (public.is_shop_admin())
with check (public.is_shop_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('order-references', 'order-references', false, 8388608, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
    public = false,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

drop policy if exists "Public can upload order reference images" on storage.objects;
create policy "Public can upload order reference images"
on storage.objects for insert to anon, authenticated
with check (
    bucket_id = 'order-references'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

drop policy if exists "Shop admin can view order reference images" on storage.objects;
create policy "Shop admin can view order reference images"
on storage.objects for select to authenticated
using (bucket_id = 'order-references' and public.is_shop_admin());
