'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plane, Pencil, Trash2, Plus, Check, X } from 'lucide-react';
import {
  readProfiles,
  writeProfiles,
  migrateLegacy,
  makeProfile,
  canAddProfile,
  cleanAvatar,
  PROFILE_COLOURS,
  type Profile,
  type ProfilesState,
} from '@/lib/tokyo-profiles';

const TEXT = 'Flying to Tokyo...';

/*
 * The entry screen for /tokyo, replacing the standalone "Flying to Tokyo" veil
 * that used to live in TokyoPreloader.
 *
 * It inherits that component's grammar exactly, so the entrance still reads the
 * same: the same .veil surface from globals.css, the same 26ms per-letter
 * stagger behind a 160ms lead, the same dissolve, and the same
 * `bs-tokyo-curtain` session flag that TokyoPlanner keys its 1.75s first
 * entrance off. What changed is that the wordmark now has a question under it
 * rather than timing out on its own.
 *
 * Timing differs in one deliberate way: the veil dismissed itself after
 * 1650ms, and this waits for a choice instead. The letters still finish
 * cascading at about 1.2s, so the cards fade in behind them at 1.3s rather
 * than competing with them.
 *
 * NOT A SECURITY BOUNDARY. See the header of lib/tokyo-profiles.ts.
 */

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];
const CARDS_DELAY = 1.3;
const REDUCED_DELAY = 0.1;
const EXIT_FALLBACK = 900;

type Phase = 'choosing' | 'leaving' | 'gone';

export default function ProfileGate({
  onPick,
  activeId,
}: {
  onPick: (profileId: string | null) => void;
  /** Non-null once a profile is chosen; the gate then stays out of the way. */
  activeId: string | null;
}) {
  const reduce = useReducedMotion();
  const [state, setState] = useState<ProfilesState | null>(null);
  const [phase, setPhase] = useState<Phase>('choosing');
  const [managing, setManaging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [curtainPlayed, setCurtainPlayed] = useState(false);

  /*
   * The remembered profile is taken once per page load and never again.
   * Without this, "Manage profiles" would set the id back to null, the effect
   * would helpfully remember the same profile, and the chooser would be
   * impossible to reach.
   */
  const autoPicked = useRef(false);

  /* Read profiles, migrate anything from before they existed, then decide. */
  useEffect(() => {
    let played = false;
    try {
      played = window.sessionStorage.getItem('bs-tokyo-curtain') === '1';
    } catch {}
    setCurtainPlayed(played);

    const migrated = migrateLegacy(readProfiles());
    setState(migrated);
    writeProfiles(migrated);

    const remembered = migrated.profiles.find(
      (profile) => profile.id === migrated.lastUsedId
    );
    autoPicked.current = true;

    if (remembered) {
      // Straight in. The way back is "Manage profiles" in the planner header.
      onPick(remembered.id);
      setPhase('gone');
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [onPick]);

  /* Coming back from the planner: re-open, and re-read in case of a change. */
  useEffect(() => {
    if (activeId !== null || !autoPicked.current || phase === 'choosing') return;
    setState(readProfiles());
    setManaging(false);
    setEditingId(null);
    setPhase('choosing');
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeId, phase]);

  // Belt and braces: the veil's own dissolve should end this, but a missed
  // transitionend must not leave a full-screen overlay stuck on the page.
  useEffect(() => {
    if (phase !== 'leaving') return;
    const timeout = setTimeout(() => setPhase('gone'), EXIT_FALLBACK);
    return () => clearTimeout(timeout);
  }, [phase]);

  const commit = useCallback((next: ProfilesState) => {
    setState(next);
    writeProfiles(next);
  }, []);

  const choose = useCallback(
    (profile: Profile) => {
      if (!state) return;
      commit({ ...state, lastUsedId: profile.id });
      onPick(profile.id);
      try {
        window.sessionStorage.setItem('bs-tokyo-curtain', '1');
      } catch {}
      document.body.style.overflow = '';
      setPhase('leaving');
    },
    [state, commit, onPick]
  );

  /*
   * Deliberately NOT gated on `state` being loaded.
   *
   * Profiles are read in an effect, so waiting for them would mean the server
   * renders nothing, the planner paints, and the veil drops on top of it a
   * frame later. The whole job of this surface is that the page is never seen
   * assembling. So the veil and its wordmark render from the first paint, on
   * the server too, and only the cards below wait for storage.
   *
   * That first render is identical on both sides — phase 'choosing', state
   * null — so there is nothing for hydration to disagree about.
   */
  if (phase === 'gone' || activeId !== null) return null;

  const profiles = state?.profiles ?? null;

  return (
    <div
      className="veil"
      data-leaving={phase === 'leaving'}
      onTransitionEnd={(event) => {
        if (
          event.propertyName === 'opacity' &&
          event.target === event.currentTarget
        ) {
          setPhase('gone');
        }
      }}
    >
      <div className="flex w-full max-w-lg flex-col items-center px-6">
        {/* The wordmark, unchanged from the veil it replaces */}
        <div className="flex items-center gap-4">
          <span aria-hidden className="veil-plane text-ink-dim">
            <span className="veil-plane-arrival">
              <Plane className="h-5 w-5 rotate-12" strokeWidth={1.5} />
            </span>
          </span>

          <span
            aria-label={TEXT}
            style={{ '--stagger': '26ms', '--lead': '160ms' } as CSSProperties}
            className="veil-mark flex text-xl sm:text-2xl font-light tracking-[0.3em] uppercase text-ink"
          >
            {TEXT.split('').map((letter, i) => (
              <span
                key={`${letter}-${i}`}
                aria-hidden
                className="veil-letter whitespace-pre"
                style={{ '--i': i } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>

        {/* Cards arrive after the letters have finished, not against them, and
            only once localStorage has actually been read. */}
        {profiles !== null && state !== null && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: reduce ? 0.01 : 0.7,
            delay: reduce || curtainPlayed ? REDUCED_DELAY : CARDS_DELAY,
            ease: easeOut,
          }}
          className="mt-12 w-full"
        >
          <p className="text-center text-sm text-ink-dim">
            {profiles.length === 0
              ? 'Who is planning this trip?'
              : managing
                ? 'Rename, recolour or remove.'
                : 'Who is planning?'}
          </p>

          <div className="mt-7 flex flex-wrap items-start justify-center gap-5">
            <AnimatePresence initial={false}>
              {profiles.map((profile) => (
                <motion.div
                  key={profile.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.16, ease: easeOut },
                  }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="flex w-[5.5rem] flex-col items-center"
                >
                  {editingId === profile.id ? (
                    <ProfileEditor
                      profile={profile}
                      draftName={draftName}
                      setDraftName={setDraftName}
                      onSave={(next) => {
                        commit({
                          ...state,
                          profiles: profiles.map((entry) =>
                            entry.id === next.id ? next : entry
                          ),
                        });
                        setEditingId(null);
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          managing ? setEditingId(profile.id) : choose(profile)
                        }
                        aria-label={
                          managing
                            ? `Edit ${profile.name}`
                            : `Continue as ${profile.name}`
                        }
                        className="group flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl text-2xl transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.06] active:scale-[0.97] active:duration-[120ms] motion-reduce:transform-none"
                        style={{
                          background: `linear-gradient(150deg, ${profile.colour}33, ${profile.colour}14)`,
                          boxShadow: `inset 0 1px 0 0 ${profile.colour}55, inset 0 0 0 1px ${profile.colour}33`,
                        }}
                      >
                        <span aria-hidden>{profile.avatar}</span>
                      </button>
                      <span className="mt-2.5 w-full truncate text-center text-xs text-ink-dim">
                        {profile.name}
                      </span>
                      {managing && (
                        <button
                          type="button"
                          onClick={() =>
                            commit({
                              ...state,
                              profiles: profiles.filter(
                                (entry) => entry.id !== profile.id
                              ),
                              lastUsedId:
                                state.lastUsedId === profile.id
                                  ? null
                                  : state.lastUsedId,
                            })
                          }
                          aria-label={`Delete ${profile.name}`}
                          className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-ink-faint transition-colors duration-200 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {canAddProfile(state) && (
              <div className="flex w-[5.5rem] flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    const profile = makeProfile(
                      `Traveller ${profiles.length + 1}`,
                      profiles.length
                    );
                    commit({ ...state, profiles: profiles.concat(profile) });
                    setDraftName(profile.name);
                    setEditingId(profile.id);
                    setManaging(true);
                  }}
                  aria-label="Add a profile"
                  className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-white/[0.03] text-ink-faint shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,color] duration-[280ms] ease-out-strong hover:scale-[1.06] hover:text-ink active:scale-[0.97] motion-reduce:transform-none"
                >
                  <Plus className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <span className="mt-2.5 text-center text-xs text-ink-faint">
                  Add
                </span>
              </div>
            )}
          </div>

          {profiles.length > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setManaging((previous) => !previous);
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-2 text-xs font-medium text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[color,transform] duration-200 ease-out-strong hover:text-ink active:scale-[0.97] motion-reduce:transform-none"
              >
                <Pencil className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                {managing ? 'Done' : 'Manage profiles'}
              </button>
            </div>
          )}

          <p className="mx-auto mt-8 max-w-sm text-center text-[11px] leading-relaxed text-ink-faint">
            Profiles keep separate checklists and budgets on this device. They
            are not a login and they do not hide anything from anyone holding
            the phone.
          </p>
        </motion.div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function ProfileEditor({
  profile,
  draftName,
  setDraftName,
  onSave,
  onCancel,
}: {
  profile: Profile;
  draftName: string;
  setDraftName: (value: string) => void;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
}) {
  const [colour, setColour] = useState(profile.colour);

  return (
    <div className="flex w-[5.5rem] flex-col items-center">
      <div
        className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl text-2xl"
        style={{
          background: `linear-gradient(150deg, ${colour}33, ${colour}14)`,
          boxShadow: `inset 0 1px 0 0 ${colour}55, inset 0 0 0 1px ${colour}33`,
        }}
      >
        <span aria-hidden>{cleanAvatar(null, draftName || profile.name)}</span>
      </div>

      <input
        type="text"
        value={draftName}
        autoFocus
        onChange={(event) => setDraftName(event.target.value.slice(0, 24))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSave({
              ...profile,
              name: draftName.trim() || profile.name,
              avatar: cleanAvatar(null, draftName || profile.name),
              colour,
            });
          }
          if (event.key === 'Escape') onCancel();
        }}
        aria-label="Profile name"
        className="mt-2.5 w-full rounded-lg bg-white/[0.04] px-2 py-1 text-center text-xs text-ink outline-none shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] focus:shadow-[inset_0_0_0_1px_rgba(130,143,255,0.5)]"
      />

      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {PROFILE_COLOURS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setColour(option)}
            aria-label={`Colour ${option}`}
            aria-pressed={colour === option}
            className={`h-3.5 w-3.5 rounded-full transition-transform duration-200 ease-out-strong ${
              colour === option ? 'scale-125' : 'opacity-60 hover:opacity-100'
            }`}
            style={{ background: option }}
          />
        ))}
      </div>

      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={() =>
            onSave({
              ...profile,
              name: draftName.trim() || profile.name,
              avatar: cleanAvatar(null, draftName || profile.name),
              colour,
            })
          }
          aria-label="Save"
          className="rounded-lg bg-glow/[0.14] p-1.5 text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.3)]"
        >
          <Check className="h-3 w-3" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-lg bg-white/[0.04] p-1.5 text-ink-faint transition-colors duration-200 hover:text-ink"
        >
          <X className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
