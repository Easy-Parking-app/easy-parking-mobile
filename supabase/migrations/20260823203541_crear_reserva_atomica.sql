-- Reservar es la unica operacion donde dos usuarios compiten por el mismo
-- recurso. Si la app leyera spots_available, decidiera y luego insertara, dos
-- personas podrian pasar la comprobacion a la vez y quedarse con el mismo cupo.
-- Por eso vive en la base, en una sola transaccion y con la fila bloqueada.
--
-- El precio tambien se calcula aqui, no en el cliente: el cliente puede mentir.
-- Las reglas son las mismas de src/utils/pricing.ts (tramos de 30 min, minimo
-- una hora, tope por tarifa diaria, comision del 10 % con piso de 900 COP).

create function public.create_booking(
  p_parking_id        uuid,
  p_starts_at         timestamptz,
  p_ends_at           timestamptz,
  p_payment_method_id uuid default null
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parking        public.parkings;
  v_user           uuid := (select auth.uid());
  v_raw_minutes    numeric;
  v_billed_minutes numeric;
  v_billed_hours   numeric;
  v_by_hour        numeric;
  v_subtotal       integer;
  v_service_fee    integer;
  v_booking        public.bookings;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesion para reservar.' using errcode = '28000';
  end if;

  if p_ends_at <= p_starts_at then
    raise exception 'La hora de salida debe ser posterior a la de entrada.'
      using errcode = '22023';
  end if;

  -- FOR UPDATE serializa a los que compiten por este parqueadero: el segundo
  -- espera aqui y lee el cupo ya descontado por el primero.
  select * into v_parking
    from public.parkings
   where id = p_parking_id
   for update;

  if not found then
    raise exception 'No encontramos este parqueadero.' using errcode = 'P0002';
  end if;

  if v_parking.status <> 'publicado' then
    raise exception 'Este parqueadero no esta disponible.' using errcode = 'P0003';
  end if;

  if v_parking.spots_available = 0 then
    raise exception 'Este parqueadero se quedo sin cupos.' using errcode = 'P0004';
  end if;

  -- El metodo de pago tiene que ser del usuario. La RLS no aplica dentro de una
  -- funcion security definer, asi que se comprueba a mano.
  if p_payment_method_id is not null
     and not exists (select 1 from public.payment_methods
                      where id = p_payment_method_id and user_id = v_user) then
    raise exception 'Metodo de pago invalido.' using errcode = '22023';
  end if;

  v_raw_minutes    := extract(epoch from (p_ends_at - p_starts_at)) / 60;
  v_billed_minutes := greatest(60, ceil(v_raw_minutes / 30) * 30);
  v_billed_hours   := v_billed_minutes / 60;

  v_by_hour := v_parking.price_per_hour * v_billed_hours;
  if v_parking.price_per_day is not null then
    v_by_hour := least(v_by_hour, v_parking.price_per_day);
  end if;

  v_subtotal    := round(v_by_hour / 100) * 100;
  v_service_fee := greatest(900, round(v_subtotal * 0.10 / 100) * 100);

  insert into public.bookings (
    parking_id, user_id, payment_method_id,
    starts_at, ends_at, hours, subtotal, service_fee, total
  ) values (
    p_parking_id, v_user, p_payment_method_id,
    p_starts_at, p_ends_at, round((v_raw_minutes / 60)::numeric, 2),
    v_subtotal, v_service_fee, v_subtotal + v_service_fee
  )
  returning * into v_booking;

  update public.parkings
     set spots_available = spots_available - 1
   where id = p_parking_id;

  return v_booking;
end;
$$;

-- Cancelar devuelve el cupo. Mismo motivo para vivir en la base: el UPDATE de
-- la reserva y el incremento del cupo tienen que ir juntos o ninguno.
create function public.cancel_booking(p_booking_id uuid)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    uuid := (select auth.uid());
  v_booking public.bookings;
begin
  select * into v_booking
    from public.bookings
   where id = p_booking_id
   for update;

  if not found then
    raise exception 'No encontramos esta reserva.' using errcode = 'P0002';
  end if;

  if v_booking.user_id <> v_user and not public.owns_parking(v_booking.parking_id) then
    raise exception 'No puedes cancelar esta reserva.' using errcode = '42501';
  end if;

  if v_booking.status = 'cancelada' then
    return v_booking;
  end if;

  if v_booking.status = 'completada' then
    raise exception 'Una reserva completada no se puede cancelar.' using errcode = 'P0003';
  end if;

  update public.bookings
     set status = 'cancelada'
   where id = p_booking_id
   returning * into v_booking;

  update public.parkings
     set spots_available = least(spots_available + 1, spots_total)
   where id = v_booking.parking_id;

  return v_booking;
end;
$$;
