begin;

create sequence if not exists public.order_public_code_seq;

create or replace function public.next_order_public_code()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'RES-' || lpad(
    generated.value::text,
    greatest(4, char_length(generated.value::text)),
    '0'
  )
  from (select nextval('public.order_public_code_seq') as value) as generated;
$$;

alter table public.orders
  alter column address drop not null,
  add column public_code text,
  add column source text not null default 'web',
  add column idempotency_key uuid,
  add column expires_at timestamptz not null default (now() + interval '24 hours'),
  add column confirmed_at timestamptz,
  add column rejected_at timestamptz,
  add column rejection_reason text;

update public.orders
set public_code = public.next_order_public_code()
where public_code is null;

alter table public.orders
  alter column public_code set default public.next_order_public_code(),
  alter column public_code set not null,
  add constraint orders_public_code_unique unique (public_code),
  add constraint orders_idempotency_key_unique unique (idempotency_key),
  add constraint orders_status_workflow_check
    check (status in ('pending', 'confirmed', 'rejected', 'expired')),
  add constraint orders_source_check
    check (source in ('web', 'manual')),
  add constraint orders_total_nonnegative_check check (total >= 0),
  add constraint orders_customer_name_check
    check (char_length(trim(customer_name)) between 1 and 100),
  add constraint orders_customer_phone_check
    check (trim(customer_phone) ~ '^\+?[0-9]{7,15}$'),
  add constraint orders_expiration_check check (expires_at > created_at),
  add constraint orders_rejection_reason_length_check
    check (rejection_reason is null or char_length(rejection_reason) <= 500);

alter table public.order_items
  add column product_code text,
  add column subtotal numeric;

update public.order_items as order_item
set
  product_code = product.code,
  subtotal = order_item.unit_price * order_item.quantity
from public.products as product
where product.id = order_item.product_id;

alter table public.order_items
  alter column product_code set not null,
  alter column subtotal set not null,
  add constraint order_items_quantity_positive_check check (quantity > 0),
  add constraint order_items_unit_price_nonnegative_check check (unit_price >= 0),
  add constraint order_items_subtotal_nonnegative_check check (subtotal >= 0),
  add constraint order_items_order_product_unique unique (order_id, product_id);

create index orders_status_created_at_idx
  on public.orders (status, created_at desc);

create index order_items_order_id_idx
  on public.order_items (order_id);

create or replace function public.create_pending_order(
  p_items jsonb,
  p_idempotency_key uuid,
  p_customer_name text,
  p_customer_phone text,
  p_source text default 'web'
)
returns table (order_id bigint, public_code text, total numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_distinct_products integer;
  v_existing public.orders%rowtype;
  v_order public.orders%rowtype;
  v_requested_products integer;
  v_selected_products integer;
  v_total numeric;
begin
  if p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'Idempotency key is required';
  end if;

  if nullif(trim(p_customer_name), '') is null or char_length(trim(p_customer_name)) > 100 then
    raise exception using errcode = '22023', message = 'Customer name is required and must not exceed 100 characters';
  end if;

  if nullif(trim(p_customer_phone), '') is null
    or trim(p_customer_phone) !~ '^\+?[0-9]{7,15}$' then
    raise exception using errcode = '22023', message = 'Customer phone is invalid';
  end if;

  if p_source not in ('web', 'manual') then
    raise exception using errcode = '22023', message = 'Invalid order source';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception using errcode = '22023', message = 'Order items must contain between 1 and 50 entries';
  end if;

  select *
  into v_existing
  from public.orders
  where idempotency_key = p_idempotency_key;

  if found then
    return query select v_existing.id, v_existing.public_code, v_existing.total;
    return;
  end if;

  with requested as (
    select product_id, quantity
    from jsonb_to_recordset(p_items) as item(product_id bigint, quantity integer)
  )
  select count(*), count(distinct product_id)
  into v_requested_products, v_distinct_products
  from requested
  where product_id is not null and quantity > 0;

  if v_requested_products <> jsonb_array_length(p_items)
    or v_distinct_products <> v_requested_products then
    raise exception using errcode = '22023', message = 'Products and quantities must be valid and unique';
  end if;

  perform product.id
  from public.products as product
  join jsonb_to_recordset(p_items) as item(product_id bigint, quantity integer)
    on item.product_id = product.id
  order by product.id
  for share of product;

  with requested as (
    select product_id, quantity
    from jsonb_to_recordset(p_items) as item(product_id bigint, quantity integer)
  )
  select count(*), sum(product.price * requested.quantity)
  into v_selected_products, v_total
  from requested
  join public.products as product on product.id = requested.product_id
  where product.is_active = true;

  if v_selected_products <> v_requested_products then
    raise exception using errcode = 'P0002', message = 'One or more products are unavailable';
  end if;

  begin
    insert into public.orders (
      customer_name,
      customer_phone,
      address,
      total,
      status,
      source,
      idempotency_key
    ) values (
      nullif(trim(p_customer_name), ''),
      nullif(trim(p_customer_phone), ''),
      null,
      v_total,
      'pending',
      p_source,
      p_idempotency_key
    )
    returning * into v_order;

    insert into public.order_items (
      order_id,
      product_id,
      product_code,
      quantity,
      unit_price,
      subtotal
    )
    select
      v_order.id,
      product.id,
      product.code,
      requested.quantity,
      product.price,
      product.price * requested.quantity
    from jsonb_to_recordset(p_items) as requested(product_id bigint, quantity integer)
    join public.products as product on product.id = requested.product_id;
  exception
    when unique_violation then
      select *
      into v_existing
      from public.orders
      where idempotency_key = p_idempotency_key;

      if not found then
        raise;
      end if;

      return query select v_existing.id, v_existing.public_code, v_existing.total;
      return;
  end;

  return query select v_order.id, v_order.public_code, v_order.total;
end;
$$;

create or replace function public.confirm_pending_order(p_order_id bigint)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item record;
  v_expires_at timestamptz;
  v_item_count integer := 0;
  v_status text;
begin
  select status, expires_at
  into v_status, v_expires_at
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Order not found';
  end if;

  if v_status = 'confirmed' then
    return 'confirmed';
  end if;

  if v_status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'Only pending orders can be confirmed';
  end if;

  if v_expires_at <= now() then
    update public.orders
    set status = 'expired'
    where id = p_order_id;

    return 'expired';
  end if;

  for v_item in
    select order_item.product_id, order_item.quantity, product.code, product.stock, product.is_active
    from public.order_items as order_item
    join public.products as product on product.id = order_item.product_id
    where order_item.order_id = p_order_id
    order by product.id
    for update of product
  loop
    v_item_count := v_item_count + 1;

    if not v_item.is_active or v_item.stock < v_item.quantity then
      raise exception using
        errcode = 'P0001',
        message = 'Insufficient stock for product ' || v_item.code;
    end if;

    update public.products
    set stock = stock - v_item.quantity
    where id = v_item.product_id;
  end loop;

  if v_item_count = 0 then
    raise exception using errcode = 'P0002', message = 'Order has no items';
  end if;

  update public.orders
  set status = 'confirmed', confirmed_at = now(), rejected_at = null
  where id = p_order_id;

  return 'confirmed';
end;
$$;

create or replace function public.reject_pending_order(
  p_order_id bigint,
  p_reason text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
begin
  if p_reason is not null and char_length(trim(p_reason)) > 500 then
    raise exception using errcode = '22023', message = 'Rejection reason must not exceed 500 characters';
  end if;

  select status
  into v_status
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Order not found';
  end if;

  if v_status = 'rejected' then
    return 'rejected';
  end if;

  if v_status <> 'pending' then
    raise exception using errcode = 'P0001', message = 'Only pending orders can be rejected';
  end if;

  update public.orders
  set
    status = 'rejected',
    rejection_reason = nullif(trim(p_reason), ''),
    rejected_at = now(),
    confirmed_at = null
  where id = p_order_id;

  return 'rejected';
end;
$$;

create or replace function public.expire_pending_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_expired_count integer;
begin
  update public.orders
  set status = 'expired'
  where status = 'pending' and expires_at <= now();

  get diagnostics v_expired_count = row_count;
  return v_expired_count;
end;
$$;

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on function public.next_order_public_code() from public, anon, authenticated;
revoke all on function public.create_pending_order(jsonb, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.confirm_pending_order(bigint) from public, anon, authenticated;
revoke all on function public.reject_pending_order(bigint, text) from public, anon, authenticated;
revoke all on function public.expire_pending_orders() from public, anon, authenticated;

grant execute on function public.create_pending_order(jsonb, uuid, text, text, text) to service_role;
grant execute on function public.confirm_pending_order(bigint) to service_role;
grant execute on function public.reject_pending_order(bigint, text) to service_role;
grant execute on function public.expire_pending_orders() to service_role;

commit;
