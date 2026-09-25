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
            Coursework geri sayımı
          </h3>
          <p className="mt-1 text-xs text-ink-faint">
            Gerçek teslim tarihine göre. Resmî deadline her zaman belirleyici.
          </p>
          <ul className="mt-5 space-y-3">
            {RULES.courseworkCountdown.map((rule) => (
              <li key={rule.daysBefore} className="flex gap-3">
                <span className="w-[5.5rem] shrink-0 font-mono text-xs text-glow">
                  {rule.daysBefore} gün önce
                </span>
                <span className="flex-1 text-sm leading-relaxed text-ink-dim">
                  {rule.task}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <Card
          title="Program aksadığında"
          when="Kaçan blokları ertesi güne taşıma"
          items={RULES.whenPlanSlips}
        />
        <Card
          title="AWS hazır oluş ölçütü"
          when="Resmî geçme puanı ölçeklenmiş 720/1000; aşağıdaki eşik kişisel"
          items={RULES.awsReadiness}
        />
      </div>
    </div>
  );
}
