-- Referencias cercanas: "frente al Centro Comercial Andino".
--
-- En Colombia la gente ubica por referencia antes que por nomenclatura, y para
-- el conductor es la senal mas rapida de si el parqueadero le sirve. El
-- asistente de publicacion las recoge como campo opcional.
--
-- Array y no tabla aparte: son cuatro cadenas como maximo, sin identidad
-- propia, y nunca se consultan por si solas.
alter table public.parkings
  add column landmarks text[] not null default '{}';

comment on column public.parkings.landmarks is
  'Referencias cercanas, maximo 4. Opcional.';

-- El tope tambien se aplica en la base: sin el, la ficha del parqueadero se
-- puede convertir en una lista de referencias y dejar de leerse.
alter table public.parkings
  add constraint landmarks_maximo_cuatro check (array_length(landmarks, 1) is null or array_length(landmarks, 1) <= 4);
