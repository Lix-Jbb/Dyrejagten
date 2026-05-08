-- Port of backend/scoring.py:25-62 calculate_award.
-- Runs as a BEFORE INSERT trigger so awardedPoints, isNewSpecies, isFirstInCategory
-- are computed automatically and cannot be spoofed by the client.

create or replace function public.compute_finding_award()
returns trigger
language plpgsql
as $$
declare
  candidate_key text;
  is_new_species boolean;
  is_first_in_category boolean;
  points int := 5;
  has_location boolean;
  candidate_date date;
  best_streak int := 1;
begin
  -- normalize_species_key: prefer latin name, fallback to danish name, lowercased+trimmed.
  candidate_key := lower(btrim(coalesce(nullif(new."latinName", ''), new."danishName")));

  -- Is this latinName/danishName new for the user?
  select not exists (
    select 1 from public.findings
    where "userId" = new."userId"
      and lower(btrim(coalesce(nullif("latinName", ''), "danishName"))) = candidate_key
  ) into is_new_species;

  -- Is this category new for the user?
  select not exists (
    select 1 from public.findings
    where "userId" = new."userId"
      and category = new.category
  ) into is_first_in_category;

  -- Base points
  points := case when is_new_species then 10 else 5 end;
  if is_new_species then points := points + 25; end if;
  if is_first_in_category then points := points + 40; end if;

  -- Location bonus: any of municipality/lat/lon present
  has_location := (coalesce(btrim(new.municipality), '') <> '')
                  or (new.latitude is not null)
                  or (new.longitude is not null);
  if has_location then points := points + 5; end if;

  -- Streak bonus: longest run of consecutive captured days, including today
  candidate_date := (new."capturedAt")::date;
  with days as (
    select distinct ("capturedAt")::date as d
    from public.findings
    where "userId" = new."userId"
    union
    select candidate_date
  ),
  ordered as (
    select d, lag(d) over (order by d) as prev_d from days
  ),
  groups as (
    select d,
      sum(case when prev_d is null or d - prev_d > 1 then 1 else 0 end) over (order by d) as grp
    from ordered
  )
  select coalesce(max(cnt), 1)
  into best_streak
  from (
    select count(*) as cnt from groups group by grp
  ) s;

  if best_streak >= 7 then
    points := points + 100;
  elsif best_streak >= 3 then
    points := points + 30;
  end if;

  new."awardedPoints" := points;
  new."isNewSpecies" := is_new_species;
  new."isFirstInCategory" := is_first_in_category;
  return new;
end;
$$;

create trigger findings_compute_award
  before insert on public.findings
  for each row execute function public.compute_finding_award();
