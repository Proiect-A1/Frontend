import { loadMapping, getMappingSync } from './mappingLoader';

type MappingFile = {
  caseInsensitive?: boolean;
  wordBoundary?: boolean;
  mappings?: Record<string, Record<string, string>>;
  regexMappings?: Array<{
    pattern: string;
    [key: string]: string;
  }>;
  options?: {
    preserveCasing?: boolean;
  };
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function preserveCaseReplace(orig: string, replacement: string) {
  if (orig.toUpperCase() === orig) return replacement.toUpperCase();
  if (orig[0] === orig[0].toUpperCase()) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
}

// In-memory memoization cache: key -> translated string
const memo = new Map<string, string>();

const STORAGE_KEY = 'fiicoder_translation_cache';
const STORAGE_VERSION = 1;

function initializeMemoFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { version, cache } = JSON.parse(stored);
      if (version === STORAGE_VERSION && cache) {
        Object.entries(cache).forEach(([k, v]) => {
          memo.set(k, v as string);
        });
      }
    }
  } catch (err) {
    // Silently ignore storage errors
  }
}

function persistMemoToStorage() {
  try {
    const cache = Object.fromEntries(memo);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, cache }));
  } catch (err) {
    // Silently ignore storage errors (quota exceeded, etc.)
  }
}

// Initialize on module load
initializeMemoFromStorage();

function translateImpl(text: string, to: string = 'en', cfg: MappingFile) {
  if (!text) return text;

  const caseInsensitive = cfg.caseInsensitive ?? true;
  const wordBoundary = cfg.wordBoundary ?? true;
  const preserveCasing = cfg.options?.preserveCasing ?? true;

  let out = text;

  // Apply regexMappings first (in order)
  if (Array.isArray(cfg.regexMappings)) {
    for (const item of cfg.regexMappings) {
      try {
        const flags = caseInsensitive ? 'gi' : 'g';
        const re = new RegExp(item.pattern, flags);
        const replacement = (item as any)[to] || item.en || Object.values(item)[0];
        out = out.replace(re, (m) => (preserveCasing ? preserveCaseReplace(m, replacement) : replacement));
      } catch (err) {
        // ignore invalid regex
      }
    }
  }

  // Apply simple token mappings
  if (cfg.mappings && typeof cfg.mappings === 'object') {
    // Sort keys by length desc to avoid partial replacements
    const keys = Object.keys(cfg.mappings).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const target = (cfg.mappings as any)[key][to] || (cfg.mappings as any)[key].en;
      if (!target) continue;
      const pat = wordBoundary ? `\\b${escapeRegExp(key)}\\b` : escapeRegExp(key);
      const flags = caseInsensitive ? 'gi' : 'g';
      const re = new RegExp(pat, flags);
      out = out.replace(re, (m) => (preserveCasing ? preserveCaseReplace(m, target) : target));
    }
  }

  return out;
}

export function autoTranslateProblemText(text: string, to: string = 'en') {
  if (!text) return text;
  const key = `${to}::${text}`;
  if (memo.has(key)) return memo.get(key)!;

  // Use cached mapping if available, otherwise return original
  const cfg = getMappingSync(to);
  if (!cfg) {
    // Mapping not loaded yet; return original text
    // Note: async loader should be called beforehand
    return text;
  }

  const res = translateImpl(text, to, cfg);
  memo.set(key, res);
  persistMemoToStorage();
  return res;
}

// Async worker-backed translator. Uses a module worker (Vite / modern bundlers).
let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, (s: string) => void>();

function ensureWorker() {
  if (worker) return worker;
  try {
    // Vite supports new URL(..., import.meta.url) for worker creation
    worker = new Worker(new URL('./translate.worker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener('message', (ev) => {
      const { id, result } = ev.data || {};
      const cb = pending.get(id);
      if (cb) {
        pending.delete(id);
        cb(result);
      }
    });
  } catch (err) {
    // Worker not supported / bundler issue; leave worker null and fall back
    worker = null;
  }
  return worker;
}

export async function autoTranslateProblemTextAsync(text: string, to: string = 'en'): Promise<string> {
  if (!text) return text;
  const key = `${to}::${text}`;
  if (memo.has(key)) return memo.get(key)!;

  // Ensure mapping is loaded
  const cfg = await loadMapping(to);

  const wk = ensureWorker();
  if (!wk) {
    // fallback: run on main thread but async
    return new Promise((res) => {
      setTimeout(() => {
        const out = translateImpl(text, to, cfg);
        memo.set(key, out);
        persistMemoToStorage();
        res(out);
      }, 0);
    });
  }

  return new Promise((res) => {
    const id = nextId++;
    pending.set(id, (result: string) => {
      memo.set(key, result);
      persistMemoToStorage();
      res(result);
    });
    wk.postMessage({ id, text, to, mapping: cfg });
  });
}

export function clearTranslationCache() {
  memo.clear();
  localStorage.removeItem(STORAGE_KEY);
}

export default autoTranslateProblemText;
