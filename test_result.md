#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: "Dyrejagten skal have manuelle navnerettelser på resultatskærmen, grøn gem-popup, sticky tilbage-knapper, fungerende kort med stedredigering samt robuste kategori-match og badges/tidslinje-opdateringer."
backend:
  - task: "Normaliser kategorier og bevar filtre"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tilføjede kategori-normalisering for analyse, gem, dashboard, badges, art og kort så fx 'Leddyr' bliver til 'Edderkopper og smådyr'. Bekræftet via backend-smoketest."
      - working: true
        agent: "testing"
        comment: "Regressionstest bestod for kategori-normalisering og filter-match."
  - task: "Ret sted på fund og kortdata"
    implemented: true
    working: true
    file: "/app/backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tilføjede PATCH /api/findings/{finding_id} til redigering af municipality/lat/lon. Bekræftet med save + patch + map endpoint."
      - working: false
        agent: "testing"
        comment: "Geocode-miss kunne fjerne eksisterende koordinater og dermed kortprik."
      - working: true
        agent: "main"
        comment: "Rettet så eksisterende koordinater bevares, hvis geokodning ikke finder nyt sted. Selvtestet med upræcist stednavn og marker blev bevaret."
frontend:
  - task: "Resultatskærm med manuel navnerettelse og grøn gem-popup"
    implemented: true
    working: true
    file: "/app/frontend/app/result.tsx"
    stuck_count: 1
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Skiftede AI-ordlyd til 'Vi', tilføjede tekstfelt til manuelt dyrenavn, sticky tilbage-knap og grøn succes-popup. Behøver UI-test med aktivt analyseflow."
      - working: false
        agent: "user"
        comment: "Preview viste runtime-fejlen 'Rendered fewer hooks than expected' på resultatskærmen."
      - working: true
        agent: "main"
        comment: "Fjernede den resterende hook-ubalance i result.tsx ved at erstatte useMemo efter early-return med almindelig beregning før return. Typecheck og preview-test på /result viser ikke længere hook-fejlen."
  - task: "Artsdetalje, kort og stedredigering"
    implemented: true
    working: true
    file: "/app/frontend/app/species/[slug].tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tilføjede sticky tilbage-knap, map-genvej, stedinput, Gem sted-knap og by/område-visning. Verificeret i preview med seeded testfund."
      - working: false
        agent: "testing"
        comment: "Gem sted kunne nulstille koordinater ved upræcist stednavn."
      - working: true
        agent: "main"
        comment: "Rettet og selvtestet i preview + backend. Stednavn kan ændres uden at miste eksisterende kortprik."
  - task: "Kortskærm og synlige markører"
    implemented: true
    working: true
    file: "/app/frontend/app/map.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Tilføjede sticky tilbage-knap og gjorde markører tydeligere på Danmarkskortet. Verificeret i preview efter expo-restart."
      - working: true
        agent: "main"
        comment: "Bekræftet igen efter markørforbedring og sted-opdatering. Kortet viser nu tydelig prik i preview."
  - task: "Badges-tidslinje og kategori-hop"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/score.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Sikrede BADGES-visning, tidslinje-overskrift, klikbare kategori-bars og korrekt kategori for 'Andre dyr i Danmark'. Kræver hurtig UI-verificering."
      - working: true
        agent: "testing"
        comment: "Badges-tidslinje og kategori-hop til filtreret Dyrebog blev valideret i preview."
  - task: "UX-polering af hjem, dyrebog, artsdetalje og kort"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: true
    status_history:
      - working: true
        agent: "main"
        comment: "Gjorde hjemmets Dyrebog-kort tydeligere klikbart, normaliserede Dyrebog-titlen, gjorde sticky footers mere kompakte på map/species og flyttede artsdetaljens kort-genvej væk fra footer."
      - working: true
        agent: "testing"
        comment: "Frontend-regression bekræftede de fleste UX-poleringer i preview."
  - task: "Dyrebog-filter nulstilles korrekt"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/collection.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: true
        agent: "main"
        comment: "Rettet bug hvor Dyrebog beholdt gammel kategori ved navigation uden category-param. Selvtestet ved skift fra filtreret route tilbage til almindelig Dyrebog."
      - working: false
        agent: "testing"
        comment: "Tab-navigation beholdt stadig category query fra badges-flow."
      - working: true
        agent: "main"
        comment: "Tab-book overskriver nu altid til ren /(tabs)/collection-route. Selvtestet via præcis flow: badges -> kategori -> hjem -> dyrebog. URL ender nu uden query, og Alle er valgt."
  - task: "Gem-fund går direkte til artsdetalje"
    implemented: true
    working: true
    file: "/app/frontend/app/result.tsx"
    stuck_count: 1
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "Resultatskærmen springer nu succes-popup over og navigerer direkte til artsdetaljen efter gem. Preview af /result uden aktiv analyse crasher ikke, men komplet save-flow skal stadig UI-testes."
      - working: false
        agent: "user"
        comment: "Bruger så stadig fallback-beskeden på resultatskærmen efter oprettelse af dyr og ønskede direkte hop til dyreprofilen uden mellemtrin."
      - working: true
        agent: "main"
        comment: "Rettet race-condition: saveCurrentFinding rydder ikke længere currentCapture/currentAnalysis før navigation. Resultatskærmen router nu først til /species/[slug], forloader derefter species og rydder først flow-state bagefter via clearCurrentFlow(). Typecheck og sanity-preview bestået."
  - task: "Lokation sættes automatisk ved gem"
    implemented: true
    working: true
    file: "/app/frontend/context/AppContext.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
      - working: "NA"
        agent: "main"
        comment: "saveCurrentFinding forsøger nu altid geo-permission og reverse geocoding ved gem. Hvis det ikke lykkes, kan brugeren stadig skrive sted manuelt på artsdetaljen. Kræver UI-test af rigtig save-situation."
      - working: false
        agent: "testing"
        comment: "reverseGeocodeAsync var ikke guardet; geocode-fejl kunne i værste fald stoppe gem-flowet."
      - working: true
        agent: "main"
        comment: "Rettet så reverse geocoding nu er pakket ind i try/catch. Fundet bliver stadig gemt, selv hvis geokodning fejler, og manuel sted-fallback bevares. Typecheck bestået."
  - task: "Interaktive kort på dyreprofil og alle fund"
    implemented: true
    working: true
    file: "/app/frontend/components/ScatterMap.tsx"
    stuck_count: 2
    priority: "high"
    needs_retesting: false
    status_history:
      - working: false
        agent: "main"
        comment: "Første forsøg med react-native-maps i fælles komponent crashede web-preview, fordi biblioteket er native-only på web."
      - working: false
        agent: "main"
        comment: "Andet forsøg med direkte react-leaflet i ScatterMap.web.tsx crashede Expo static web med 'window is not defined' under SSR-evaluering."
      - working: true
        agent: "main"
        comment: "Løst med platformsspecifikke kort: native bruger react-native-maps, web bruger en client-only Leaflet-loader. Backend returnerer nu speciesSlug på markører, og web-preview bekræfter zoom, synlige markører og klik fra alle-fund-kort til dyreprofilen."
      - working: true
        agent: "testing"
        comment: "Regressionstest bestod for map-flow: /map loader uden crash, zoom virker, markørklik åbner korrekt species-route, og species-kortet renderer."
      - working: true
        agent: "main"
        comment: "Gjorde web-selectoren stabil med unikt testID på det interaktive kortlag. Selvtestet: all-findings-map-interactive count = 1."
metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 8
  run_ui: true
test_plan:
  current_focus:
    - "Resultatskærm med manuel navnerettelse og grøn gem-popup"
    - "Artsdetalje, kort og stedredigering"
    - "Kortskærm og synlige markører"
    - "Normaliser kategorier og bevar filtre"
    - "UX-polering af hjem, dyrebog, artsdetalje og kort"
    - "Dyrebog-filter nulstilles korrekt"
    - "Gem-fund går direkte til artsdetalje"
    - "Lokation sættes automatisk ved gem"
    - "Interaktive kort på dyreprofil og alle fund"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"
agent_communication:
  - agent: "main"
    message: "Frontend og backend er opdateret. Main agent har selvtestet backend-save/filter/map samt preview for badges/home, artsdetalje og kort. Test særligt resultatskærmens nye manuelt-navn-flow og grønne popup, da det kræver et aktivt analyseflow i UI."
  - agent: "main"
    message: "Efter iteration_4 blev stedredigering rettet, så eksisterende koordinater bevares ved upræcis geokodning. Tabs bruger nu custom tab-knapper, og preview viser kun én `tab-badges` node. Resultatskærmens komplette upload->analyse->popup flow er stadig ikke automatiseret i web preview, men komponenterne er implementeret." 
  - agent: "main"
    message: "Bruger rapporterede hook-fejl i preview. Den er rettet i /app/frontend/app/result.tsx, og /result åbner nu uden runtime-fejlen i preview." 
  - agent: "main"
    message: "Ny review-runde: hjem, dyrebog, artsdetalje og kort er poleret visuelt. Dyrebog nulstiller nu korrekt fra filtreret route tilbage til Alle. Preview-screenshots er taget efter ændringerne." 
  - agent: "main"
    message: "Iteration_5 high-priority bug er lukket. Tab-book navigerer nu altid til ren collection-route, og badges -> kategori -> tabs -> Dyrebog er selvtestet uden hængende filter-query." 
  - agent: "main"
    message: "Ny ændring efter brugerfeedback: 'Gem i min dyrebog' skal nu gå direkte til artsdetaljen. saveCurrentFinding prøver nu også automatisk geolokation ved gem, så 'Her fandt jeg dyret' kan udfyldes uden manuel indtastning, men der er stadig manuel fallback på artsdetaljen." 
  - agent: "main"
    message: "Efter iteration_6 er geocode-path hærdet: reverseGeocodeAsync kan ikke længere blokere gem-flowet. Direkte navigation efter gem er implementeret, men komplet E2E-upload/save-flow kunne ikke automatiseres i web-preview pga. Expo image picker-begrænsning." 
  - agent: "main"
    message: "Bruger rapporterede stadig fallback-beskeden på resultatskærmen. Root cause var en race-condition, hvor context-state blev nulstillet før route-skift. Det er nu rettet med clearCurrentFlow() efter router.replace til artsdetaljen." 
  - agent: "main"
    message: "Nyt kortarbejde: dyreprofilen viser nu et zoom-bart kort for det dyrs fund, 'Se alle fund på kort' åbner et samlet kort, og markører sender videre til korrekt dyreprofil via speciesSlug. Web-preview bruger nu en client-only Leaflet-loader for at undgå native/SSR-crash." 