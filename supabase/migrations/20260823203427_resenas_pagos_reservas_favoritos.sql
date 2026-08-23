create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  parking_id uuid    not null references public.parkings on delete cascade,
  author_id  uuid    not null references public.profiles on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  comment    text    not null default '',
  created_at timestamptz not null default now(),
  -- Una resena por persona y parqueadero: sin esto, subir la nota propia es
  -- cuestion de insertar en bucle.
  unique (parking_id, author_id)
);

create index reviews_parking_idx on public.reviews (parking_id);

-- Mantiene parkings.rating y review_count al dia. Va en la base y no en la app
-- para que ninguna ruta de escritura pueda saltarselo.
create function public.refresh_parking_rating()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.parking_id, old.parking_id);
begin
  update public.parkings p
     set rating       = coalesce((select round(avg(r.rating)::numeric, 1)
                                    from public.reviews r where r.parking_id = target), 0),
         review_count = (select count(*) from public.reviews r where r.parking_id = target)
   where p.id = target;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_parking_rating();

-- Metodos de pago. Solo el enmascarado que se pinta en pantalla: los datos
-- reales se quedan en la pasarela, aqui nunca.
create table public.payment_methods (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid         not null references public.profiles on delete cascade,
  kind       payment_kind not null,
  label      text         not null,
  detail     text         not null,
  is_default boolean      not null default false,
  created_at timestamptz  not null default now()
);

create index payment_methods_user_idx on public.payment_methods (user_id);

-- Codigo visible de la reserva ("EP-4821"). Secuencia y no random: no colisiona
-- y no obliga a reintentar la insercion.
create sequence public.booking_code_seq start 4800;

create table public.bookings (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique
                    default 'EP-' || lpad((nextval('public.booking_code_seq') % 10000)::text, 4, '0'),
  parking_id        uuid not null references public.parkings   on delete restrict,
  user_id           uuid not null references public.profiles   on delete cascade,
  payment_method_id uuid          references public.payment_methods on delete set null,

  starts_at         timestamptz    not null,
  ends_at           timestamptz    not null,
  status            booking_status not null default 'proxima',

  -- Desglose congelado en el momento de reservar. Si el propietario sube la
  -- tarifa manana, el recibo de ayer no puede cambiar.
  hours             numeric(4,2) not null check (hours > 0),
  subtotal          integer      not null check (subtotal    >= 0),
  service_fee       integer      not null check (service_fee >= 0),
  total             integer      not null check (total       >= 0),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint reserva_termina_despues_de_empezar check (ends_at > starts_at)
);

create index bookings_user_idx    on public.bookings (user_id, starts_at desc);
create index bookings_parking_idx on public.bookings (parking_id, starts_at desc);

create trigger bookings_touch
  before update on public.bookings
  for each row execute function public.touch_updated_at();

create table public.favorites (
  user_id    uuid not null references public.profiles on delete cascade,
  parking_id uuid not null references public.parkings on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, parking_id)
);
