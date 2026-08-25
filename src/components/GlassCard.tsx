'use client';

/*
 * Double-bezel glass card: outer machined shell, inner translucent core.
 * On hover the card lifts slightly while a soft light blooms behind it.
 *
 * Deliberately CSS, not Framer Motion: this is predetermined hover motion, so
 * it belongs off the main thread. It also lets the lift and the bloom share
 * one duration, which is what stops them reading as two separate events.
 * Tailwind's hoverOnlyWhenSupported compiles the hover: utilities behind
 * @media (hover: hover), so a tap never sticks.
 */
export default function GlassCard({
  children,
  className,
  coreClassName,
}: {
  children: React.ReactNode;
  className?: string;
  coreClassName?: string;
}) {
  return (
    <div className={`group relative ${className ?? ''}`}>
      {/* Light bloom behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-5 rounded-[2.5rem] bg-[radial-gradient(58%_66%_at_50%_40%,rgba(130,143,255,0.14)_0%,rgba(130,143,255,0.07)_38%,rgba(130,143,255,0.02)_62%,transparent_82%)] opacity-0 transition-opacity duration-300 ease-out-strong group-hover:opacity-100 motion-reduce:transition-none"
      />
      <div className="bezel relative h-full transition-transform duration-300 ease-out-strong group-hover:scale-[1.012] motion-reduce:transform-none motion-reduce:transition-none">
        <div className={`bezel-core h-full ${coreClassName ?? 'p-7 sm:p-8'}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
