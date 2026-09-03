/*
 * Where the Tokyo planner keeps things, and the one-off that rescues what the
 * profile chooser held.
 *
 * Three keys, one namespace, defined once. Two definitions of the same key is
 * how a migration ends up writing somewhere nothing ever reads, which is why
 * this file exists at all rather than a constant per store.
 *
 * PRIVACY. All three are localStorage and nothing else: no server, no API, no
 * cookie, no analytics event carrying an amount. berktan.dev is a public site
 * and the budget is a record of what somebody spends.
 */

export const CHECKLIST_STORAGE_KEY = 'tokyo-checklist-v1';
export const BUDGET_STORAGE_KEY = 'tokyo-budget-v1';
export const SETTINGS_STORAGE_KEY = 'tokyo-settings-v1';

/* ------------------------------------------------------------------ */
/* Reclaiming what the profile chooser held                            */
/* ------------------------------------------------------------------ */

/**
 * Set once `reclaimProfileData` has run. Its own key rather than a field on
 * anything, so clearing a budget or a checklist cannot make it run again and
 * paste day-old data over something newer.
 */
const RECLAIM_FLAG_KEY = 'tokyo-reclaimed-v1';

const PROFILES_KEY = 'tokyo-profiles-v1';

/** The keys as the profile chooser wrote them: `tokyo-budget-v1:<profileId>`. */
const NAMESPACED = [
  CHECKLIST_STORAGE_KEY,
  BUDGET_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
];

/**
 * The id whose data should come back, read out of the retired profiles blob.
 *
 * Deliberately hand-rolled rather than keeping `parseProfiles` alive for one
 * call: this needs two strings out of a shape that no longer has a type, and
 * importing a module purely to delete it later is worse than ten lines here.
 * Everything is checked because localStorage is untrusted input.
 */
function lastProfileId(): string | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(PROFILES_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const blob = parsed as { lastUsedId?: unknown; profiles?: unknown };
    if (typeof blob.lastUsedId === 'string' && blob.lastUsedId) {
      return blob.lastUsedId;
    }

    /* No remembered profile, but one may still hold everything. */
    const profiles = Array.isArray(blob.profiles) ? blob.profiles : [];
    const first = profiles[0] as { id?: unknown } | undefined;
    return first && typeof first.id === 'string' && first.id ? first.id : null;
  } catch {
    return null;
  }
}

/**
 * Bring a profile's data back to the unnamespaced keys, exactly once.
 *
 * The chooser is gone, but it was live for a day, and anything ticked in that
 * time exists ONLY under `tokyo-checklist-v1:<id>`. The unnamespaced key still
 * exists because the migration into profiles copied rather than moved, so it is
 * sitting there frozen at the moment profiles landed. Doing nothing would
 * silently roll the checklist back a day, which reads as data loss.
 *
 * The namespaced copy therefore wins unconditionally: it is at worst identical
 * to the old one and at best newer.
 *
 * The namespaced keys are left on disk, for the same reason the originals were:
 * a migration that eats the only copy of the data is not a migration.
 *
 * LIMIT: if more than one profile held real data, only the last used one comes
 * back. The others are still under `tokyo-budget-v1:<their id>` and can be
 * copied across by hand in DevTools.
 */
export function reclaimProfileData(): void {
  try {
    if (window.localStorage.getItem(RECLAIM_FLAG_KEY) === '1') return;
  } catch {
    /* Storage unavailable. Leave the flag unset so a later visit in a working
       browser still gets the chance. */
    return;
  }

  const profileId = lastProfileId();

  try {
    if (profileId) {
      for (const key of NAMESPACED) {
        const value = window.localStorage.getItem(`${key}:${profileId}`);
        if (value !== null) window.localStorage.setItem(key, value);
      }
    }
    window.localStorage.setItem(RECLAIM_FLAG_KEY, '1');
  } catch {
    /* A full quota throws on the write. Nothing was lost: the namespaced keys
       are untouched and the flag is unset, so this runs again next time. */
  }
}
