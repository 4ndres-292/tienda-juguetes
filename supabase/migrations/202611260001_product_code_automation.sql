begin;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_index as index_definition
    join pg_catalog.pg_attribute as attribute
      on attribute.attrelid = index_definition.indrelid
      and attribute.attnum = any(index_definition.indkey)
    where index_definition.indrelid = 'public.products'::regclass
      and index_definition.indisunique
      and index_definition.indnkeyatts = 1
      and attribute.attname = 'code'
  ) then
    raise exception 'products.code debe tener una restricción o índice UNIQUE';
  end if;
end;
$$;

alter table public.categories
  add column code_prefix text;

update public.categories
set code_prefix = case slug
  when 'peluches' then 'PEL'
  when 'vehiculos' then 'CAR'
  when 'munecas' then 'MUN'
  when 'educativos' then 'EDU'
  when 'juegos-de-mesa' then 'JME'
  when 'otros' then 'OTR'
end;

do $$
begin
  if exists (
    select 1
    from public.categories
    where code_prefix is null
  ) then
    raise exception 'Todas las categorías deben tener un prefijo configurado';
  end if;
end;
$$;

alter table public.categories
  alter column code_prefix set not null,
  add constraint categories_code_prefix_format_check
    check (code_prefix ~ '^[A-Z]{2,5}$'),
  add constraint categories_code_prefix_key unique (code_prefix);

create table public.product_code_counters (
  category_id bigint primary key references public.categories(id) on delete restrict,
  last_value bigint not null default 0 check (last_value >= 0)
);

-- Inicializa cada contador sin alterar los códigos históricos.
-- MAX solo se usa una vez para adoptar códigos que ya sigan el nuevo formato;
-- la generación posterior utiliza actualizaciones atómicas del contador.
insert into public.product_code_counters (category_id, last_value)
select
  category.id,
  coalesce(
    max(
      case
        when product.code ~ ('^' || category.code_prefix || '-[0-9]+$')
          then substring(product.code from '[0-9]+$')::bigint
        else 0
      end
    ),
    0
  )
from public.categories as category
left join public.products as product on product.category_id = category.id
group by category.id;

alter table public.product_code_counters enable row level security;

create or replace function public.generate_product_code()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_prefix text;
  next_value bigint;
begin
  select category.code_prefix
  into category_prefix
  from public.categories as category
  where category.id = new.category_id;

  if category_prefix is null then
    raise exception 'La categoría no existe o no tiene un prefijo configurado'
      using errcode = '23514';
  end if;

  insert into public.product_code_counters (category_id, last_value)
  values (new.category_id, 1)
  on conflict (category_id)
  do update
    set last_value = public.product_code_counters.last_value + 1
  returning last_value into next_value;

  new.code := category_prefix || '-' || lpad(next_value::text, 4, '0');
  return new;
end;
$$;

revoke all on function public.generate_product_code() from public;

create trigger products_generate_code_before_insert
before insert on public.products
for each row
execute function public.generate_product_code();

create or replace function public.preserve_product_code()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.code := old.code;
  return new;
end;
$$;

revoke all on function public.preserve_product_code() from public;

create trigger products_preserve_code_before_update
before update of code on public.products
for each row
execute function public.preserve_product_code();

commit;
