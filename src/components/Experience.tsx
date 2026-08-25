'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import DoomCard from '@/components/DoomCard';
import { experience, education } from '@/lib/site-config';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeInUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' as const },
};

export default function Experience() {
  // Matched on the `featured` flag, not on the company name. The name is real
  // copy that changes (it did: 'Volinor' became 'Volinor Defence and
  // Technology'), and a string match would have silently dropped the slab.
  const volinor = experience.find((e) => e.featured);
  const others = experience.filter((e) => !e.featured);
  const edu = education[0];

  return (
    <section id="experience" className="py-24 sm:py-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.h2
          {...fadeInUp}
          transition={{ duration: 0.8, ease }}
          className="text-4xl sm:text-5xl font-semibold tracking-tighter text-ink mb-14"
        >
          Experience
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Volinor case study: the centerpiece slab */}
          {volinor && (
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.9, ease }}
              className="lg:col-span-12"
            >
              <GlassCard coreClassName="relative overflow-hidden p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="flex flex-col p-8 sm:p-12">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
                      Case study
                    </p>
                    <h3 className="mt-6 text-5xl sm:text-6xl font-semibold tracking-tighter text-ink">
                      Volinor
                    </h3>
                    <p className="mt-3 text-sm text-ink-dim">
                      {volinor.role}
                      <span className="text-ink-faint">
                        {' '}
                        · {volinor.period}
                      </span>
                    </p>
                    <div className="mt-6 space-y-3 max-w-md">
                      {volinor.achievements.map((a, i) => (
                        <p
                          key={i}
                          className="text-sm sm:text-base leading-relaxed text-ink-dim"
                        >
                          {a}
                        </p>
                      ))}
                    </div>
                    <a
                      href="https://volinor.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-8 inline-flex w-max items-center gap-2 text-sm font-medium text-glow transition-colors duration-300 hover:text-ink"
                    >
                      volinor.com
                      <ArrowUpRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        strokeWidth={1.5}
                      />
                    </a>
                  </div>

                  {/* Abstract light composition: bloom + machined rings */}
                  <div className="relative min-h-[16rem] overflow-hidden md:min-h-0">
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          'radial-gradient(28rem 22rem at 68% 42%, rgba(130, 143, 255, 0.16), transparent 62%), radial-gradient(20rem 16rem at 34% 76%, rgba(167, 229, 211, 0.07), transparent 60%)',
                      }}
                    />
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]"
                    />
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.09]"
                    />
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-1/2 h-[9rem] w-[9rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-glow/25"
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Supporting bento row: freelance, education, easter egg */}
          {others.map((item) => (
            <motion.div
              key={item.id}
              {...fadeInUp}
              transition={{ duration: 0.8, delay: 0.1, ease }}
              className="lg:col-span-5"
            >
              <GlassCard className="h-full">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-ink">
                        {item.company}
                      </h3>
                      <p className="mt-1 text-sm text-ink-dim">{item.role}</p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {item.period}
                    </span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {item.achievements.map((a, i) => (
                      <p key={i} className="text-sm leading-relaxed text-ink-dim">
                        {a}
                      </p>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.16, ease }}
            className="lg:col-span-4"
          >
            <GlassCard className="h-full">
              <div className="flex h-full flex-col">
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {edu.university}
                </h3>
                <p className="mt-1 text-sm text-ink-dim">{edu.degree}</p>
                <div className="mt-6 space-y-3">
                  {edu.highlights.map((h, i) => (
                    <p key={i} className="text-sm leading-relaxed text-ink-dim">
                      {h}
                    </p>
                  ))}
                </div>
                <p className="mt-auto pt-6 font-mono text-xs text-ink-faint">
                  {edu.period}
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.8, delay: 0.22, ease }}
            className="lg:col-span-3"
          >
            <DoomCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
