-- PostGIS: "parqueaderos cerca de mi" es la consulta central de la app. Sin
-- indice espacial cada busqueda seria un scan completo de la tabla.
create extension if not exists postgis with schema extensions;

create table public.parkings (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles on delete cascade,

  name           text          not null,
  address        text          not null,
  zone           text          not null,
  kind           parking_kind  not null,
  description    text          not null default '',
  rules          text[]        not null default '{}',

  latitude       double precision not null check (latitude between -90 and 90),
  longitude      double precision not null check (longitude between -180 and 180),
  -- Derivada de lat/lng: la app sigue leyendo numeros sueltos y la base gana
  -- un indice espacial de verdad. Al ser generada no se puede desincronizar.
  location       extensions.geography(Point, 4326)
                 generated always as (
                   extensions.st_setsrid(
                     extensions.st_makepoint(longitude, latitude), 4326
                   )::extensions.geography
                 ) stored,

  -- COP. entero: en pesos colombianos no se usan centavos.
  price_per_hour integer not null check (price_per_hour >= 0),
  price_per_day  integer          check (price_per_day  >= 0),

  spots_total     integer not null check (spots_total > 0),
  spots_available integer not null check (spots_available >= 0),
  constraint spots_available_dentro_del_total check (spots_available <= spots_total),

  -- Mantenidos por trigger desde reviews. Se guardan en vez de calcularse en
  -- cada consulta porque el listado los muestra en todas las filas.
  rating         numeric(2,1) not null default 0 check (rating between 0 and 5),
  review_count   integer      not null default 0 check (review_count >= 0),

  verified       boolean        not null default false,
  status         listing_status not null default 'borrador',

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index parkings_location_idx on public.parkings using gist (location);
create index parkings_owner_idx    on public.parkings (owner_id);
create index parkings_status_idx   on public.parkings (status) where status = 'publicado';

create trigger parkings_touch
  before update on public.parkings
  for each row execute function public.touch_updated_at();

-- Fotos en tabla aparte y no en un text[]: cada una necesita orden propio y,
-- cuando entre Storage, su propia ruta de objeto.
create table public.parking_photos (
  id         uuid primary key default gen_random_uuid(),
  parking_id uuid    not null references public.parkings on delete cascade,
  url        text    not null,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  unique (parking_id, position)
);

create index parking_photos_parking_idx on public.parking_photos (parking_id);

-- Amenidades. Fila por caracteristica en vez de columnas booleanas: agregar una
-- nueva es un valor mas en el enum, no una migracion de esquema.
create table public.parking_features (
  parking_id uuid        not null references public.parkings on delete cascade,
  feature    feature_key not null,
  primary key (parking_id, feature)
);

-- Horarios. Minutos desde medianoche, igual que OpeningHours en el front.
create table public.parking_hours (
  id         uuid    primary key default gen_random_uuid(),
  parking_id uuid    not null references public.parkings on delete cascade,
  weekday    integer not null check (weekday between 0 and 6),
  opens_at   integer not null check (opens_at  between 0 and 1440),
  closes_at  integer not null check (closes_at between 0 and 1440),
  constraint horario_coherente check (closes_at > opens_at),
  unique (parking_id, weekday)
);

create index parking_hours_parking_idx on public.parking_hours (parking_id);
