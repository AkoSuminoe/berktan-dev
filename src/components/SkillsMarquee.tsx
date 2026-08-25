'use client';

import { skills } from '@/lib/site-config';

export default function SkillsMarquee() {
  const allSkills = skills.flat();

  return (
    <section id="skills" className="py-16 sm:py-24 overflow-hidden">
      {/* Quiet typographic ticker between sections */}
      <div className="relative border-y border-white/5 py-6">
        <div className="absolute left-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-r from-abyss to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 z-10 w-20 sm:w-40 bg-gradient-to-l from-abyss to-transparent" />

        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {/* Duplicate array for a seamless loop */}
          {[...allSkills, ...allSkills].map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="shrink-0 cursor-default whitespace-nowrap px-8 text-sm uppercase tracking-[0.22em] text-ink-faint transition-colors duration-200 hover:text-ink"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
