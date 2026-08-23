-- En Postgres, PUBLIC recibe EXECUTE sobre toda funcion nueva, y anon y
-- authenticated heredan de PUBLIC. Revocar solo a anon no quita nada: hay que
-- quitarselo a PUBLIC y luego conceder a quien de verdad lo necesita.
--
-- Sin esto, PostgREST expone cada funcion en /rest/v1/rpc/<nombre>, incluidos
-- los disparadores y los ayudantes de RLS, que no deberian ser llamables.

-- Disparadores: los invoca la base, nunca un cliente.
revoke execute on function public.handle_new_user()        from public, anon, authenticated;
revoke execute on function public.refresh_parking_rating() from public, anon, authenticated;
revoke execute on function public.touch_updated_at()       from public, anon, authenticated;

-- Ayudantes de RLS: los evalua el planificador dentro de las politicas. Que un
-- cliente pudiera llamarlos permitiria sondear que parqueaderos existen.
revoke execute on function public.owns_parking(uuid)        from public, anon, authenticated;
revoke execute on function public.parking_is_visible(uuid)  from public, anon, authenticated;

-- Operaciones de negocio: solo con sesion iniciada.
revoke execute on function public.create_booking(uuid, timestamptz, timestamptz, uuid)
  from public, anon;
grant  execute on function public.create_booking(uuid, timestamptz, timestamptz, uuid)
  to authenticated;

revoke execute on function public.cancel_booking(uuid) from public, anon;
grant  execute on function public.cancel_booking(uuid) to authenticated;

-- Busqueda por cercania: la pantalla principal funciona sin sesion, asi que
-- anon tambien la necesita. No es security definer y solo lee publicados.
grant execute on function public.parkings_nearby(double precision, double precision, integer, integer)
  to anon, authenticated;
