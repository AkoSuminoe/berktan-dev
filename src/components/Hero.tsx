'use client';

import { motion } from 'framer-motion';
import ProfileCard from '@/components/ui/profile-card';
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-[128px] animate-float" />
      <div
        className="absolute bottom-1/3 -right-32 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[128px] animate-float"
        style={{ animationDelay: '-3s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] animate-float"
        style={{ animationDelay: '-1.5s' }}
      />

      <div className="relative z-10 w-full px-6 flex justify-center">
        <ProfileCard />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 rounded-full border-2 border-neutral-700 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-neutral-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}
