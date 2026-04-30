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
  return s.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

function preserveCaseReplace(orig: string, replacement: string) {
  if (orig.toUpperCase() === orig) return replacement.toUpperCase();
  if (orig[0] === orig[0].toUpperCase()) return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  return replacement;
}

function translateImpl(text: string, to: string = 'en', cfg: MappingFile) {
  if (!text) return text;

  const caseInsensitive = cfg.caseInsensitive ?? true;
  const wordBoundary = cfg.wordBoundary ?? true;
  const preserveCasing = cfg.options?.preserveCasing ?? true;

  let out = text;

  if (Array.isArray(cfg.regexMappings)) {
    for (const item of cfg.regexMappings) {
      try {
        const flags = caseInsensitive ? 'gi' : 'g';
        const re = new RegExp(item.pattern, flags);
        const replacement = (item as any)[to] || item.en || Object.values(item)[0];
        out = out.replace(re, (m) => (preserveCasing ? preserveCaseReplace(m, replacement) : replacement));
      } catch (err) {
        // ignore
      }
    }
  }

  if (cfg.mappings && typeof cfg.mappings === 'object') {
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

self.addEventListener('message', (ev: MessageEvent) => {
  const { id, text, to, mapping } = ev.data || {};
  const cfg = mapping || {};
  const result = translateImpl(text, to, cfg);
  // Post back the result with same id
  (self as any).postMessage({ id, result });
});
