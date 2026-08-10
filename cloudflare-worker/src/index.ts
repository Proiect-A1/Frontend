/**
 * Proxy minimal catre OpenRouter pentru feature-urile de AI (traducere) din
 * ProposeProblem si AdminPanel. Motivul de a exista: fiind un build Vite, orice
 * variabila VITE_* ajunge in clar in bundle-ul JS livrat browserului, deci o cheie
 * de OpenRouter pusa direct in frontend e recuperabila de oricine deschide DevTools.
 * Cheia sta doar aici, ca secret de Worker, si frontend-ul vorbeste cu acest proxy.
 *
 * Nu verificam criptografic JWT-ul aplicatiei (nu avem secretul de semnare al
 * Backend-ului) - verificarea de mai jos e doar o bariera impotriva abuzului
 * anonim/drive-by, nu o autorizare reala. Daca la un moment dat Backend-ul poate
 * expune un secret partajat sau un endpoint de verificare, inlocuiti hasPlausibleSession.
 */

export interface Env {
  OPENROUTER_API_KEY: string;
}

// Completati cu domeniile reale de dev/prod inainte de a deploya (vezi README.md din acest folder).
const ALLOWED_ORIGINS = new Set<string>([
  "http://localhost:5173",
  "https://dev.fiicoder.top",
  "https://fiicoder.top",
]);

// Singurul model folosit de frontend in acest moment (StatementTab, AnnouncementsTab).
// Restrans intentionat ca proxy-ul sa nu poata fi folosit pentru a chema modele arbitrare/scumpe.
const ALLOWED_MODELS = new Set<string>(["deepseek/deepseek-chat-v3-0324"]);

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function corsHeaders(origin: string | null): HeadersInit {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

// Verificare superficiala: cere doar un Authorization Bearer cu forma unui JWT
// (3 segmente separate prin punct). Opreste request-uri complet anonime/scriptate
// naiv; nu inlocuieste o verificare de semnatura.
function hasPlausibleSession(request: Request): boolean {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return token.split(".").length === 3;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin");
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "Origin not allowed" }, 403, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, headers);
    }

    if (!hasPlausibleSession(request)) {
      return json({ error: "Missing session" }, 401, headers);
    }

    let body: { model?: string; messages?: unknown; response_format?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400, headers);
    }

    if (!body.model || !ALLOWED_MODELS.has(body.model)) {
      return json({ error: "Model not allowed" }, 400, headers);
    }
    if (!Array.isArray(body.messages)) {
      return json({ error: "Missing messages" }, 400, headers);
    }

    const upstream = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: body.model,
        messages: body.messages,
        // Cap fix, indiferent ce trimite clientul: fara asta OpenRouter foloseste
        // implicit maximul modelului (65536), ceea ce depaseste creditele disponibile
        // pe cont pentru orice request obisnuit de traducere.
        max_tokens: 4096,
        ...(body.response_format ? { response_format: body.response_format } : {}),
      }),
    });

    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers });
  },
};
