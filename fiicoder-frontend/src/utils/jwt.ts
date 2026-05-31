// Minimal JWT decoding for the access token. We only read the payload
// client-side for UI purposes (username, role, expiry) — the server remains
// the authority on validity.

export interface JwtPayload {
  sub: string;
  role: string;
  username: string;
  iat: number;
  exp: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
}
