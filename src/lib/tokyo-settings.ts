/*
 * What the card actually charges.
 *
 * The mid-market rate is not the rate you get. Every card puts a spread on top,
 * and no free rate feed knows what yours is: only your banking app does, after
 * one real purchase. So the spread is a number the traveller enters, calibrated
 * from a receipt, and applied to the live rate everywhere a future cost is
 * shown.
 *
 * Its own key rather than a field on BudgetState, because resetting a budget
 * should not throw away a calibration that cost a real purchase to obtain.
 */

import {
  isPlausibleRate,
  MIN_PLAUSIBLE_RATE,
  MAX_PLAUSIBLE_RATE,
  type FxSource,
} from '@/lib/tokyo-fx';

export const SETTINGS_SCHEMA_VERSION = 1;

export type TokyoSettings = {
  version: number;
  /** Percent below mid-market. 0 means the card charges the mid rate. */
  cardSpreadPercent: number;
  /** Null means weekends use the weekday figure. */
  weekendSpreadPercent: number | null;
  /** Flat charge per cash withdrawal. 7 Bank's typical fee. */
  atmFeeJpy: number;
  calibratedAt: number | null;
  /**
   * Which feed the calibration was measured against.
   *
   * The two providers disagreed by 1.9% on 3 Sept 2026, which is the same
   * order as the spread itself. Calibrating against one and then applying the
   * result to the other would bury a second error the same size as the thing
   * being measured, so the source travels with the number and a mismatch is
   * reported rather than absorbed.
   */
  calibratedSource: FxSource | null;
  /** The mid-market rate used in that calculation, for showing the working. */
  calibratedMid: number | null;
};

export function defaultSettings(): TokyoSettings {
  return {
    version: SETTINGS_SCHEMA_VERSION,
    cardSpreadPercent: 0,
    weekendSpreadPercent: null,
    atmFeeJpy: 220,
    calibratedAt: null,
    calibratedSource: null,
    calibratedMid: null,
  };
}

/* ------------------------------------------------------------------ */
/* Bounds                                                              */
/* ------------------------------------------------------------------ */

/**
 * A plausible card spread.
 *
 * Slightly negative is real: a card can beat the reference rate by a hair when
 * the feed's snapshot is a few hours stale. Above 8% is not a card, it is a
 * typo or a bureau de change at an airport, and writing it would quietly
 * corrupt every forward-looking figure on the page.
 */
export const MIN_SPREAD_PERCENT = -1;
export const MAX_SPREAD_PERCENT = 8;

export function isPlausibleSpread(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    isFinite(value) &&
    value >= MIN_SPREAD_PERCENT &&
    value <= MAX_SPREAD_PERCENT
  );
}

/* ------------------------------------------------------------------ */
/* The effective rate                                                  */
/* ------------------------------------------------------------------ */

/** Saturday and Sunday, in the traveller's local reckoning. */
export function isWeekend(date: string): boolean {
  const day = new Date(`${date}T12:00:00`).getDay();
  return day === 0 || day === 6;
}

export function spreadFor(settings: TokyoSettings, date: string): number {
  return isWeekend(date) && settings.weekendSpreadPercent !== null
    ? settings.weekendSpreadPercent
    : settings.cardSpreadPercent;
}

/**
 * Mid-market adjusted by the card's cut.
 *
 * A spread means FEWER yen per pound: the card keeps the difference. Revolut
 * marks up at weekends, which is what the separate weekend figure is for;
 * Monzo passes the Mastercard rate through with no foreign transaction fee, so
 * for that card both stay near zero.
 */
export function effectiveRate(
  mid: number,
  settings: TokyoSettings,
  date: string
): number {
  const spread = spreadFor(settings, date);
  const adjusted = mid * (1 - spread / 100);
  /* A corrupt spread must never produce an unusable rate. */
  return isPlausibleRate(adjusted) ? adjusted : mid;
}

/* ------------------------------------------------------------------ */
/* Calibration                                                         */
/* ------------------------------------------------------------------ */

export type Calibration =
  | { ok: true; effectiveRate: number; spreadPercent: number; mid: number }
  | { ok: false; reason: string };

/**
 * Work the spread out from one real purchase.
 *
 * Read both numbers off the banking app: the yen the merchant charged, and the
 * sterling that left the account. One data point calibrates the whole trip.
 */
export function calibrate(
  jpyCharged: number,
  gbpDebited: number,
  mid: number
): Calibration {
  if (!isFinite(jpyCharged) || jpyCharged <= 0) {
    return { ok: false, reason: 'Enter the yen amount the merchant charged.' };
  }
  if (!isFinite(gbpDebited) || gbpDebited <= 0) {
    return { ok: false, reason: 'Enter the sterling that left your account.' };
  }
  if (!isPlausibleRate(mid)) {
    return { ok: false, reason: 'No mid-market rate to compare against yet.' };
  }

  /*
   * Bounds written out rather than through `isPlausibleRate`. That is a type
   * predicate, so narrowing an already-numeric value leaves `never` in the
   * else branch and the number cannot be quoted back in the message. The
   * message is the useful part here: it is how you notice the two fields have
   * been filled in the wrong order.
   */
  const rate = jpyCharged / gbpDebited;
  if (rate < MIN_PLAUSIBLE_RATE || rate > MAX_PLAUSIBLE_RATE) {
    return {
      ok: false,
      reason: `That works out at ¥${rate.toFixed(0)} to the pound, which is not a rate. Check the two amounts are the right way round.`,
    };
  }

  const spreadPercent = ((mid - rate) / mid) * 100;
  if (
    spreadPercent < MIN_SPREAD_PERCENT ||
    spreadPercent > MAX_SPREAD_PERCENT
  ) {
    return {
      ok: false,
      reason:
        spreadPercent > MAX_SPREAD_PERCENT
          ? `That implies a ${spreadPercent.toFixed(1)}% spread. Above ${MAX_SPREAD_PERCENT}% is more likely a typo than a card, so nothing was saved.`
          : `That implies your card beat the market by ${Math.abs(spreadPercent).toFixed(1)}%, which does not happen. Nothing was saved.`,
    };
  }

  return { ok: true, effectiveRate: rate, spreadPercent, mid };
}

const DAY_MS = 24 * 60 * 60 * 1000;
export const CALIBRATION_STALE_DAYS = 7;

/** Why a stored calibration might no longer hold. Empty means it is fine. */
export function calibrationWarnings(
  settings: TokyoSettings,
  currentSource: FxSource,
  today: string,
  now: number = Date.now()
): string[] {
  const warnings: string[] = [];
  if (settings.calibratedAt === null) return warnings;

  const days = Math.floor((now - settings.calibratedAt) / DAY_MS);
  if (days > CALIBRATION_STALE_DAYS) {
    warnings.push(
      `Calibrated ${days} days ago. Rates and card margins both move; one fresh purchase would re-check it.`
    );
  }

  if (
    settings.calibratedSource !== null &&
    settings.calibratedSource !== currentSource &&
    currentSource !== 'fallback'
  ) {
    warnings.push(
      'Calibrated against a different rate feed from the one in use now, and the two do not always agree. The spread may be off by as much as it measures.'
    );
  }

  /*
   * A weekday calibration says nothing about a weekend, and the other way
   * round, on any card that marks up at weekends. Only worth saying when no
   * separate weekend figure has been set.
   */
  if (settings.weekendSpreadPercent === null) {
    const calibratedOnWeekend = isWeekend(
      new Date(settings.calibratedAt).toISOString().slice(0, 10)
    );
    if (calibratedOnWeekend !== isWeekend(today)) {
      warnings.push(
        calibratedOnWeekend
          ? 'Calibrated at a weekend and today is a weekday. Some cards charge differently.'
          : 'Calibrated on a weekday and today is a weekend, when some cards add a markup.'
      );
    }
  }

  return warnings;
}

/* ------------------------------------------------------------------ */
/* Validation and storage                                              */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const SOURCES: FxSource[] = ['erapi', 'frankfurter', 'fallback'];

export function parseSettings(value: unknown): TokyoSettings | null {
  if (!isRecord(value)) return null;
  if (value.version !== SETTINGS_SCHEMA_VERSION) return null;

  const base = defaultSettings();
  return {
    version: SETTINGS_SCHEMA_VERSION,
    cardSpreadPercent: isPlausibleSpread(value.cardSpreadPercent)
      ? value.cardSpreadPercent
      : base.cardSpreadPercent,
    weekendSpreadPercent: isPlausibleSpread(value.weekendSpreadPercent)
      ? value.weekendSpreadPercent
      : null,
    atmFeeJpy:
      typeof value.atmFeeJpy === 'number' &&
      isFinite(value.atmFeeJpy) &&
      value.atmFeeJpy >= 0 &&
      value.atmFeeJpy <= 5000
        ? Math.round(value.atmFeeJpy)
        : base.atmFeeJpy,
    calibratedAt:
      typeof value.calibratedAt === 'number' && isFinite(value.calibratedAt)
        ? value.calibratedAt
        : null,
    calibratedSource:
      SOURCES.indexOf(value.calibratedSource as FxSource) !== -1
        ? (value.calibratedSource as FxSource)
        : null,
    calibratedMid: isPlausibleRate(value.calibratedMid)
      ? value.calibratedMid
      : null,
  };
}

export function readSettings(key: string): TokyoSettings {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultSettings();
    return parseSettings(JSON.parse(raw) as unknown) ?? defaultSettings();
  } catch {
    return defaultSettings();
  }
}

export function writeSettings(key: string, settings: TokyoSettings): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}
