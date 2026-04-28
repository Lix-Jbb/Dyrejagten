# NaturFinder PRD

## Problem Statement
Native mobilapp til iOS og Android for danske brugere, hvor man kan tage eller vælge billeder af dyr i Danmark, få AI-analyse på dansk, gemme fund i personlig samling og motiveres via point, badges, kategorier og kort.

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

## Prioritized Backlog
### P0
- Verificér komplet web-preview upload-flow end-to-end efter preview-tunnel er stabil
- Lad brugerens egen OpenAI-nøgle overtage igen, når den har aktiv quota

### P1
- Eksport af fund
- Bedre map-visualisering med ægte interaktivt kort på native
- Mere robust web upload-testbarhed for expo-image-picker

### P2
- Push-notifikationer for badges
- Sæsonmål og månedlige udfordringer
- Offline caching og hurtigere billedbehandling

## Features Remaining by Priority
- **P0:** Endelig E2E-verificering af billede -> analyse -> gem -> samling via preview
- **P1:** Data-eksport, rigere profilindstillinger, native map-forbedring
- **P2:** Påmindelser, challenges, mere gamification-dybde

## Next Tasks List
1. Skift tilbage til brugerens egen OpenAI-nøgle, når quota er aktiv
2. Kør ny fuld browser-test af galleri-upload og gem-fund flow
3. Tilføj eksport af fund og flere profilvalg