'use client';

import { motion } from 'framer-motion';

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function About() {
  return (
    <section id="about" className="py-28 sm:py-40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease }}
          className="text-2xl sm:text-3xl lg:text-4xl font-medium tracking-tight leading-snug text-ink-dim"
        >
          <span className="text-ink">
            I care about the details most people scroll past:
          </span>{' '}
          type, spacing, motion, and the engineering that keeps them fast.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.15, ease }}
          className="mt-10 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-dim"
        >
          Based in London, finishing a BEng in Software Engineering at the
          University of Westminster and graduating in 2027. Alongside it I ship
          freelance work and game-server automation, with ESP32 hardware
          projects currently in progress.
        </motion.p>
      </div>
    </section>
  );
}
