'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CreditCard, Check } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { yen } from '@/components/tokyo/format';
import type { FxQuote } from '@/lib/tokyo-fx';
import {
  calibrate,
  calibrationWarnings,
  effectiveRate,
  isPlausibleSpread,
  spreadFor,
  type TokyoSettings,
} from '@/lib/tokyo-settings';
import { tokyoDateKey } from '@/lib/tokyo-budget';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

function NumberField({
  label,
  value,
  onChange,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs text-ink-faint">{label}</span>
      <span className="mt-1.5 flex items-center gap-1 rounded-xl bg-white/[0.03] px-3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(255,255,255,0.06)] focus-within:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(130,143,255,0.45)]">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value.replace(/[^0-9.-]/g, ''))
          }
          className="w-full min-w-0 bg-transparent py-2.5 font-mono text-base sm:text-sm text-ink outline-none placeholder:text-ink-faint/50"
        />
        {suffix && (
          <span aria-hidden className="font-mono text-xs text-ink-faint">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}

export default function CardSettings({
  settings,
  update,
  quote,
}: {
  settings: TokyoSettings;
  update: (patch: Partial<TokyoSettings>) => void;
  quote: FxQuote;
}) {
  const today = tokyoDateKey();
  const effective = effectiveRate(quote.rate, settings, today);
  const spread = spreadFor(settings, today);

  const [jpyCharged, setJpyCharged] = useState('');
  const [gbpDebited, setGbpDebited] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const warnings = calibrationWarnings(settings, quote.source, today);

  function runCalibration(event: React.FormEvent) {
    event.preventDefault();
    setResult(null);
    setError(null);

    const outcome = calibrate(
      Number(jpyCharged),
      Number(gbpDebited),
      quote.rate
    );

    if (!outcome.ok) {
      setError(outcome.reason);
      return;
    }

    update({
      cardSpreadPercent: Number(outcome.spreadPercent.toFixed(2)),
      calibratedAt: Date.now(),
      calibratedSource: quote.source,
      calibratedMid: outcome.mid,
    });
    setResult(
      `Your card gave ¥${outcome.effectiveRate.toFixed(1)} per £1 against a mid-market ¥${outcome.mid.toFixed(1)} — a ${outcome.spreadPercent.toFixed(2)}% spread.`
    );
    setJpyCharged('');
    setGbpDebited('');
  }

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        <CreditCard className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
        Your card
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">
        The mid-market rate is not the rate you get. Every forward-looking pound
        figure on this page uses the rate below, so the closer this is to the
        truth the less of a surprise the statement is.
      </p>

      {/* What the numbers currently mean, in one line */}
      <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1 rounded-xl bg-white/[0.02] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
        <span className="font-mono text-sm text-ink">
          ¥{effective.toFixed(2)}
          <span className="ml-1.5 text-xs text-ink-faint">your rate today</span>
        </span>
        <span className="font-mono text-xs text-ink-dim">
          mid-market ¥{quote.rate.toFixed(2)}
        </span>
        {spread !== 0 && (
          <span className="font-mono text-xs text-glow">
            {spread > 0 ? '−' : '+'}
            {Math.abs(spread).toFixed(2)}%
          </span>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField
          label="Card spread"
          suffix="%"
          placeholder="0"
          value={
            settings.cardSpreadPercent === 0
              ? ''
              : String(settings.cardSpreadPercent)
          }
          onChange={(value) => {
            const parsed = Number(value);
            if (value === '') return update({ cardSpreadPercent: 0 });
            if (isPlausibleSpread(parsed)) {
              update({ cardSpreadPercent: parsed });
            }
          }}
        />
        <NumberField
          label="Weekend spread"
          suffix="%"
          placeholder="same"
          value={
            settings.weekendSpreadPercent === null
              ? ''
              : String(settings.weekendSpreadPercent)
          }
          onChange={(value) => {
            const parsed = Number(value);
            if (value === '') return update({ weekendSpreadPercent: null });
            if (isPlausibleSpread(parsed)) {
              update({ weekendSpreadPercent: parsed });
            }
          }}
        />
        <NumberField
          label="ATM fee"
          suffix="¥"
          value={String(settings.atmFeeJpy)}
          onChange={(value) => {
            const parsed = Number(value);
            if (isFinite(parsed) && parsed >= 0 && parsed <= 5000) {
              update({ atmFeeJpy: Math.round(parsed) });
            }
          }}
        />
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        Leave the weekend field blank to use the same figure all week. Revolut
        marks up at weekends; Monzo passes the Mastercard rate through with no
        foreign transaction fee, so for that card both stay near zero. The ATM
        fee is charged once per withdrawal, not per purchase.
      </p>

      {/* Calibration */}
      <form
        onSubmit={runCalibration}
        className="mt-7 border-t border-white/[0.06] pt-6"
      >
        <p className="text-sm font-medium text-ink">
          Work it out from one purchase
        </p>
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-ink-dim">
          After the first card payment in Japan, open the banking app and read
          off both numbers. One data point calibrates the whole trip.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <NumberField
            label="Yen charged by the shop"
            suffix="¥"
            placeholder="2500"
            value={jpyCharged}
            onChange={setJpyCharged}
          />
          <NumberField
            label="Sterling that left the account"
            suffix="£"
            placeholder="11.86"
            value={gbpDebited}
            onChange={setGbpDebited}
          />
        </div>

        <button
          type="submit"
          disabled={!jpyCharged || !gbpDebited}
          className="mt-4 rounded-full bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),inset_0_0_0_1px_rgba(255,255,255,0.06)] transition-[transform,opacity] duration-[280ms] ease-out-strong hover:scale-[1.025] active:scale-[0.975] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transform-none"
        >
          Calculate the spread
        </button>

        <AnimatePresence mode="wait">
          {result && (
            <motion.p
              key="ok"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="mt-4 inline-flex items-start gap-2 rounded-xl bg-glow/[0.1] px-4 py-3 text-xs leading-relaxed text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.28)]"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
              {result} You can still type over it above.
            </motion.p>
          )}
          {error && (
            <motion.p
              key="err"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={{ duration: 0.28, ease: easeOut }}
              className="mt-4 flex items-start gap-2 rounded-xl bg-red-400/[0.08] px-4 py-3 text-xs leading-relaxed text-red-300 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.28)]"
            >
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {warnings.length > 0 && (
        <ul className="mt-5 space-y-2 border-t border-white/[0.06] pt-5">
          {warnings.map((warning) => (
            <li
              key={warning}
              className="flex items-start gap-2 text-xs leading-relaxed text-ink-dim"
            >
              <AlertTriangle
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-glow"
                strokeWidth={1.5}
                aria-hidden
              />
              {warning}
            </li>
          ))}
        </ul>
      )}

      {settings.calibratedAt !== null && warnings.length === 0 && (
        <p className="mt-5 text-xs text-ink-faint">
          Calibrated against a mid-market{' '}
          {settings.calibratedMid !== null
            ? `¥${settings.calibratedMid.toFixed(1)}`
            : 'rate'}
          , which still looks current.
        </p>
      )}

      <p className="mt-5 text-[11px] leading-relaxed text-ink-faint">
        No bank is connected and none will be. Revolut has no personal API, and
        Monzo&rsquo;s own documentation says its developer API is not for public
        applications. One number typed in from a receipt gets almost all of the
        accuracy for an eight-day trip, with nothing to break while abroad. See{' '}
        {yen(settings.atmFeeJpy)} above for the withdrawal fee.
      </p>
    </GlassCard>
  );
}
