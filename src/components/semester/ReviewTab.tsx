'use client';

import GlassCard from '@/components/GlassCard';
import { REVIEWS, RULES } from '@/data/semester-plan';

/*
 * The rules that make the timetable survive contact with a real week.
 * Read-only: nothing here is tickable, so there is no state and no bar.
 */

function Card({
  title,
  when,
  items,
}: {
  title: string;
  when: string;
  items: readonly string[];
}) {
  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-lg font-medium tracking-tight text-ink">{title}</h3>
      <p className="mt-1 text-xs text-ink-faint">{when}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="pl-4 text-sm leading-relaxed text-ink-dim shadow-[inset_2px_0_0_0_rgba(255,255,255,0.08)]"
          >
            {item}
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

export default function ReviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card {...REVIEWS.daily} />
        <Card {...REVIEWS.weekly} />
        <Card {...REVIEWS.monthly} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard coreClassName="p-6 sm:p-7">
          <h3 className="text-lg font-medium tracking-tight text-ink">
            Coursework countdown
          </h3>
          <p className="mt-1 text-xs text-ink-faint">
            Against the real submission date. The official deadline always wins.
          </p>
          <ul className="mt-5 space-y-3">
            {RULES.courseworkCountdown.map((rule) => (
              <li key={rule.daysBefore} className="flex gap-3">
                <span className="w-[6rem] shrink-0 font-mono text-xs text-glow">
                  {rule.daysBefore} days before
                </span>
                <span className="flex-1 text-sm leading-relaxed text-ink-dim">
                  {rule.task}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <Card
          title="When the plan slips"
          when="Missed blocks do not move to the next day"
          items={RULES.whenPlanSlips}
        />
        <Card
          title="AWS readiness"
          when="The official pass mark is a scaled 720/1000; the bar below is personal"
          items={RULES.awsReadiness}
        />
      </div>
    </div>
  );
}
