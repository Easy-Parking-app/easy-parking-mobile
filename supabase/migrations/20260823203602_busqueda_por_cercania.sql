-- Busqueda por cercania. Existe como funcion, y no como consulta armada en el
-- cliente, porque PostgREST no sabe pedirle a PostGIS que ordene por distancia,
-- y porque asi el indice GIST se usa de verdad.
--
-- Devuelve la distancia ya calculada: es justo lo que la ficha muestra y evita
-- recalcularla en el telefono.
create function public.parkings_nearby(
  p_lat        double precision,
  p_lng        double precision,
  p_radius_m   integer default 5000,
  p_limit      integer default 50
)
returns table (
  id              uuid,
  distance_meters double precision
)
language sql
stable
set search_path = ''
as $$
  select p.id,
         extensions.st_distance(
           p.location,
           extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography
         ) as distance_meters
    from public.parkings p
   where p.status = 'publicado'
     and extensions.st_dwithin(
           p.location,
           extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
           p_radius_m
         )
   order by distance_meters
   limit least(p_limit, 200);
$$;
