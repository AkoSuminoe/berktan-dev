/*
 * Profiles for the Tokyo planner.
 *
 * THIS IS A SELECTOR, NOT A SECURITY BOUNDARY. Say it plainly because the
 * pattern looks like a login and is not one. Every profile's data sits in this
 * browser's localStorage in plain text: anyone holding the device can open
 * DevTools and read all of it in about ten seconds, whichever card they picked.
 * /tokyo is `robots: noindex`, but noindex is not access control either, and
 * the page is a public URL on a public host.
 *
 * It exists so two people can keep separate checklists on one phone, and for
 * nothing else. If real privacy is ever wanted, there are two honest options
 * and neither of them is this:
 *
 *   - encrypt a profile's data with a passphrase via Web Crypto, so what is
 *     stored is ciphertext and the passphrase is never written down; or
 *   - keep the budget off the public route altogether, behind the self-hosted
 *     stack on Tailscale.
 *
 * Do not describe the chooser as protecting anything.
 */

import { newId, budgetKeyFor } from '@/lib/tokyo-budget';

export const PROFILES_STORAGE_KEY = 'tokyo-profiles-v1';
export const PROFILES_SCHEMA_VERSION = 1;

/** The two keys that existed before profiles, still read once for migration. */
export const LEGACY_CHECKLIST_KEY = 'tokyo-checklist-v1';
export const LEGACY_BUDGET_KEY = 'tokyo-budget-v1';

const MAX_PROFILES = 8;
const MAX_NAME_LENGTH = 24;

/** Picked to sit against the abyss ground without any of them reading as red. */
export const PROFILE_COLOURS = [
  '#828fff',
  '#57c1ff',
  '#5fd4b0',
  '#f0b354',
  '#d98fd0',
  '#8ba3c7',
] as const;

export type Profile = {
  id: string;
  name: string;
  /** One or two characters. An emoji, or initials. */
  avatar: string;
  colour: string;
};

export type ProfilesState = {
  version: number;
  profiles: Profile[];
  lastUsedId: string | null;
  /** Set once the pre-profile keys have been copied in. Never runs twice. */
  legacyMigrated: boolean;
};

export function emptyProfiles(): ProfilesState {
  return {
    version: PROFILES_SCHEMA_VERSION,
    profiles: [],
    lastUsedId: null,
    legacyMigrated: false,
  };
}

/* ------------------------------------------------------------------ */
/* Namespaced keys                                                     */
/* ------------------------------------------------------------------ */

/*
 * Every per-profile key is built by exactly one function, so no component can
 * invent its own shape and drift from the one the store reads.
 *
 * The budget's builder lives with the budget store rather than being restated
 * here: two definitions of the same key is how a migration ends up writing
 * somewhere nothing ever reads.
 */
export const checklistKey = (profileId: string) =>
  `${LEGACY_CHECKLIST_KEY}:${profileId}`;
export { budgetKeyFor as budgetKey } from '@/lib/tokyo-budget';
export const settingsKey = (profileId: string) =>
  `tokyo-settings-v1:${profileId}`;

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cleanName(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().slice(0, MAX_NAME_LENGTH);
  return trimmed || fallback;
}

/** Two characters at most: the card shows a glyph, not a sentence. */
export function cleanAvatar(value: unknown, name: string): string {
  if (typeof value === 'string' && value.trim()) {
    return Array.from(value.trim()).slice(0, 2).join('');
  }
  return Array.from(name.trim())[0]?.toUpperCase() ?? '?';
}

function cleanProfile(value: unknown): Profile | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== 'string' || !value.id) return null;

  const name = cleanName(value.name, 'Traveller');
  return {
    id: value.id.slice(0, 64),
    name,
    avatar: cleanAvatar(value.avatar, name),
    colour:
      typeof value.colour === 'string' &&
      /^#[0-9a-f]{6}$/i.test(value.colour)
        ? value.colour
        : PROFILE_COLOURS[0],
  };
}

/** The same rebuild-every-field boundary the budget and fx stores use. */
export function parseProfiles(value: unknown): ProfilesState | null {
  if (!isRecord(value)) return null;
  if (value.version !== PROFILES_SCHEMA_VERSION) return null;

  const raw = Array.isArray(value.profiles) ? value.profiles : [];
  const profiles: Profile[] = [];
  const seen: string[] = [];
  for (const entry of raw.slice(0, MAX_PROFILES)) {
    const profile = cleanProfile(entry);
    if (!profile || seen.indexOf(profile.id) !== -1) continue;
    seen.push(profile.id);
    profiles.push(profile);
  }

  const lastUsedId =
    typeof value.lastUsedId === 'string' &&
    seen.indexOf(value.lastUsedId) !== -1
      ? value.lastUsedId
      : null;

  return {
    version: PROFILES_SCHEMA_VERSION,
    profiles,
    lastUsedId,
    legacyMigrated: value.legacyMigrated === true,
  };
}

/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */

export function readProfiles(): ProfilesState {
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) return emptyProfiles();
    return parseProfiles(JSON.parse(raw) as unknown) ?? emptyProfiles();
  } catch {
    return emptyProfiles();
  }
}

export function writeProfiles(state: ProfilesState): boolean {
  try {
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function makeProfile(name: string, index: number): Profile {
  const clean = cleanName(name, 'Traveller');
  return {
    id: newId(),
    name: clean,
    avatar: cleanAvatar(null, clean),
    colour: PROFILE_COLOURS[index % PROFILE_COLOURS.length],
  };
}

export const canAddProfile = (state: ProfilesState) =>
  state.profiles.length < MAX_PROFILES;

/* ------------------------------------------------------------------ */
/* Legacy migration                                                    */
/* ------------------------------------------------------------------ */

/**
 * Move pre-profile progress into a first profile.
 *
 * The originals are COPIED, not moved. A migration that eats the only copy of
 * the data is not a migration: if the namespacing turns out to be wrong, or the
 * profile is deleted by accident, `tokyo-checklist-v1` is still sitting there
 * untouched. The cost is a few kilobytes of duplicate; the alternative is
 * losing a checklist somebody filled in by hand.
 *
 * `legacyMigrated` makes this run exactly once, so a later reset cannot
 * resurrect old data on top of new.
 */
export function migrateLegacy(state: ProfilesState): ProfilesState {
  if (state.legacyMigrated) return state;

  let checklist: string | null = null;
  let budget: string | null = null;
  try {
    checklist = window.localStorage.getItem(LEGACY_CHECKLIST_KEY);
    budget = window.localStorage.getItem(LEGACY_BUDGET_KEY);
  } catch {
    // Storage unavailable. Leave `legacyMigrated` false so a later visit in a
    // working browser still gets the chance.
    return state;
  }

  if (!checklist && !budget) {
    return { ...state, legacyMigrated: true };
  }

  const target = state.profiles[0] ?? makeProfile('Me', 0);

  try {
    if (checklist) {
      window.localStorage.setItem(checklistKey(target.id), checklist);
    }
    if (budget) window.localStorage.setItem(budgetKeyFor(target.id), budget);
  } catch {
    return state;
  }

  return {
    ...state,
    profiles: state.profiles.length > 0 ? state.profiles : [target],
    lastUsedId: state.lastUsedId ?? target.id,
    legacyMigrated: true,
  };
}
