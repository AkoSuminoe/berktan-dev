'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import SectionNav from '@/components/tokyo/SectionNav';
import {
  careful,
  worthKnowing,
  phrasebook,
  CULTURE_TAG_LABELS,
  type CultureNote,
} from '@/lib/tokyo-culture';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SECTIONS = [
  { id: 'culture-careful', label: 'Careful' },
  { id: 'culture-known', label: 'Worth knowing' },
  { id: 'culture-phrases', label: 'Phrases' },
];

/*
 * Read-only, on purpose.
 *
 * Nothing here is a checkbox. These are things to know rather than things to
 * do, and a checklist would imply you can finish them and then stop paying
 * attention. It is also why this tab has no progress bar: there is no honest
 * number to put in one.
 */

function Tag({ tag }: { tag: CultureNote['tag'] }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
      {CULTURE_TAG_LABELS[tag]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Careful                                                             */
/* ------------------------------------------------------------------ */

function CarefulCard({ note, index }: { note: CultureNote; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.06, ease: easeOut }}
      /* Amber rather than the red used for a rule violation. These are things
         to know before you go, not things that are already wrong. */
      className="rounded-xl bg-[#f0b354]/[0.05] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(240,179,84,0.18)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-ink">{note.title}</p>
        <Tag tag={note.tag} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ink-dim">{note.body}</p>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Worth knowing                                                       */
/* ------------------------------------------------------------------ */

function NoteCard({ note, index }: { note: CultureNote; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.06, ease: easeOut }}
      className="rounded-xl bg-white/[0.02] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden
          className="mt-0.5 shrink-0 font-mono text-xs tabular-nums text-ink-faint"
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink">{note.title}</p>
            <Tag tag={note.tag} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink-dim">
            {note.body}
          </p>
        </div>
      </div>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Culture                                                             */
/* ------------------------------------------------------------------ */

export default function CultureNotes() {
  return (
    <div className="space-y-5">
      <SectionNav sections={SECTIONS} />

      <GlassCard coreClassName="p-6 sm:p-7">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Before you go
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
          Everything else on this page came out of the WWC documents. This did
          not, so it is kept to the things that are widely documented and
          written as norms where they are norms. The first section is the one
          with a cost attached.
        </p>
      </GlassCard>

      {/* Careful */}
      <div id="culture-careful" className="scroll-mt-24">
        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[#f0b354]">
            <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Careful
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            A fine, a refused entry, a missed train or a conversation at
            customs. The rest of this tab is manners; this part is not.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {careful.map((note, index) => (
              <CarefulCard key={note.id} note={note} index={index} />
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Worth knowing */}
      <div id="culture-known" className="scroll-mt-24">
        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Worth knowing
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            {worthKnowing.length} things people tell you once. None of them
            will get you into trouble, and all of them are the difference
            between visiting and being a nuisance.
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {worthKnowing.map((note, index) => (
              <NoteCard key={note.id} note={note} index={index} />
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Phrasebook */}
      <div id="culture-phrases" className="scroll-mt-24">
        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Enough Japanese to be polite
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            Not a course. Eleven lines that cover ordering, paying, thanking
            and getting out of the way.
          </p>
          <ul className="mt-5 space-y-2.5">
            {phrasebook.map((phrase) => (
              <li
                key={phrase.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <span className="min-w-[11rem] text-sm font-medium text-ink">
                  {phrase.romaji}
                </span>
                {/* lang, so a screen reader switches voice rather than
                    reading kana as English letters. */}
                <span lang="ja" className="text-sm text-ink-dim">
                  {phrase.kana}
                </span>
                <span className="w-full text-xs leading-relaxed text-ink-faint sm:w-auto sm:flex-1">
                  {phrase.meaning}. {phrase.when}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
