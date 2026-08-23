-- Tipos del dominio. Se declaran como enums para que la base rechace un valor
-- invalido: los mismos literales que ya usa src/types/index.ts.

create type parking_kind    as enum ('garaje', 'edificio', 'lote', 'centro-comercial');
create type feature_key     as enum ('cubierto', 'vigilancia', 'carga-electrica', 'moto',
                                     'camioneta', 'accesibilidad', 'lavado', 'acceso-24h');
create type booking_status  as enum ('proxima', 'activa', 'completada', 'cancelada');
create type payment_kind    as enum ('nequi', 'daviplata', 'pse', 'tarjeta');
create type listing_status  as enum ('publicado', 'borrador', 'pausado');

-- Perfil publico. auth.users guarda las credenciales y nunca se expone; todo lo
-- que la app muestra de una persona vive aqui.
create table public.profiles (
  id           uuid primary key references auth.users on delete cascade,
  name         text        not null,
  phone        text,
  avatar_url   text,
  is_owner     boolean     not null default false,
  member_since timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Datos publicos de cada usuario. El correo vive en auth.users.';

-- Crear el perfil al registrarse. Sin esto habria usuarios sin fila en profiles
-- y cada join tendria que defenderse de ese caso.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, phone)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at automatico, reutilizado por varias tablas.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();
