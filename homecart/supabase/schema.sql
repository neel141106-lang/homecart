-- Supabase & PostgreSQL Schema for HomeCart
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========================================================
-- 1. PROFILES TABLE
-- ========================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'shopkeeper', 'admin')),
  tower text,
  floor integer,
  flat_number text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Allow public read access to profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow system/auth trigger to insert profiles"
  on public.profiles for insert
  with check (true);

-- Trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, role, tower, floor, flat_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Resident'),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'customer'),
    new.raw_user_meta_data->>'tower',
    (new.raw_user_meta_data->>'floor')::integer,
    new.raw_user_meta_data->>'flat_number'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ========================================================
-- 2. CATEGORIES TABLE
-- ========================================================
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon text not null, -- Emoji representation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

-- Policies for categories
create policy "Allow public read access to categories"
  on public.categories for select
  using (true);

create policy "Allow admin/shopkeeper to manage categories"
  on public.categories for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );


-- ========================================================
-- 3. PRODUCTS TABLE
-- ========================================================
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories(id) on delete set null,
  image_url text,
  image_source text not null default 'placeholder' check (image_source in ('uploaded', 'demo', 'placeholder')),
  product_type text not null default 'standard' check (product_type in ('organic', 'essential', 'standard')),
  unit text not null, -- e.g., "100g", "6 pcs", "1kg"
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.products enable row level security;

-- Policies for products
create policy "Allow public read access to active products"
  on public.products for select
  using (is_active = true);

create policy "Allow admin/shopkeeper to manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );


-- ========================================================
-- 4. ORDERS TABLE
-- ========================================================
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete set null not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  payment_method text not null check (payment_method in ('upi', 'cod', 'credits', 'card')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'preparing', 'dispatched', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

-- Policies for orders
create policy "Allow users to view their own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

create policy "Allow shopkeepers/admins to view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );

create policy "Allow customers to create orders"
  on public.orders for insert
  with check (auth.uid() = customer_id);

create policy "Allow shopkeepers/admins to update order status"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );


-- ========================================================
-- 5. ORDER ITEMS TABLE
-- ========================================================
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

alter table public.order_items enable row level security;

-- Policies for order items
create policy "Allow users to view their own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where id = order_id and customer_id = auth.uid()
    )
  );

create policy "Allow shopkeepers/admins to view all order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );

create policy "Allow customers to insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where id = order_id and customer_id = auth.uid()
    )
  );


-- ========================================================
-- 6. CUSTOM REQUESTS TABLE
-- ========================================================
create table public.custom_requests (
  id uuid default gen_random_uuid() primary key,
  customer_id uuid references public.profiles(id) on delete cascade not null,
  request_text text not null,
  estimated_price numeric(10, 2) check (estimated_price >= 0),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'procuring', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.custom_requests enable row level security;

-- Policies for custom requests
create policy "Allow customers to manage their own requests"
  on public.custom_requests for all
  using (auth.uid() = customer_id);

create policy "Allow shopkeepers/admins to manage all requests"
  on public.custom_requests for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'shopkeeper')
    )
  );


-- ========================================================
-- 7. DELIVERY SETTINGS TABLE (Singleton)
-- ========================================================
create table public.delivery_settings (
  id integer primary key default 1 check (id = 1),
  delivery_fee numeric(10, 2) not null default 30,
  free_delivery_above numeric(10, 2) not null default 500,
  minimum_order_amount numeric(10, 2) not null default 0,
  delivery_time text not null default '10 mins',
  is_delivery_enabled boolean not null default true,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.delivery_settings enable row level security;

-- Policies for delivery settings
create policy "Allow public read access to delivery settings"
  on public.delivery_settings for select
  using (true);

create policy "Allow admins to update delivery settings"
  on public.delivery_settings for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Seed initial delivery settings
insert into public.delivery_settings (id, delivery_fee, free_delivery_above, minimum_order_amount, delivery_time, is_delivery_enabled)
values (1, 30.00, 500.00, 0.00, '10 mins', true)
on conflict (id) do nothing;
