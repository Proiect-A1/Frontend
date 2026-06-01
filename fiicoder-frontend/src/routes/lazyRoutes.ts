import { lazyWithRetry } from "../utils/lazyWithRetry";

// Fiecare ruta code-split e definita o singura data ca factory de import, ca sa putem
// (a) sa o lazy-load-uim in App si (b) sa-i facem prefetch la hover din Navbar.
// Astfel chunk-ul greu (ex. Monaco in ProblemDetails) e deja in cache cand userul da click.
const routeImports = {
  landing: () => import("../pages/landing/Landing"),
  login: () => import("../pages/login/Login"),
  problemList: () => import("../pages/problemList/ProblemList"),
  problemDetails: () => import("../pages/problemDetails/ProblemDetails"),
  classesHub: () => import("../pages/classesHub/ClassesHub"),
  classDetails: () => import("../pages/classDetails/ClassDetails"),
  profile: () => import("../pages/profile/Profile"),
  adminPanel: () => import("../pages/adminPanel/AdminPanel"),
  proposeProblem: () => import("../pages/proposeProblem/ProposeProblem"),
  leaderboard: () => import("../pages/leaderboard/Leaderboard"),
  privacyPolicy: () => import("../pages/legal/PrivacyPolicy"),
  terms: () => import("../pages/legal/Terms"),
} as const;

export const Landing = lazyWithRetry(routeImports.landing);
export const Login = lazyWithRetry(routeImports.login);
export const ProblemList = lazyWithRetry(routeImports.problemList);
export const ProblemDetails = lazyWithRetry(routeImports.problemDetails);
export const ClassesHub = lazyWithRetry(routeImports.classesHub);
export const ClassDetails = lazyWithRetry(routeImports.classDetails);
export const Profile = lazyWithRetry(routeImports.profile);
export const AdminPanel = lazyWithRetry(routeImports.adminPanel);
export const ProposeProblem = lazyWithRetry(routeImports.proposeProblem);
export const Leaderboard = lazyWithRetry(routeImports.leaderboard);
export const PrivacyPolicy = lazyWithRetry(routeImports.privacyPolicy);
export const Terms = lazyWithRetry(routeImports.terms);

// Map de la prefix de path -> factory de import. Ordinea conteaza: prefixele mai
// specifice trebuie sa fie inaintea celor mai generice (nu e cazul aici, dar e o
// regula buna). Folosit de prefetchRoute pentru a alege ce chunk sa incalzim.
const PATH_PREFETCH: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ["/problems", routeImports.problemList],
  ["/leaderboard", routeImports.leaderboard],
  ["/profile", routeImports.profile],
  ["/classes", routeImports.classesHub],
  ["/propose", routeImports.proposeProblem],
  ["/admin", routeImports.adminPanel],
  ["/login", routeImports.login],
];

// Nu vrem sa lansam acelasi import de mai multe ori (browserul cache-uieste chunk-ul,
// dar evitam si promisiunile inutile). Marcam ce am pornit deja.
const prefetched = new Set<string>();

/** Incalzeste chunk-ul rutei care corespunde path-ului dat (no-op daca nu exista). */
export function prefetchRoute(path: string): void {
  const match = PATH_PREFETCH.find(([prefix]) => path.startsWith(prefix));
  if (!match) return;
  const [prefix, factory] = match;
  if (prefetched.has(prefix)) return;
  prefetched.add(prefix);

  // Programam pe idle ca prefetch-ul sa nu concureze cu randarea/interactiunea curenta.
  // Daca importul esueaza (ex. retea picata), permitem un retry ulterior.
  const run = () => void factory().catch(() => prefetched.delete(prefix));
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(run);
  } else {
    setTimeout(run, 0);
  }
}
