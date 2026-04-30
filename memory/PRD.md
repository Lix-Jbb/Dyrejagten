# Dyrejagten PRD

## Problem Statement
Native mobilapp til iOS og Android for danske brugere, hvor man kan tage eller vælge billeder af dyr i Danmark, få AI-analyse på dansk, gemme fund i personlig samling og motiveres via point, badges, kategorier og kort.

## Current Product Direction
- Appnavn: **Dyrejagten**
- Primært flow: Tag/vælg billede -> bekræft billede -> analyse -> gem i dyrebog -> dyreprofil
- Navigation: **Hjem, Dyrebog, Badges, Profil**
- Kamera er fjernet som separat menupunkt og ligger nu direkte på forsiden

## Architecture
- **Frontend:** Expo Router + React Native + AsyncStorage
- **Backend:** FastAPI + MongoDB
- **AI:** OpenAI GPT-5.2 vision via `emergentintegrations`, med midlertidig `EMERGENT_LLM_KEY` fallback
- **Dataflow:** Kamera/galleri -> base64 upload -> `/api/analyze` -> struktureret JSON -> `/api/findings` -> dashboard/badges/species/map

## User Personas
- **Naturinteresseret voksen:** vil registrere fund og lære mere om arter i Danmark
- **Barn/familie:** vil have enkel, visuel og tryg læring i naturen
- **Hobby-opdager:** vil samle arter, badges og oversigt over egne fund

## Core Requirements (static)
- Alt UI på dansk
- Fokus kun på dyr i Danmark
- Kamera + galleri
- Ærlig AI-usikkerhed og alternative forslag
- Gem fund med billede, tidspunkt, note og valgfri lokation
- Personlig samling, artsdetalje, score, badges og kort
- Privatlivsvenlig lokation og slet-data mulighed

## Implemented
### 2026-04-28
- Bygget FastAPI backend med profiler, AI-analyse, fund, dashboard, badges, artsdetaljer og kort-endpoints
- Tilføjet point- og badge-model samt privatlivsafrunding af sjældne arter på kort
- Bygget Expo-app med onboarding, 4-tab navigation, kamera, resultat, gem-fund, samling, score, badges, kort og profil
- Tilføjet dansk UI-tekst, naturinspireret design, trygge fallback-skærme og slet-fund/slet-data flows
- Verificeret backend via curl: `/api/analyze`, `/api/findings`, `/api/dashboard`, `/api/species`, `/api/map`
- Verificeret frontend visuelt: onboarding, hjem, score og direkte adgang til result/fallback
- Tilføjet `/app/backend/tests/test_api_flows.py` med regressionstest for API-flows
- Redesignet appen til børnevenlig dansk dyrebogsstil med stærke farver, store knapper, store overskrifter og samlekort-look
- Fjernet skriv-selv note/manual redigering af fund og art for at gøre flowet enklere for et barn på 7 år
- Tilføjet sammenligningsskærm med "Dit billede" vs. referencebillede/fallback og korte tegn at kigge efter
- Omdøbt og omstruktureret appen til **Dyrejagten** med ny bundnavigation: Hjem, Dyrebog, Badges og Profil
- Gjort forsiden ekstremt enkel med status + "Find et dyr" + direkte knapper til kamera og billedvalg
- Flyttet kamera ud af bundnavigationen og gjort den tidligere kamera-skærm til bekræftelsesskærm efter valgt billede
- Forenklet resultatflowet til ukendt-flow eller match-flow med kun få valg
- Gjort dyrebogen dynamisk pr. art, så samme art samles på samme profil med swipe mellem billeder
- Tilføjet skjult slet-funktion via diskret tre-prik-menu på dyreprofilen
- Justeret farvepaletten til rolig naturgrøn Dyrejagten-stil
- Ændret billedbekræftelsen til "Brug billede", ændret "Vælg billede" til "Kig i fotoalbum", fjernet "Flot fund"-tekster og givet analyseskærmen minimum 4 sekunders tænketid

### 2026-04-29
- Resultatskærm opdateret med "Vi"-ordlyd, manuel tekstindtastning af dyrenavn og grøn gem-popup
- Sticky tilbage-knapper tilføjet på artsdetalje og separat kortskærm
- Artsdetalje udvidet med "Her fandt jeg dyret", by/område-visning og manuel stedredigering med geokodning
- Kategori-normalisering gjort robust på frontend og backend, så fx "Leddyr" matcher "Edderkopper og smådyr" i Dyrebog, badges, dashboard og kort
- Badges-skærm justeret med tydelig tidslinje og stabilt kategori-hop til filtreret Dyrebog
- Kortmarkører gjort tydeligere og beskyttet mod at forsvinde ved upræcise stednavne
- UX-review gennemført og flere UI-poleringer lagt ind: mere tydeligt klikbart Dyrebog-kort på hjem, mere konsistent titel i Dyrebog, mere læsbar artsdetalje-header og ren Dyrebog-tab-navigation uden hængende kategorifiltre
- Gem-flow ændret: "Gem i min dyrebog" går nu direkte til artsdetaljen for det nyoprettede fund, og appen forsøger automatisk at sætte lokation via geo med manuel sted-fallback på artsdetaljen
- Race-condition i gem-flow lukket: resultatskærmens fallback vises ikke længere under redirect, fordi capture/analyse-state først ryddes efter route-skift til artsdetaljen

## Prioritized Backlog
### P0
- Verificér komplet upload -> analyse -> resultat -> gem flow end-to-end i web-preview, da Expo web picker stadig er svær at automatisere stabilt
- Lad brugerens egen OpenAI-nøgle overtage igen, når den har aktiv quota
- Finpuds endnu flere børneflader (fx endnu tydeligere badge-fejringer og silhuetter i dyrebogen)

### P1
- Eksport af fund
- Bedre map-visualisering med ægte interaktivt kort på native
- Flere badges og længere challenge-system, så børn ikke løber tør for mål

### P2
- Push-notifikationer for badges
- Sæsonmål og månedlige udfordringer
- Offline caching og hurtigere billedbehandling
- Offline AI / lydgenkendelse af fugle

## Features Remaining by Priority
- **P0:** Endelig E2E-verificering af billede -> analyse -> gem -> samling via preview
- **P1:** Data-eksport, rigere profilindstillinger, native map-forbedring, flere badges
- **P2:** Påmindelser, challenges, mere gamification-dybde, offline-funktioner

## Next Tasks List
1. Kør ny fuld browser-test af galleri-upload og gem-fund flow, når web-preview upload kan automatiseres stabilt
2. Skift tilbage til brugerens egen OpenAI-nøgle, når quota er aktiv
3. Tilføj eksport af fund, flere badges og flere profilvalg