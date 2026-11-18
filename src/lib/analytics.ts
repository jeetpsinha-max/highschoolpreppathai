/**
 * First-party page-view tracking stored in our own Supabase `page_views` table.
 *
 * - visitor_id: random id kept in localStorage → counts unique visitors.
 * - session_id: random id kept in sessionStorage, rotated after 30 minutes of
 *   inactivity → counts visits/sessions and session length.
 * No cookies, IP addresses, or third-party services are involved.
 */

const VISITOR_KEY = "pp_visitor_id";
const SESSION_KEY = "pp_session";
const SESSION_IDLE_MS = 30 * 60 * 1000;
const DEDUPE_MS = 2000;

let lastTracked: { path: string; at: number } | null = null;

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function safeGet(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Private mode / storage disabled: fall back to a per-page-load id.
  }
}

export function getVisitorId(): string {
  const existing = safeGet(globalThis.localStorage, VISITOR_KEY);
  if (existing) return existing;
  const id = randomId();
  safeSet(globalThis.localStorage, VISITOR_KEY, id);
  return id;
}

export function getSession(now = Date.now()): { id: string; isNew: boolean } {
  const raw = safeGet(globalThis.sessionStorage, SESSION_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { id: string; lastSeen: number };
      if (parsed.id && now - parsed.lastSeen < SESSION_IDLE_MS) {
        safeSet(globalThis.sessionStorage, SESSION_KEY, JSON.stringify({ id: parsed.id, lastSeen: now }));
        return { id: parsed.id, isNew: false };
      }
    } catch {
      // fall through to a new session
    }
  }
  const id = randomId();
  safeSet(globalThis.sessionStorage, SESSION_KEY, JSON.stringify({ id, lastSeen: now }));
  return { id, isNew: true };
}

export interface DeviceInfo {
  browser: string;
  os: string;
  device_type: "desktop" | "mobile" | "tablet";
}

export function parseUserAgent(ua: string): DeviceInfo {
  const browser =
    /Edg\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /Firefox\/|FxiOS/.test(ua) ? "Firefox" :
    /SamsungBrowser/.test(ua) ? "Samsung Internet" :
    /Chrome\/|CriOS/.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" :
    "Other";

  const os =
    /iPhone|iPad|iPod/.test(ua) ? "iOS" :
    /Android/.test(ua) ? "Android" :
    /Windows/.test(ua) ? "Windows" :
    /CrOS/.test(ua) ? "ChromeOS" :
    /Mac OS X|Macintosh/.test(ua) ? "macOS" :
    /Linux/.test(ua) ? "Linux" :
    "Other";

  const device_type =
    /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? "tablet" :
    /Mobi|iPhone|iPod|Android/.test(ua) ? "mobile" :
    "desktop";

  return { browser, os, device_type };
}

/** Only keep the external referrer's hostname; internal navigation isn't a referrer. */
export function normalizeReferrer(referrer: string, currentHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (!host || host === currentHost.replace(/^www\./, "")) return null;
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

function shouldSkip(path: string): boolean {
  if (typeof navigator !== "undefined" && navigator.webdriver) return true; // headless bots / test runners
  if (path.startsWith("/admin")) return true; // don't count admins looking at the dashboard
  if (path.startsWith("/~oauth") || path.startsWith("/.lovable")) return true;
  return false;
}

/** Record a page view. Fire-and-forget: never throws, never blocks rendering. */
export async function trackPageView(path: string, userId?: string | null): Promise<void> {
  try {
    if (shouldSkip(path)) return;

    const now = Date.now();
    if (lastTracked && lastTracked.path === path && now - lastTracked.at < DEDUPE_MS) return;
    lastTracked = { path, at: now };

    const { browser, os, device_type } = parseUserAgent(navigator.userAgent);
    const session = getSession(now);
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.from("page_views").insert({
      visitor_id: getVisitorId(),
      session_id: session.id,
      path: path.slice(0, 512),
      // Only the landing page of a visit carries the external referrer.
      referrer: session.isNew ? normalizeReferrer(document.referrer, window.location.hostname) : null,
      browser,
      os,
      device_type,
      user_id: userId ?? null,
    });
  } catch {
    // Analytics must never break the app.
  }
}
