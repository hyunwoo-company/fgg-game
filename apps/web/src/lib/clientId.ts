/**
 * crypto.randomUUID()는 secure context(HTTPS/localhost) + 최신 브라우저에서만 동작.
 * Tailscale Funnel 또는 구형 모바일 브라우저에서 미지원이라 fallback 필요.
 */
function randomUUID(): string {
  if (typeof crypto !== 'undefined') {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {
        /* secure context 아니어도 try / fallback */
      }
    }
    if (typeof crypto.getRandomValues === 'function') {
      const buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40; // v4
      buf[8] = (buf[8] & 0x3f) | 0x80; // variant
      const hex = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }
  }
  // 마지막 fallback: Math.random 기반 (UUID v4 형식)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const CLIENT_ID_KEY = 'fgg_client_id';
const SESSION_KEY = 'fgg_session';
type Session = { roomId: string; playerName: string };

function parseClientId(raw: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(raw)
    ? raw
    : null;
}

function parseSession(raw: string): Session | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    if (!('roomId' in value) || !('playerName' in value)) return null;
    return typeof value.roomId === 'string' && value.roomId.trim() !== ''
      && typeof value.playerName === 'string' && value.playerName.trim() !== ''
      ? { roomId: value.roomId, playerName: value.playerName }
      : null;
  } catch {
    return null;
  }
}

function findPreviousValue<T>(
  storage: Storage,
  currentKey: string,
  suffix: string,
  parse: (raw: string) => T | null,
): { key: string; raw: string; value: T } | null {
  let candidate: { key: string; raw: string; value: T } | null = null;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key || key === currentKey || !key.endsWith(suffix)) continue;
    const raw = storage.getItem(key);
    if (raw === null) continue;
    const value = parse(raw);
    if (value === null) continue;
    // Ambiguous candidates must stay untouched; guessing could reconnect another identity.
    if (candidate) return null;
    candidate = { key, raw, value };
  }
  return candidate;
}

function loadStoredValue<T>(
  storage: Storage,
  currentKey: string,
  suffix: string,
  parse: (raw: string) => T | null,
): T | null {
  const current = storage.getItem(currentKey);
  const value = current === null ? null : parse(current);
  if (value !== null) return value;
  const previous = findPreviousValue(storage, currentKey, suffix, parse);
  if (!previous) return null;
  try {
    storage.setItem(currentKey, previous.raw);
    storage.removeItem(previous.key);
  } catch {
    // Keep the previous identity available when storage cannot persist the new key.
  }
  return previous.value;
}

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const stored = loadStoredValue(localStorage, CLIENT_ID_KEY, '_client_id', parseClientId);
    if (stored) return stored;
    const id = randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    return randomUUID();
  }
}

export function saveSession(roomId: string, playerName: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ roomId, playerName }));
}

export function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    return loadStoredValue(sessionStorage, SESSION_KEY, '_session', parseSession);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  // Also clear a uniquely valid previous session so it cannot return after an explicit leave.
  const previous = findPreviousValue(sessionStorage, SESSION_KEY, '_session', parseSession);
  sessionStorage.removeItem(SESSION_KEY);
  if (previous) sessionStorage.removeItem(previous.key);
}
