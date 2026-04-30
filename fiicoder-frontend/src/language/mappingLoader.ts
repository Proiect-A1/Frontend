// Lazy loader for language-specific problem translation mappings
// Caches loaded mappings in memory to avoid repeated imports

type MappingFile = {
  sourceLanguage?: string;
  fallbackLanguage?: string;
  caseInsensitive?: boolean;
  wordBoundary?: boolean;
  mappings?: Record<string, Record<string, string>>;
  regexMappings?: Array<{
    pattern: string;
    [key: string]: string;
  }>;
  options?: {
    preferTokenReplace?: boolean;
    preserveCasing?: boolean;
  };
};

const loadedMappings = new Map<string, MappingFile>();

export async function loadMapping(lang: string): Promise<MappingFile> {
  if (loadedMappings.has(lang)) {
    return loadedMappings.get(lang)!;
  }

  try {
    // Dynamic import based on language code
    const mapping = await import(`./mappings/${lang}.json`);
    const data = mapping.default as MappingFile;
    loadedMappings.set(lang, data);
    return data;
  } catch (err) {
    console.warn(`Failed to load mapping for language "${lang}":`, err);
    // Return empty mapping as fallback
    const empty: MappingFile = { mappings: {}, regexMappings: [], options: { preserveCasing: true } };
    loadedMappings.set(lang, empty);
    return empty;
  }
}

export function clearMappingCache() {
  loadedMappings.clear();
}

export function getMappingSync(lang: string): MappingFile | null {
  return loadedMappings.get(lang) || null;
}
