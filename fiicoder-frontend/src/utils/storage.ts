// Centralized localStorage access.
//
// Two responsibilities:
//   1. `storage` — a safe wrapper. localStorage can throw in Safari/Firefox
//      private mode or when the quota is exceeded; every access here is guarded
//      so a storage failure degrades gracefully instead of crashing the tree.
//   2. `STORAGE_KEYS` — the single registry of every key the app persists, so
//      keys can't silently drift apart or collide between modules.
//
// NOTE: `theme` is also read by the inline pre-paint script in index.html, which
// cannot import this module — keep both in sync if it is ever renamed.

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // quota exceeded / private mode — ignore
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function safeGetJson<T>(key: string, fallback: T): T {
  const raw = safeGet(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSetJson(key: string, value: unknown): void {
  try {
    safeSet(key, JSON.stringify(value));
  } catch {
    // stringify failure / quota — ignore
  }
}

export const storage = {
  get: safeGet,
  set: safeSet,
  remove: safeRemove,
  getJson: safeGetJson,
  setJson: safeSetJson,
} as const;

export const STORAGE_KEYS = {
  // Auth / identity
  // NOTE: the JWT access token is intentionally NOT persisted here. It lives only
  // in memory (see apiClient.ts) so it can't be exfiltrated from localStorage via
  // XSS. We persist only a non-sensitive boolean marker that a session *existed*,
  // so on boot we know to attempt a silent refresh via the httpOnly cookie instead
  // of flashing the login page. GDPR Art. 32 (security of processing).
  session: 'fiicoder_session',
  gravatar: 'fiicoder_gravatar',
  dicebear: 'fiicoder_dicebear',
  username: 'fiicoder_username',

  // Appearance
  theme: 'fiicoder_theme',
  customColors: 'fiicoder_custom_colors',
  language: 'fiicoder_language',

  // Feature state
  readAnnouncements: 'fiicoder_read_announcements',
  editorLanguage: 'fiicoder_editor_language',
  problemLayout: 'fiicoder_problemdetails_layout_v4',
  proposalDraft: 'fiicoder_proposal_draft',

  // Templated (per-entity) keys
  recentClasses: (userId: string) => `fiicoder_recent_classes_${userId}`,
  notes: (problemTitle: string) => `fiicoder_notes_${problemTitle}`,
  paint: (problemTitle: string) => `fiicoder_paint_${problemTitle}`,
} as const;
