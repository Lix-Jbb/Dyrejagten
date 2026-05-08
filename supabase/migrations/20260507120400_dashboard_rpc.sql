-- get_dashboard: returns the same JSON shape as backend/scoring.py:131-186 build_dashboard.
-- Single round-trip from the client; aggregations done in SQL.

create or replace function public.get_dashboard(p_user_id uuid)
returns jsonb
language plpgsql
stable
security invoker
as $$
declare
  result jsonb;
  category_targets jsonb := jsonb_build_object(
    'Insekter', 12,
    'Fugle', 10,
    'Pattedyr', 8,
    'Krybdyr og padder', 6,
    'Fisk', 6,
    'Edderkopper og smådyr', 8,
    'Hav- og stranddyr', 8,
    'Andre dyr i Danmark', 6
  );
begin
  with f as (
    select * from public.findings where "userId" = p_user_id
  ),
  totals as (
    select
      count(*)::int as total_findings,
      coalesce(sum("awardedPoints"), 0)::int as total_points,
      count(distinct lower(btrim(coalesce(nullif("latinName",''), "danishName"))))::int as unique_species
    from f
  ),
  per_cat as (
    select category,
      count(*)::int as cat_count,
      count(distinct lower(btrim(coalesce(nullif("latinName",''), "danishName"))))::int as cat_unique
    from f group by category
  ),
  cat_progress as (
    select jsonb_agg(
      jsonb_build_object(
        'category', cat_key,
        'totalFindings', coalesce((select cat_count from per_cat where category = cat_key), 0),
        'uniqueSpecies', coalesce((select cat_unique from per_cat where category = cat_key), 0),
        'target', (category_targets ->> cat_key)::int,
        'progress', least(
          coalesce((select cat_count from per_cat where category = cat_key), 0)::numeric
            / nullif((category_targets ->> cat_key)::int, 0),
          1
        )
      )
      order by cat_key
    ) as agg
    from jsonb_object_keys(category_targets) as cat_key
  ),
  monthly as (
    select to_char("capturedAt", 'YYYY-MM') as month, count(*)::int as count
    from f group by to_char("capturedAt", 'YYYY-MM')
  ),
  monthly_agg as (
    select coalesce(jsonb_agg(jsonb_build_object('month', month, 'count', count) order by month desc), '[]'::jsonb) as agg
    from monthly
  ),
  recent as (
    select to_jsonb(t.*) as row from (
      select * from f order by "capturedAt" desc limit 5
    ) t
  ),
  recent_agg as (
    select coalesce(jsonb_agg(row), '[]'::jsonb) as agg from recent
  ),
  rarest as (
    select to_jsonb(t.*) as row from (
      select * from f
      order by case "rarityStatus"
        when 'Fredet' then 4
        when 'Særlig opmærksomhed' then 3
        when 'Sjælden' then 2
        when 'Invasiv' then 1
        else 0
      end desc, "confidenceScore" desc nulls last
      limit 1
    ) t
  ),
  most_photographed as (
    select category from per_cat order by cat_count desc limit 1
  ),
  badge_progress as (
    select * from public.get_badges(p_user_id)
  ),
  next_badge as (
    select to_jsonb(t.*) as row from (
      select * from badge_progress
      where unlocked = false
      order by (target - progress) asc, title asc
      limit 1
    ) t
  ),
  earned_badges as (
    select to_jsonb(t.*) as row from (
      select * from badge_progress where unlocked = true
      order by "unlockedAt" desc nulls last
      limit 6
    ) t
  ),
  earned_agg as (
    select coalesce(jsonb_agg(row), '[]'::jsonb) as agg from earned_badges
  ),
  latest_badge as (
    select to_jsonb(t.*) as row from (
      select * from badge_progress where unlocked = true
      order by "unlockedAt" desc nulls last
      limit 1
    ) t
  )
  select jsonb_build_object(
    'totalPoints', (select total_points from totals),
    'totalFindings', (select total_findings from totals),
    'uniqueSpecies', (select unique_species from totals),
    'findingsByCategory', coalesce((select agg from cat_progress), '[]'::jsonb),
    'findingsByMonth', (select agg from monthly_agg),
    'recentFindings', (select agg from recent_agg),
    'rarestFinding', (select row from rarest),
    'mostPhotographedCategory', coalesce((select category from most_photographed), 'Ingen endnu'),
    'nextBadge', (select row from next_badge),
    'earnedBadges', (select agg from earned_agg),
    'latestBadge', (select row from latest_badge)
  ) into result;

  return result;
end;
$$;
