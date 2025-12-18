-- Tabla de notas por día de rutina con favoritos y rotación
create table if not exists public.routine_day_notes (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  es_favorita boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices de acceso rápido
create index if not exists idx_routine_day_notes_day_created_desc
  on public.routine_day_notes (routine_day_id, created_at desc);

create index if not exists idx_routine_day_notes_user_day
  on public.routine_day_notes (user_id, routine_day_id);

-- Trigger updated_at
create or replace function public.set_routine_day_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_routine_day_notes_updated_at on public.routine_day_notes;
create trigger trg_routine_day_notes_updated_at
before update on public.routine_day_notes
for each row execute function public.set_routine_day_notes_updated_at();

-- Seguridad: habilitar RLS y políticas básicas
alter table public.routine_day_notes enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'routine_day_notes' and policyname = 'Notas: solo dueño'
  ) then
    create policy "Notas: solo dueño"
    on public.routine_day_notes
    for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
  end if;
end$$;

