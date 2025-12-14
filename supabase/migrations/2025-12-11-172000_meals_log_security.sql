-- Crear tabla meals_log con alineación al frontend (incluye 'merienda' y 'snack')
create table if not exists public.meals_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'merienda', 'dinner', 'snack')),
  food_name text not null,
  quantity_grams numeric not null,
  calories numeric not null,
  protein numeric not null,
  carbs numeric not null,
  fats numeric not null,
  created_at timestamptz default now(),
  date date default current_date
);

-- Índice para consultas por fecha
create index if not exists meals_log_date_idx on public.meals_log(date);

-- RLS y políticas por usuario
alter table public.meals_log enable row level security;

create policy "Insert own meals" on public.meals_log
  for insert
  with check (user_id = auth.uid());

create policy "Select own meals" on public.meals_log
  for select
  using (user_id = auth.uid());

create policy "Delete own meals" on public.meals_log
  for delete
  using (user_id = auth.uid());


