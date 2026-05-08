-- Badge catalog (port of backend/constants.py:118-272 BADGE_CATALOG).
-- Stored as a table so the RPC can join against it instead of hardcoding badge logic.

create table public.badges (
  id            text primary key,
  title         text not null,
  description   text not null,
  icon          text not null,
  points        int not null default 0,
  type          text not null,        -- e.g. 'total_findings', 'category_count', ...
  target        int not null,
  category      text,                 -- only set for category_count / category_unique_species
  subcategory   text,                 -- only set for subcategory_unique_species
  keyword       text,                 -- only set for habitat_contains
  sort_order    int not null
);
alter table public.badges enable row level security;
create policy "badges_select_all" on public.badges for select using (true);

insert into public.badges (id, title, description, icon, points, type, target, category, subcategory, keyword, sort_order) values
  ('first_find', 'Første fund', 'Gem dit første fund.', 'leaf', 40, 'total_findings', 1, null, null, null, 1),
  ('ten_findings', '10 dyr fundet', 'Gem 10 fund i samlingen.', 'albums', 80, 'total_findings', 10, null, null, null, 2),
  ('fifty_findings', '50 dyr fundet', 'Gem 50 fund i samlingen.', 'trophy', 120, 'total_findings', 50, null, null, null, 3),
  ('first_insect', 'Første insekt', 'Gem dit første insekt.', 'bug', 50, 'category_count', 1, 'Insekter', null, null, 4),
  ('first_bird', 'Første fugl', 'Gem din første fugl.', 'navigate', 50, 'category_count', 1, 'Fugle', null, null, 5),
  ('first_mammal', 'Første pattedyr', 'Gem dit første pattedyr.', 'paw', 50, 'category_count', 1, 'Pattedyr', null, null, 6),
  ('beetle_hunter', 'Billejæger', 'Find 3 forskellige biller.', 'shield-checkmark', 70, 'subcategory_unique_species', 3, null, 'Biller', null, 7),
  ('bird_watcher', 'Fuglekigger', 'Find 5 forskellige fuglearter.', 'eye', 80, 'category_unique_species', 5, 'Fugle', null, null, 8),
  ('forest_researcher', 'Skovforsker', 'Gem 3 fund fra skov og skovkanter.', 'leaf', 80, 'habitat_contains', 3, null, null, 'skov', 9),
  ('beach_finder', 'Strandfinder', 'Gem 3 hav- og stranddyr.', 'water', 75, 'category_count', 3, 'Hav- og stranddyr', null, null, 10),
  ('nature_nerd', 'Naturnørd', 'Optjen 250 point.', 'sparkles', 60, 'total_points', 250, null, null, null, 11),
  ('weekend_explorer', 'Weekend-opdager', 'Gem 3 weekendfund.', 'sunny', 65, 'weekend_findings', 3, null, null, null, 12),
  ('denmark_collector', 'Danmarkssamler', 'Find dyr i 5 forskellige kommuner eller områder.', 'map', 90, 'municipality_count', 5, null, null, null, 13),
  ('ten_unique_insects', '10 forskellige insekter', 'Find 10 forskellige insektarter.', 'bug', 110, 'category_unique_species', 10, 'Insekter', null, null, 14),
  ('ten_unique_birds', '10 forskellige fugle', 'Find 10 forskellige fuglearter.', 'navigate-circle', 110, 'category_unique_species', 10, 'Fugle', null, null, 15),
  ('all_seasons', 'Fund i alle årstider', 'Gem mindst ét fund i hver årstid.', 'partly-sunny', 100, 'season_count', 4, null, null, null, 16);


-- Helper: season string (port of backend/scoring.py:14-22).
create or replace function public.season_of(ts timestamptz)
returns text
language sql
immutable
as $$
  select case extract(month from ts)::int
    when 12 then 'vinter' when 1 then 'vinter' when 2 then 'vinter'
    when 3 then 'forår' when 4 then 'forår' when 5 then 'forår'
    when 6 then 'sommer' when 7 then 'sommer' when 8 then 'sommer'
    else 'efterår'
  end;
$$;


-- get_badges: returns one row per badge with progress + unlocked status for the user.
-- Port of backend/scoring.py:65-128 build_badges.
create or replace function public.get_badges(p_user_id uuid)
returns table (
  id text, title text, description text, icon text,
  progress int, target int, unlocked boolean,
  "unlockedAt" timestamptz, points int
)
language plpgsql
stable
security invoker
as $$
begin
  return query
  with f as (
    select * from public.findings where "userId" = p_user_id
  ),
  totals as (
    select
      count(*)::int as total_findings,
      coalesce(sum("awardedPoints"), 0)::int as total_points,
      count(distinct case when btrim(coalesce(municipality,'')) <> '' then btrim(municipality) end)::int as municipality_count,
      count(distinct public.season_of("capturedAt"))::int as season_count,
      count(*) filter (where extract(isodow from "capturedAt") >= 6)::int as weekend_findings
    from f
  ),
  per_cat as (
    select category, count(*)::int as cat_count,
           count(distinct lower(btrim(coalesce(nullif("latinName",''), "danishName"))))::int as cat_unique
    from f group by category
  ),
  per_subcat as (
    select subcategory,
           count(distinct lower(btrim(coalesce(nullif("latinName",''), "danishName"))))::int as sub_unique
    from f group by subcategory
  ),
  per_habitat as (
    -- expand to one row per (badge_keyword, finding) pair where habitat contains keyword
    select b.keyword, count(*)::int as habitat_count
    from public.badges b
    join f on b.type = 'habitat_contains' and lower(coalesce(f.habitat,'')) like '%' || b.keyword || '%'
    group by b.keyword
  ),
  latest_capture as (
    select max("capturedAt") as last_at from f
  )
  select
    b.id, b.title, b.description, b.icon,
    coalesce(case b.type
      when 'total_findings'           then (select total_findings from totals)
      when 'total_points'             then (select total_points from totals)
      when 'municipality_count'       then (select municipality_count from totals)
      when 'season_count'             then (select season_count from totals)
      when 'weekend_findings'         then (select weekend_findings from totals)
      when 'category_count'           then (select cat_count from per_cat where category = b.category)
      when 'category_unique_species'  then (select cat_unique from per_cat where category = b.category)
      when 'subcategory_unique_species' then (select sub_unique from per_subcat where subcategory = b.subcategory)
      when 'habitat_contains'         then (select habitat_count from per_habitat where keyword = b.keyword)
      else 0
    end, 0) as progress,
    b.target,
    coalesce(case b.type
      when 'total_findings'           then (select total_findings from totals)
      when 'total_points'             then (select total_points from totals)
      when 'municipality_count'       then (select municipality_count from totals)
      when 'season_count'             then (select season_count from totals)
      when 'weekend_findings'         then (select weekend_findings from totals)
      when 'category_count'           then (select cat_count from per_cat where category = b.category)
      when 'category_unique_species'  then (select cat_unique from per_cat where category = b.category)
      when 'subcategory_unique_species' then (select sub_unique from per_subcat where subcategory = b.subcategory)
      when 'habitat_contains'         then (select habitat_count from per_habitat where keyword = b.keyword)
      else 0
    end, 0) >= b.target as unlocked,
    case when coalesce(case b.type
      when 'total_findings'           then (select total_findings from totals)
      when 'total_points'             then (select total_points from totals)
      when 'municipality_count'       then (select municipality_count from totals)
      when 'season_count'             then (select season_count from totals)
      when 'weekend_findings'         then (select weekend_findings from totals)
      when 'category_count'           then (select cat_count from per_cat where category = b.category)
      when 'category_unique_species'  then (select cat_unique from per_cat where category = b.category)
      when 'subcategory_unique_species' then (select sub_unique from per_subcat where subcategory = b.subcategory)
      when 'habitat_contains'         then (select habitat_count from per_habitat where keyword = b.keyword)
      else 0
    end, 0) >= b.target then (select last_at from latest_capture) end as "unlockedAt",
    b.points
  from public.badges b
  order by b.sort_order;
end;
$$;
