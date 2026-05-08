-- Dyrejagten — initial schema
-- Tables use quoted camelCase identifiers so PostgREST returns the same shape the frontend expects.

create extension if not exists "pgcrypto";

-- profiles: 1 row per Supabase auth user
create table public.profiles (
  "userId"             uuid primary key references auth.users(id) on delete cascade,
  "displayName"        text not null default 'Naturven',
  "allowLocation"      boolean not null default false,
  "onboardingCompleted" boolean not null default false,
  "createdAt"          timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = "userId");
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = "userId");
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = "userId") with check (auth.uid() = "userId");
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = "userId");


-- species: shared catalog (one row per species across all users)
create table public.species (
  slug                       text primary key,
  "danishName"               text not null,
  "latinName"                text not null,
  category                   text not null,
  subcategory                text not null,
  family                     text not null default 'Ukendt',
  size                       text default 'Ikke angivet',
  appearance                 text default 'Ikke angivet',
  characteristics            jsonb not null default '[]'::jsonb,
  habitat                    text not null default 'Ikke angivet',
  diet                       text default 'Ikke angivet',
  "activePeriod"             text default 'Ikke angivet',
  "rarityStatus"             text not null default 'Almindelig',
  warning                    text not null default 'Ikke farlig for mennesker',
  "cautionAdvice"            text not null default 'Hold afstand og tag kun billeder.',
  "confusionSpecies"         jsonb not null default '[]'::jsonb,
  "funFact"                  text default 'Ikke angivet',
  "childFriendlyExplanation" text default 'Ikke angivet',
  description                text default 'Ikke angivet',
  commonality                text default 'Almindelig i Danmark',
  "createdAt"                timestamptz not null default now(),
  "updatedAt"                timestamptz not null default now()
);
alter table public.species enable row level security;
-- All authenticated users can read species; only authenticated users can upsert (no per-user ownership).
create policy "species_select_all" on public.species for select using (true);
create policy "species_insert_authenticated" on public.species for insert
  with check (auth.role() = 'authenticated');
create policy "species_update_authenticated" on public.species for update
  using (auth.role() = 'authenticated');


-- findings: one row per saved finding
create table public.findings (
  id                          uuid primary key default gen_random_uuid(),
  "userId"                    uuid not null references auth.users(id) on delete cascade,
  "imagePath"                 text not null,
  "capturedAt"                timestamptz not null,
  "dateLabel"                 text not null,
  "timeLabel"                 text not null,
  latitude                    double precision,
  longitude                   double precision,
  municipality                text,
  "danishName"                text not null,
  "latinName"                 text not null,
  category                    text not null,
  subcategory                 text not null,
  "confidenceScore"           real not null default 0,
  description                 text not null default '',
  characteristics             jsonb not null default '[]'::jsonb,
  habitat                     text not null default '',
  "rarityStatus"              text not null default 'Almindelig',
  "aiVerifiedStatus"          text not null default 'AI-vurderet',
  "userNote"                  text not null default '',
  "alternativeSuggestions"    jsonb not null default '[]'::jsonb,
  warning                     text not null default 'Ikke farlig for mennesker',
  "cautionAdvice"             text not null default 'Hold afstand og tag kun billeder.',
  size                        text default 'Ikke angivet',
  appearance                  text default 'Ikke angivet',
  diet                        text default 'Ikke angivet',
  "activePeriod"              text default 'Ikke angivet',
  "confusionSpecies"          jsonb not null default '[]'::jsonb,
  "funFact"                   text default 'Ikke angivet',
  "childFriendlyExplanation"  text default 'Ikke angivet',
  family                      text default 'Ukendt',
  commonality                 text default 'Almindelig i Danmark',
  "awardedPoints"             int not null default 0,
  "isNewSpecies"              boolean not null default false,
  "isFirstInCategory"         boolean not null default false,
  "createdAt"                 timestamptz not null default now()
);
create index findings_user_idx on public.findings ("userId");
create index findings_user_captured_idx on public.findings ("userId", "capturedAt" desc);
create index findings_user_latin_idx on public.findings ("userId", "latinName");
alter table public.findings enable row level security;
create policy "findings_select_own" on public.findings for select using (auth.uid() = "userId");
create policy "findings_insert_own" on public.findings for insert with check (auth.uid() = "userId");
create policy "findings_update_own" on public.findings for update using (auth.uid() = "userId") with check (auth.uid() = "userId");
create policy "findings_delete_own" on public.findings for delete using (auth.uid() = "userId");


-- Storage bucket for finding images. Owner-scoped: path is "<userId>/<finding_id>.jpg".
insert into storage.buckets (id, name, public)
values ('findings', 'findings', true)
on conflict (id) do nothing;

create policy "findings_storage_owner_insert" on storage.objects for insert
  with check (bucket_id = 'findings' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "findings_storage_owner_delete" on storage.objects for delete
  using (bucket_id = 'findings' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "findings_storage_public_read" on storage.objects for select
  using (bucket_id = 'findings');


-- Rate limit table for the analyze-animal Edge Function (30 calls/day/user default).
create table public.rate_limits (
  "userId"   uuid not null references auth.users(id) on delete cascade,
  bucket     text not null,                    -- e.g. 'analyze_animal'
  "windowDate" date not null default current_date,
  "count"    int not null default 0,
  primary key ("userId", bucket, "windowDate")
);
alter table public.rate_limits enable row level security;
-- Only the service role (Edge Function with SUPABASE_SERVICE_ROLE_KEY) writes here; users do not read it.
