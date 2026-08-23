-- RLS en todas las tablas. En Supabase la clave anon viaja dentro de la app, o
-- sea que es publica: lo unico que separa los datos de un usuario de los de
-- otro son estas politicas.

-- Helper en security definer: consultar parkings desde una politica de otra
-- tabla dispararia la RLS de parkings en cascada. Aislarlo aqui lo evita.
create function public.owns_parking(target uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.parkings p
     where p.id = target and p.owner_id = (select auth.uid())
  );
$$;

create function public.parking_is_visible(target uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.parkings p
     where p.id = target
       and (p.status = 'publicado' or p.owner_id = (select auth.uid()))
  );
$$;

alter table public.profiles         enable row level security;
alter table public.parkings         enable row level security;
alter table public.parking_photos   enable row level security;
alter table public.parking_features enable row level security;
alter table public.parking_hours    enable row level security;
alter table public.reviews          enable row level security;
alter table public.payment_methods  enable row level security;
alter table public.bookings         enable row level security;
alter table public.favorites        enable row level security;

/* -------------------------------------------------------------- profiles */
-- Publico: el nombre y la foto del propietario se muestran en cada ficha.
create policy "perfiles visibles para todos"
  on public.profiles for select to anon, authenticated using (true);

create policy "cada quien edita su perfil"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

/* -------------------------------------------------------------- parkings */
-- Un borrador solo lo ve su dueno; publicado lo ve cualquiera, incluso sin
-- sesion (la pantalla principal funciona antes de iniciar sesion).
create policy "publicados visibles; borradores solo del dueno"
  on public.parkings for select to anon, authenticated
  using (status = 'publicado' or owner_id = (select auth.uid()));

create policy "publicar a nombre propio"
  on public.parkings for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "el dueno edita lo suyo"
  on public.parkings for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

create policy "el dueno borra lo suyo"
  on public.parkings for delete to authenticated
  using (owner_id = (select auth.uid()));

/* ------------------------------------------- fotos, amenidades y horarios */
create policy "fotos visibles si el parqueadero lo es"
  on public.parking_photos for select to anon, authenticated
  using (public.parking_is_visible(parking_id));
create policy "el dueno gestiona sus fotos"
  on public.parking_photos for all to authenticated
  using (public.owns_parking(parking_id)) with check (public.owns_parking(parking_id));

create policy "amenidades visibles si el parqueadero lo es"
  on public.parking_features for select to anon, authenticated
  using (public.parking_is_visible(parking_id));
create policy "el dueno gestiona sus amenidades"
  on public.parking_features for all to authenticated
  using (public.owns_parking(parking_id)) with check (public.owns_parking(parking_id));

create policy "horarios visibles si el parqueadero lo es"
  on public.parking_hours for select to anon, authenticated
  using (public.parking_is_visible(parking_id));
create policy "el dueno gestiona sus horarios"
  on public.parking_hours for all to authenticated
  using (public.owns_parking(parking_id)) with check (public.owns_parking(parking_id));

/* --------------------------------------------------------------- reviews */
create policy "resenas visibles para todos"
  on public.reviews for select to anon, authenticated using (true);

create policy "resenar en nombre propio"
  on public.reviews for insert to authenticated
  with check (author_id = (select auth.uid()));

create policy "editar la resena propia"
  on public.reviews for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));

create policy "borrar la resena propia"
  on public.reviews for delete to authenticated
  using (author_id = (select auth.uid()));

/* ------------------------------------------------------- metodos de pago */
-- Sin politica de lectura publica: estos datos no salen del dueno nunca.
create policy "solo mis metodos de pago"
  on public.payment_methods for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

/* -------------------------------------------------------------- bookings */
-- Dos lados: quien reserva y el dueno del parqueadero, que necesita ver la
-- agenda de su propio predio.
create policy "mis reservas y las de mis parqueaderos"
  on public.bookings for select to authenticated
  using (user_id = (select auth.uid()) or public.owns_parking(parking_id));

create policy "reservar en nombre propio"
  on public.bookings for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "actualizar reservas propias o de mis parqueaderos"
  on public.bookings for update to authenticated
  using (user_id = (select auth.uid()) or public.owns_parking(parking_id))
  with check (user_id = (select auth.uid()) or public.owns_parking(parking_id));

/* ------------------------------------------------------------- favorites */
create policy "solo mis favoritos"
  on public.favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
