'use client';

import { useRef, useState } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { ArrowUpRight, ArrowDown } from 'lucide-react';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Cinematic exit: as the next section arrives, the hero recedes into the dark
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Entrances are timed to land as the preloader curtain lifts; when the
  // curtain already played this session (client-side nav back home), skip it
  const [curtainPlayed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.sessionStorage.getItem('bs-preloader-done') === '1';
    } catch {
      return false;
    }
  });
  // 1.85s lands the first line 100ms into the veil's 660ms dissolve, so the
  // hero is revealed *through* the blur instead of appearing after it.
  // Preloader.tsx owns the other half of this contract.
  const base = reduce || curtainPlayed ? 0.2 : 1.85;

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease },
  });

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100dvh] flex items-center overflow-hidden"
    >
      {/* Hero glow bloom: the Raycast moment, revealed by the preloader curtain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'radial-gradient(54rem 38rem at 30% 34%, rgba(130,143,255,0.13) 0%, rgba(130,143,255,0.08) 24%, rgba(130,143,255,0.033) 46%, rgba(130,143,255,0.009) 68%, transparent 84%)',
            'radial-gradient(42rem 32rem at 74% 62%, rgba(167,229,211,0.06) 0%, rgba(167,229,211,0.035) 28%, rgba(167,229,211,0.012) 52%, transparent 78%)',
          ].join(','),
        }}
      />

      <motion.div
        style={reduce ? undefined : { scale, opacity, y }}
        className="relative mx-auto w-full max-w-6xl px-4 sm:px-6"
      >
        <div className="max-w-3xl">
          <motion.div {...fadeUp(base)}>
            <span className="inline-flex items-center gap-2.5 rounded-full bg-white/[0.045] px-3.5 py-1.5 text-xs text-ink-dim shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)]">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-glow" />
              Open to internships and placements
            </span>
          </motion.div>

          <motion.p
            {...fadeUp(base + 0.12)}
            className="mt-8 text-base sm:text-lg font-medium text-ink-dim"
          >
            Berktan Solmaz
          </motion.p>

          <motion.h1
            {...fadeUp(base + 0.24)}
            className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.02] text-ink"
          >
            Refined software,
            <br />
            built with intent.
          </motion.h1>

          <motion.p
            {...fadeUp(base + 0.36)}
            className="mt-8 max-w-xl text-base sm:text-lg leading-relaxed text-ink-dim"
          >
            BEng Software Engineering student at the University of
            Westminster, London, building polished products across web,
            servers and hardware.
          </motion.p>

          <motion.div
            {...fadeUp(base + 0.48)}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms]"
            >
              View work
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                <ArrowDown className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </a>
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 rounded-full bg-white/[0.045] py-2 pl-6 pr-2 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.1)] active:scale-[0.975] active:duration-[120ms]"
            >
              Get in touch
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
