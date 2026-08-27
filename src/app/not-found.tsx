import Link from 'next/link';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import GodModeEgg from '@/components/GodModeEgg';

/*
 * 404. Server rendered apart from the easter egg leaf.
 *
 * No metadata export: Next does not read one from not-found.tsx, so the page
 * inherits the root layout's title. Nothing links here and it is never
 * indexed, so that is not worth working around.
 *
 * The FloatingDock is always visible off the home route, so this page does not
 * need to reproduce navigation; it only needs to offer the two ways out that
 * matter.
 */
export default function NotFound() {
  return (
    <section className="relative flex min-h-[100dvh] items-center overflow-hidden">
      {/* Four stop alpha ramp, the same construction as the Hero bloom. A two
          stop gradient bands visibly against abyss on a wide-gamut display. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(48rem 34rem at 42% 40%, rgba(130,143,255,0.11) 0%, rgba(130,143,255,0.065) 26%, rgba(130,143,255,0.026) 48%, rgba(130,143,255,0.007) 70%, transparent 86%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-sm tracking-[0.22em] text-ink-faint">
            404
          </p>

          <h1 className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-[1.02] text-ink">
            This page
            <br />
            went dark.
          </h1>

          <p className="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-ink-dim">
            The link is broken or the page has moved. Everything worth seeing
            is one click away.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full bg-ink py-2 pl-6 pr-2 text-sm font-medium text-abyss transition-transform duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] active:duration-[120ms]"
            >
              Back to home
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-[280ms] ease-out-strong group-hover:translate-x-px group-hover:scale-105">
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
            <Link
              href="/#projects"
              className="group inline-flex items-center gap-3 rounded-full bg-white/[0.045] py-2 pl-6 pr-2 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.09),inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-[transform,box-shadow] duration-[280ms] ease-out-strong hover:scale-[1.025] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(255,255,255,0.1)] active:scale-[0.975] active:duration-[120ms]"
            >
              See the work
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.07] transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
          </div>

          <GodModeEgg />
        </div>
      </div>
    </section>
  );
}
