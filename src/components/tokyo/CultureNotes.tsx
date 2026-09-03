'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileText, BookOpen, PenLine } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import SectionNav from '@/components/tokyo/SectionNav';
import {
  cultureSections,
  phrasebook,
  countBySource,
  SOURCE_LABELS,
  SOURCE_MEANINGS,
  type CultureNote,
  type CultureSource,
} from '@/lib/tokyo-culture';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SECTIONS = cultureSections
  .map((section) => ({ id: section.id, label: section.title }))
  .concat([{ id: 'culture-phrases', label: 'Phrases' }]);

/*
 * Read-only, on purpose. Nothing here is a checkbox: these are things to know
 * rather than things to do, and ticking them off would imply you can finish
 * them and stop paying attention. It is also why the tab has no progress bar.
 *
 * The chip is the point of the design. An official rule and my own opinion
 * look identical once they are set in the same typeface, so every item says
 * which it is and a legend at the top says what the three words mean.
 */

const SOURCE_STYLE: Record<
  CultureSource,
  { chip: string; icon: typeof FileText }
> = {
  /* Glow: the accent, reserved here for the one source with authority. */
  wwc: {
    chip: 'bg-glow/[0.14] text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.32)]',
    icon: FileText,
  },
  verified: {
    chip: 'bg-white/[0.05] text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]',
    icon: BookOpen,
  },
  /* Deliberately the quietest of the three. It has the least behind it. */
  advice: {
    chip: 'bg-white/[0.02] text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]',
    icon: PenLine,
  },
};

function SourceChip({ source }: { source: CultureSource }) {
  const { chip, icon: Icon } = SOURCE_STYLE[source];
  return (
    <span
      title={SOURCE_MEANINGS[source]}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${chip}`}
    >
      <Icon className="h-3 w-3" strokeWidth={1.75} aria-hidden />
      {SOURCE_LABELS[source]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Note                                                                */
/* ------------------------------------------------------------------ */

function NoteCard({
  note,
  index,
  danger,
}: {
  note: CultureNote;
  index: number;
  /* The Careful section reads as a warning; the rest does not. */
  danger?: boolean;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: (index % 2) * 0.06, ease: easeOut }}
      className={
        danger
          ? 'rounded-xl bg-[#f0b354]/[0.05] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(240,179,84,0.18)]'
          : 'rounded-xl bg-white/[0.02] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]'
      }
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
        <p className="text-sm font-medium text-ink">{note.title}</p>
        <SourceChip source={note.source} />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-ink-dim">{note.body}</p>

      {note.sourceNote && (
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-faint">
          {note.sourceNote}
        </p>
      )}
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Culture                                                             */
/* ------------------------------------------------------------------ */

export default function CultureNotes() {
  const counts = useMemo(() => countBySource(), []);
  const [only, setOnly] = useState<CultureSource | null>(null);

  const sources: CultureSource[] = ['wwc', 'verified', 'advice'];

  return (
    <div className="space-y-5">
      <SectionNav sections={SECTIONS} />

      {/* The legend. Without it the chips are three unexplained words. */}
      <GlassCard coreClassName="p-6 sm:p-7">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Where each of these comes from
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
          Every other tab on this page traces back to a WWC document. This one
          mixes three kinds of claim, so each item says which it is. Tap one to
          see only those.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {sources.map((source) => {
            const active = only === source;
            const { icon: Icon } = SOURCE_STYLE[source];
            return (
              <button
                key={source}
                type="button"
                aria-pressed={active}
                onClick={() => setOnly(active ? null : source)}
                className={`flex min-w-[13rem] flex-1 items-start gap-2.5 rounded-xl px-3.5 py-3 text-left transition-[background-color,box-shadow] duration-200 ease-out-strong ${
                  active
                    ? 'bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]'
                    : 'bg-white/[0.02] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${source === 'wwc' ? 'text-glow' : 'text-ink-faint'}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">
                    {SOURCE_LABELS[source]}
                    <span className="ml-1.5 font-mono text-xs text-ink-faint">
                      {counts[source]}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                    {SOURCE_MEANINGS[source]}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          The WWC ones were read out of the PDF rather than taken on trust,
          which caught two things: the Student Pack attaches on-the-spot fines
          to littering, jaywalking and spitting but not to street smoking, and
          it gives no earthquake guidance at all. Both are corrected below.
        </p>
      </GlassCard>

      {cultureSections.map((section) => {
        const items =
          only === null
            ? section.items
            : section.items.filter((note) => note.source === only);
        const danger = section.id === 'culture-careful';

        return (
          <div key={section.id} id={section.id} className="scroll-mt-24">
            <GlassCard coreClassName="p-6 sm:p-7">
              <h3
                className={`inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] ${
                  danger ? 'text-[#f0b354]' : 'text-ink-faint'
                }`}
              >
                {danger && (
                  <AlertTriangle
                    className="h-3.5 w-3.5"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                )}
                {section.title}
                <span className="font-mono normal-case tracking-normal text-ink-faint">
                  {items.length}
                  {only !== null && ` of ${section.items.length}`}
                </span>
              </h3>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
                {section.blurb}
              </p>

              {items.length === 0 ? (
                <p className="mt-5 text-sm text-ink-faint">
                  Nothing in this section is a {SOURCE_LABELS[only!].toLowerCase()}.
                </p>
              ) : (
                <ul className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {items.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      danger={danger}
                    />
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        );
      })}

      {/* Phrasebook */}
      <div id="culture-phrases" className="scroll-mt-24">
        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
            Enough Japanese to be polite
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            Not a course. {phrasebook.length} lines covering introductions,
            ordering, paying and getting out of the way.
          </p>
          <ul className="mt-5 space-y-2.5">
            {phrasebook.map((phrase) => (
              <li
                key={phrase.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
              >
                <span className="min-w-[10rem] text-sm font-medium text-ink">
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
