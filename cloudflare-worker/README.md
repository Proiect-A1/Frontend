# fiicoder-ai-proxy (Cloudflare Worker)

Proxy minimal catre OpenRouter, folosit de feature-urile de traducere AI din
`fiicoder-frontend` (`StatementTab.tsx`, `AnnouncementsTab.tsx`). Motivul de a
exista: frontend-ul e un build Vite, deci orice variabila `VITE_*` (inclusiv o
cheie de API pusa direct acolo) ajunge in clar in bundle-ul JS livrat oricui
viziteaza site-ul. Acest Worker tine cheia OpenRouter server-side, iar
frontend-ul ii vorbeste lui in loc sa bata direct spre OpenRouter.

**Important**: verificarea din `src/index.ts` (`hasPlausibleSession`) NU
verifica criptografic JWT-ul aplicatiei — Worker-ul nu are acces la secretul de
semnare al Backend-ului (echipe diferite). E doar o bariera minimala impotriva
abuzului anonim, nu o autorizare reala. Daca se poate, inlocuiti-o cu o
verificare de semnatura reala sau un secret partajat cu Backend-ul.

## Deploy (o singura data)

Necesita un cont Cloudflare (puteti folosi acelasi cont care are deja Access
configurat) si Node.js.

```bash
cd cloudflare-worker
npm install

# Autentificare cu contul Cloudflare (deschide un browser)
npx wrangler login

# Cheia OpenRouter - ROTITI cheia veche intai (a fost expusa public in frontend),
# apoi puneti aici DOAR cheia noua. Nu ajunge niciodata in git.
npx wrangler secret put OPENROUTER_API_KEY
```

Inainte de primul deploy, editati `src/index.ts` si completati
`ALLOWED_ORIGINS` cu domeniile reale de dev si prod ale frontend-ului
(altfel Worker-ul respinge orice request din afara `localhost:5173`).

```bash
npm run deploy
```

Comanda afiseaza URL-ul public, de forma
`https://fiicoder-ai-proxy.<subdomeniul-vostru>.workers.dev`.

## Conectarea la frontend

Puneti URL-ul afisat mai sus ca `VITE_AI_PROXY_URL`:

- **Local**: in `fiicoder-frontend/.env.local` (vezi `.env.example`).
- **CI/CD**: ca GitHub Actions repository *variable* (nu secret, e doar un URL
  public) numita `VITE_AI_PROXY_URL`, in `Proiect-A1/Frontend` → Settings →
  Secrets and variables → Actions → Variables. Workflow-urile
  (`deploy.yml`, `prod-deploy.yml`) o folosesc deja ca build-arg.

## Actualizari

Orice modificare in `src/index.ts` (ex. adaugarea unui model nou in
`ALLOWED_MODELS`, sau un domeniu nou in `ALLOWED_ORIGINS`) necesita un nou
`npm run deploy` — nu se intampla automat la push, acest Worker nu are inca
un workflow CI propriu.
