-- Port of backend/constants.py: CATEGORY_ALIASES + normalize_category.
-- Used by triggers and RPCs to canonicalize category strings coming from AI output.

create or replace function public.normalize_category(value text)
returns text
language plpgsql
immutable
as $$
declare
  v text;
begin
  if value is null or btrim(value) = '' then
    return 'Andre dyr i Danmark';
  end if;
  v := lower(btrim(value));

  return case v
    when 'insekt' then 'Insekter'
    when 'insekter' then 'Insekter'
    when 'bille' then 'Insekter'
    when 'biller' then 'Insekter'
    when 'sommerfugl' then 'Insekter'
    when 'fugl' then 'Fugle'
    when 'fugle' then 'Fugle'
    when 'pattedyr' then 'Pattedyr'
    when 'krybdyr' then 'Krybdyr og padder'
    when 'padde' then 'Krybdyr og padder'
    when 'padder' then 'Krybdyr og padder'
    when 'krybdyr og padder' then 'Krybdyr og padder'
    when 'frø' then 'Krybdyr og padder'
    when 'tudse' then 'Krybdyr og padder'
    when 'salamander' then 'Krybdyr og padder'
    when 'fisk' then 'Fisk'
    when 'edderkop' then 'Edderkopper og smådyr'
    when 'edderkopper' then 'Edderkopper og smådyr'
    when 'edderkopper og smådyr' then 'Edderkopper og smådyr'
    when 'leddyr' then 'Edderkopper og smådyr'
    when 'smådyr' then 'Edderkopper og smådyr'
    when 'havdyr' then 'Hav- og stranddyr'
    when 'stranddyr' then 'Hav- og stranddyr'
    when 'hav- og stranddyr' then 'Hav- og stranddyr'
    when 'hav og stranddyr' then 'Hav- og stranddyr'
    when 'andre' then 'Andre dyr i Danmark'
    when 'andet' then 'Andre dyr i Danmark'
    when 'andre dyr i danmark' then 'Andre dyr i Danmark'
    else btrim(value)
  end;
end;
$$;

-- Auto-normalize category on insert/update for both findings and species.
create or replace function public.normalize_finding_category()
returns trigger
language plpgsql
as $$
begin
  new.category := public.normalize_category(new.category);
  return new;
end;
$$;

create trigger findings_normalize_category
  before insert or update of category on public.findings
  for each row execute function public.normalize_finding_category();

create trigger species_normalize_category
  before insert or update of category on public.species
  for each row execute function public.normalize_finding_category();
