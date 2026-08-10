# FiiCoder — Frontend

Frontend-ul platformei **FiiCoder**, o platformă de propus, rezolvat și evaluat automat probleme de programare (gen Kilonova/Codeforces), cu clase, teme, leaderboard și panou de administrare. Construit cu React + TypeScript + Vite.

## Cuprins

- [Tech stack](#tech-stack)
- [Structura proiectului](#structura-proiectului)
- [Funcționalități](#funcționalități)
- [Instalare și rulare locală](#instalare-și-rulare-locală)
- [Variabile de mediu](#variabile-de-mediu)
- [Arhitectură front-end](#arhitectură-front-end)
- [Deploy: branch-uri, medii, CI/CD](#deploy-branch-uri-medii-cicd)
- [Securitate](#securitate)
- [Diagrame](#diagrame)
- [Licență](#licență)

## Tech stack

| | |
|---|---|
| Framework | React 18 + TypeScript, build cu Vite |
| Routing | React Router (code-split, lazy-loaded pe rută + prefetch la hover) |
| Stil | Tailwind CSS 4 |
| Server state | TanStack Query |
| Formulare | React Hook Form |
| Editor de cod | Monaco Editor (`@monaco-editor/react`) |
| Animații | Framer Motion |
| Markdown/matematică | `react-markdown` + `remark-math`/`rehype-katex` (KaTeX) pentru enunțuri cu LaTeX |
| Arhive | JSZip (import/export teste ca `.zip`) |
| Notificări | Sonner (toasts) |
| Server prod/dev | Nginx (în container Docker), SPA fallback + gzip + cache pe assets |

## Structura proiectului

```
Frontend/
├── fiicoder-frontend/       # aplicația React/Vite (codul propriu-zis)
│   ├── src/
│   │   ├── pages/           # o pagină = un folder (components/hooks/services proprii)
│   │   ├── components/      # componente reutilizate global (Navbar, ProtectedRoute, ...)
│   │   ├── contexts/        # AuthContext, ThemeContext
│   │   ├── services/        # apiClient + servicii HTTP (problems, profile, tags)
│   │   ├── routes/          # registrul de lazy routes + prefetch
│   │   ├── hooks/, utils/, types/, lib/, language/
│   ├── Dockerfile           # build multi-stage: Vite -> Nginx
│   ├── nginx.conf           # SPA fallback + proxy /api -> backend
│   └── .env.example         # variabile de mediu necesare
├── cloudflare-worker/       # proxy pentru feature-urile AI (vezi Securitate)
├── diagrams/                # C1-C4, use-case, secvență, stări (draw.io / PlantUML / PDF)
├── .github/workflows/       # deploy.yml (dev), prod-deploy.yml (prod)
└── backlog.md
```

### Pagini (`src/pages/`)

| Pagină | Rută | Acces | Descriere |
|---|---|---|---|
| `landing` | `/` | public | Landing page |
| `login` | `/login` | public | Autentificare + înregistrare |
| `problemList` | `/problems` | public | Listă probleme, filtrare pe dificultate/categorii, sidebar de statistici |
| `problemDetails` | `/problems/:problemTitle` | public | Enunț (Markdown+KaTeX), editor Monaco, rulare/submisie teste, diff/notițe, panel de rezultate |
| `leaderboard` | `/leaderboard` | autentificat | Clasament utilizatori |
| `profile` | `/profile`, `/profile/:username` | autentificat | Scor, teme rezolvate, istoric, achievements, teme/homework, propuneri |
| `classesHub` / `classDetails` | `/classes`, `/classes/:groupId` | autentificat | Clase/grupe și teme (homework) asociate |
| `proposeProblem` | `/propose`, `/propose/:proposalId` | staff | Formular complet de propunere problemă: enunț, teste, limite, generator de teste, atașamente |
| `adminPanel` | `/admin` | admin | Utilizatori, anunțuri, propuneri, grupuri, tag-uri, audit log |
| `legal` | `/privacy`, `/terms` | public | Politica de confidențialitate + Termeni (GDPR) |

Accesul e impus de `ProtectedRoute` (`requireStaff` / `requireAdmin`), pe baza rolului decodat din JWT.

## Funcționalități

- **Autentificare JWT** cu access token ținut doar în memorie (nu în `localStorage`) + refresh token în cookie httpOnly, cu silent-refresh automat la expirare (vezi [Arhitectură](#arhitectură-front-end)).
- **Editor de cod integrat** (Monaco) cu syntax highlighting, temă adaptată la tema aplicației, meniu contextual custom.
- **Enunțuri Markdown + LaTeX** (KaTeX) cu preview live.
- **Submisii și testare**: rulare teste, verdicte (inclusiv fatale: FAIL/CPE), panou de diff editabil, istoric submisii per problemă.
- **Propunere probleme**: tab-uri separate pentru enunț, teste (inclusiv generator scriptabil de teste), limite (timp/memorie), atașamente, preview general; import/export teste ca `.zip`.
- **Clase și teme (homework)**: asociere probleme ↔ clase, selecție și urmărire teme per elev.
- **Leaderboard**, profil public per username, avatare din Gravatar cu fallback DiceBear.
- **Panou de administrare**: gestiune utilizatori (ban/roluri), anunțuri (cu traducere AI RO→EN), propuneri de probleme, grupuri, tag-uri, audit log.
- **Traducere asistată de AI** (RO→EN) pentru enunțuri și anunțuri, via proxy dedicat (vezi [Securitate](#securitate)) — nu apelează AI direct din browser.
- **Internaționalizare** proprie (`src/language/`) — obiect central de traduceri + `useLanguage()`.
- **Teme multiple** (inclusiv easter eggs: font pixelat, borduri "wobbly", un toggle secret) prin `ThemeContext`, aplicate și în editorul Monaco.
- **Performanță**: code-splitting per rută cu prefetch la hover/idle, chunk-uri manuale pe librării grele (Monaco, Markdown, KaTeX, JSZip), memoizare pe piese de UI.
- **Pagini legale** (Confidențialitate, Termeni) cu consimțământ GDPR, ținute non-lazy ca să nu aibă flash de loading când sunt deschise într-un tab nou.

## Instalare și rulare locală

Cerințe: Node.js 20+, npm.

```bash
cd Frontend/fiicoder-frontend
npm install
cp .env.example .env.local   # completează valorile, vezi mai jos
npm run dev
```

Aplicația pornește pe Vite (implicit `http://localhost:5173`). În dev, `/api` și `/ws` sunt proxy-ate spre `VITE_API_TARGET` (implicit `http://localhost:8080`) — vezi `vite.config.ts`.

> Dacă mediul local se dezaxează complet (dependențe stricate etc.), varianta rapidă e să ștergi complet `fiicoder-frontend/`, faci `git pull`, apoi `npm install` din nou.

Alte scripturi utile (din `fiicoder-frontend/`):

```bash
npm run build     # tsc -b && vite build -> dist/
npm run lint      # eslint
npm run preview   # servește build-ul de producție local
```

## Variabile de mediu

Definite în `fiicoder-frontend/.env.example`. Pentru dev local, copiază-l în `.env.local` (gitignored).

| Variabilă | Obligatorie | Descriere |
|---|---|---|
| `VITE_API_URL` | nu (implicit `/api`) | Base URL pentru API, folosit doar în build-uri fără proxy Vite |
| `VITE_CF_ACCESS_CLIENT_ID` / `VITE_CF_ACCESS_CLIENT_SECRET` | da | Cloudflare Access Service Token — necesar ca request-urile către `/api` să treacă de firewall-ul CF Access din fața backend-ului |
| `VITE_AI_PROXY_URL` | da, pentru feature-urile de AI | URL public al proxy-ului din `cloudflare-worker/` (traducere RO→EN) |

**Important**: fiind un build Vite, orice variabilă `VITE_*` ajunge în clar în bundle-ul JS livrat browserului — nu pune niciodată aici o cheie care trebuie să rămână secretă (ex. o cheie de AI provider). Pentru așa ceva, vezi `cloudflare-worker/`.

În CI/CD, aceste valori nu vin din `.env` — sunt injectate ca `--build-arg` din GitHub Actions secrets/variables (vezi `.github/workflows/`).

## Arhitectură front-end

- **Autentificare** (`src/services/apiClient.ts` + `src/contexts/AuthContext.tsx`): access token JWT ținut doar în memorie (niciodată în `localStorage`, ca să nu poată fi exfiltrat prin XSS), cu un marker non-sensibil în `localStorage` care spune doar "a existat o sesiune". La boot, dacă marker-ul există, se încearcă un silent refresh prin cookie-ul httpOnly de refresh token. Pe `401`, request-urile (în afară de `/auth/*`) declanșează automat un refresh și se reiau o singură dată; refresh-urile concurente sunt deduplicate (single-flight).
- **Routing & code-splitting** (`src/routes/lazyRoutes.ts`): fiecare pagină e definită o singură dată ca factory de import, folosită atât pentru `React.lazy` cât și pentru prefetch la hover pe rutele din Navbar — chunk-urile grele (ex. Monaco) sunt deja calde când userul dă click.
- **Server state**: TanStack Query (`src/lib/queryClient.ts`) pentru cache/refetch pe date din API.
- **Teme**: `ThemeContext` propagă tema curentă inclusiv în editorul Monaco (`utils/monacoTheme.ts`).
- **Pagini mari sunt modularizate**: fiecare pagină complexă (`problemDetails`, `proposeProblem`, `adminPanel`, `classDetails`) își are propriile `components/`, `hooks/`, `services/`, `types/`, `utils/` — nu un singur fișier monolit.

## Deploy: branch-uri, medii, CI/CD

Repo-ul are două medii, fiecare cu propriul branch și propriul workflow GitHub Actions (SSH pe VM + Docker Compose):

| Branch | Workflow | Mediu | Serviciu / container (pe VM) |
|---|---|---|---|
| `dev` | `.github/workflows/deploy.yml` | dev/staging | `dev-frontend` → `dev-fiicoder-frontend` (`~/fiicoder/dev/`) |
| `main` | `.github/workflows/prod-deploy.yml` | producție | `frontend` → `fiicoder-frontend` (`~/fiicoder/prod/`) |

Fluxul intenționat:

1. Lucrezi pe un branch de feature, deschizi PR spre `dev`.
2. La merge în `dev`, `deploy.yml` se declanșează automat: se face SSH pe VM, `git reset --hard` pe branch-ul `dev`, rebuild + restart la containerul `dev-frontend`.
3. Testezi pe mediul de dev.
4. Deschizi PR din `dev` spre `main`. La merge, `prod-deploy.yml` face același lucru pentru `frontend` (containerul `fiicoder-frontend`).

Alte branch-uri din repo (`dev2`, `edi`, `style-refactor`, `backup`) sunt branch-uri de lucru/arhivă — nu au workflow de deploy asociat.

**De reținut**: `main` nu se actualizează automat când pui cod pe `dev` — trebuie un PR/merge explicit `dev → main`. Dacă vrei ca prod să reflecte ce e pe dev, verifică întâi diferența (`git log origin/main..origin/dev`) și deschide acel PR.

Build-ul rulează într-un Dockerfile multi-stage (Node → Nginx), cu variabilele din tabelul de mai sus injectate ca `--build-arg` din secrets/variables definite la nivel de repo GitHub (Settings → Secrets and variables → Actions).

Numele reale ale serviciilor/containerelor de pe VM (`frontend`/`fiicoder-frontend` pentru prod, nu `prod-frontend` cum ar sugera convenția din restul proiectului) au fost confirmate direct pe server — nu presupune numele după tiparul `<env>-frontend`, verifică (`docker compose config --services`).

### Backend/DB folosit de frontend-ul de producție

Momentan, **atât `dev` cât și `main` proxiază `/api/` către același backend/DB: `dev-backend`/`dev-db`** (vezi `BACKEND_HOST` în `fiicoder-frontend/Dockerfile` și `nginx.conf.template`). Nu e o eroare de configurare — e intenționat, din următorul motiv:

- Există și un serviciu separat `backend`/`db` (containere `fiicoder-backend`/`fiicoder-db`), construit din branch-ul `main` al repo-ului **Backend**. Dar `main`-ul acela a rămas cu multe luni în urmă față de `dev` (nesincronizat), iar Backend nu are niciun workflow de deploy automat spre acel serviciu — practic e o instantanee veche, înghețată, nefolosită de nimeni.
- `dev-db` este, de facto, **baza de date reală**: conține utilizatorii și submisiile reale ale platformei, acumulate în timp ce toată lumea (inclusiv site-ul public) a vorbit cu ea. **Tratați `dev-db` cu grijă de producție** (backup înainte de orice migrare/reset destructiv) — numele "dev" e înșelător, nu conține doar date de test.
- `backend`/`db` rămân pornite pe VM ca fallback rece, cu propriile lor date vechi (instantaneu de dinainte de divergență), pentru cazul în care se decide vreodată o separare reală a mediilor (ar necesita: adus `main` din Backend la zi cu `dev`, redeploy la `backend`, și migrarea/copierea datelor reale din `dev-db` în `db`).

Dacă vreodată se face acea separare, `BACKEND_HOST` poate fi suprascris per-container din `docker-compose.yml`-ul de pe VM (implicit vine din `ENV BACKEND_HOST=dev-backend` în Dockerfile) — mecanismul e deja pregătit, doar neactivat.

## Securitate

Vezi și [`cloudflare-worker/README.md`](cloudflare-worker/README.md).

- **Nu hardcoda niciodată secrete în cod**, nici măcar ca "fallback" (`x || 'valoare'`) — fiind un build Vite, orice literal ajunge oricum în bundle-ul public, plus rămâne permanent în istoricul git chiar dacă îl ștergi ulterior dintr-un commit nou.
- **Nicio cheie de AI provider (OpenRouter/OpenAI/etc.) nu trebuie apelată direct din browser** cu cheia inclusă în request — orice `VITE_*` e vizibil oricui inspectează bundle-ul JS livrat. Feature-urile de traducere AI din `ProposeProblem` și `AdminPanel` vorbesc cu proxy-ul din `cloudflare-worker/`, care ține cheia server-side.
- Access token-ul JWT stă doar în memorie (nu `localStorage`) — vezi [Arhitectură](#arhitectură-front-end).

## Diagrame

`diagrams/` conține diagrame de arhitectură și design (draw.io `.xml`, PlantUML `.puml`, exporturi `.png`/`.pdf`): C1-C4 (context/container/component), use-case, secvență, stări.

## Licență

MIT — vezi [`LICENSE`](LICENSE).
