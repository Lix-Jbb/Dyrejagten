-- get_species_detail: species info + user's findings of that species in one round-trip.
-- Port of backend/server.py:352-367 get_species_detail.

create or replace function public.get_species_detail(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql
stable
security invoker
as $$
declare
  species_row public.species%rowtype;
  result jsonb;
begin
  select * into species_row from public.species where slug = p_slug;
  if not found then
    raise exception 'Arten blev ikke fundet' using errcode = 'P0002';
  end if;

  with user_findings as (
    select to_jsonb(f.*) as row from public.findings f
    where f."userId" = p_user_id and f."latinName" = species_row."latinName"
    order by f."capturedAt" desc
    limit 100
  ),
  findings_agg as (
    select coalesce(jsonb_agg(row), '[]'::jsonb) as agg from user_findings
  )
  select to_jsonb(species_row) || jsonb_build_object('findings', (select agg from findings_agg))
  into result;

  return result;
end;
$$;
