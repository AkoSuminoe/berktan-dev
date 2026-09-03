'use client';

import { AlertTriangle, Info, CircleAlert } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import type { Violation } from '@/lib/tokyo-personal';

/*
 * Lifted out of PersonalPlan unchanged when the Nights tab needed the same
 * panel for its own rule checks. The two tabs run different checks and share
 * the `Violation` shape, so they should look identical on the page.
 */

const SEVERITY = {
  error: {
    Icon: CircleAlert,
    ring: 'shadow-[inset_0_0_0_1px_rgba(248,113,113,0.32)]',
    tint: 'text-red-300',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'shadow-[inset_0_0_0_1px_rgba(130,143,255,0.3)]',
    tint: 'text-glow',
  },
  note: {
    Icon: Info,
    ring: 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]',
    tint: 'text-ink-faint',
  },
} as const;

export default function ViolationsPanel({
  violations,
  title = 'Worth knowing',
  intro,
}: {
  violations: Violation[];
  title?: string;
  intro?: string;
}) {
  if (violations.length === 0) return null;

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        {title}
      </h3>
      {intro && (
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">{intro}</p>
      )}

      <ul className="mt-6 space-y-3">
        {violations.map((violation) => {
          const { Icon, ring, tint } = SEVERITY[violation.severity];
          return (
            <li
              key={violation.id}
              className={`flex items-start gap-3.5 rounded-xl bg-white/[0.02] px-4 py-3.5 ${ring}`}
            >
              <Icon
                aria-hidden
                className={`mt-0.5 h-4 w-4 shrink-0 ${tint}`}
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{violation.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                  {violation.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
