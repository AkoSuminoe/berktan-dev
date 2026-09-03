'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Banknote, CloudRain, Moon } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ChecklistItem from '@/components/tokyo/ChecklistItem';
import ViolationsPanel from '@/components/tokyo/ViolationsPanel';
import QuickAddExpense from '@/components/tokyo/QuickAddExpense';
import { yen, mapsSearchUrl } from '@/components/tokyo/format';
import type { BudgetBinding } from '@/components/tokyo/PersonalPlan';
import { tokyoDays } from '@/lib/tokyo-itinerary';
import type { Weekday } from '@/lib/tokyo-personal';
import {
  eveningPlans,
  nightlifeVenues,
  unassignedVenues,
  konbini,
  konbiniPicks,
  desserts,
  lateNightFood,
  alsoWorthEating,
  findVenue,
  findNightViolations,
  closingLabel,
  isOpenOn,
  mapsQuery,
  nightIdFor,
  WEATHER,
  type Venue,
  type FoodPick,
} from '@/lib/tokyo-nights';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const SHELTER_LABEL = {
  indoor: 'Indoor',
  partly: 'Partly covered',
  outdoor: 'Open-air',
} as const;

/* ------------------------------------------------------------------ */
/* Bits                                                                */
/* ------------------------------------------------------------------ */

function MapsLink({ query, label }: { query: string; label: string }) {
  return (
    <a
      href={mapsSearchUrl(query)}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 text-xs text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
    >
      {label}
      <ArrowUpRight
        className="h-3 w-3 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        strokeWidth={1.5}
      />
    </a>
  );
}

function Pill({
  children,
  tone = 'quiet',
}: {
  children: React.ReactNode;
  tone?: 'quiet' | 'glow' | 'warn';
}) {
  const tones = {
    quiet:
      'bg-white/[0.04] text-ink-dim shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]',
    glow: 'bg-glow/[0.12] text-glow shadow-[inset_0_0_0_1px_rgba(130,143,255,0.3)]',
    warn: 'bg-red-400/[0.1] text-red-300 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.28)]',
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/** Everything a venue costs before you have ordered anything, where known. */
function venueCostLine(venue: Venue): string | null {
  if (!venue.coverJpy) return null;
  if (!venue.typicalDrinkJpy) return `${yen(venue.coverJpy)} cover`;
  return `${yen(venue.coverJpy)} cover, ${yen(venue.typicalDrinkJpy)} a drink, so ${yen(
    venue.coverJpy + venue.typicalDrinkJpy
  )} for one round`;
}

function VenueMeta({ venue }: { venue: Venue }) {
  const cost = venueCostLine(venue);
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
      <Pill>{venue.walkMinutes} min walk</Pill>
      <Pill tone={venue.shelter === 'indoor' ? 'quiet' : 'glow'}>
        {venue.shelter !== 'indoor' && (
          <CloudRain className="h-3 w-3" strokeWidth={1.5} aria-hidden />
        )}
        {SHELTER_LABEL[venue.shelter]}
      </Pill>
      <Pill>
        {venue.opens} to {closingLabel(venue.opens, venue.closes)}
      </Pill>
      {venue.closedDays && (
        <Pill tone="warn">Closed {venue.closedDays.join(', ')}</Pill>
      )}
      {cost && (
        <Pill tone="glow">
          <Banknote className="h-3 w-3" strokeWidth={1.5} aria-hidden />
          {cost}
        </Pill>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Evening card                                                        */
/* ------------------------------------------------------------------ */

function EveningCard({
  index,
  evening,
  checkedIds,
  onToggle,
}: {
  index: number;
  evening: (typeof eveningPlans)[number];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const programme = tokyoDays.find((day) => day.id === evening.dayId);
  const venue = evening.venueId ? findVenue(evening.venueId) : undefined;
  const alternative = evening.alternativeVenueId
    ? findVenue(evening.alternativeVenueId)
    : undefined;
  const id = nightIdFor(evening.dayId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.62, delay: (index % 2) * 0.06, ease: easeOut }}
    >
      <GlassCard className="h-full" coreClassName="p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="font-mono text-xs text-ink-faint">
            {evening.weekday} {evening.date}
          </p>
          {evening.hardStop && (
            <Pill tone="warn">Back by {evening.hardStop}</Pill>
          )}
        </div>

        <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
          {venue ? venue.name : 'No night out'}
        </h3>

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          Day ends: {evening.programmeEnding}
          {programme ? ` · ${programme.title}` : ''}
        </p>

        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          {evening.reason}
        </p>

        {venue ? (
          <div className="mt-6">
            <ChecklistItem
              id={id}
              label={`${venue.kind}: ${venue.name}`}
              detail={venue.note}
              checked={checkedIds.has(id)}
              onToggle={onToggle}
            />
            <div className="ml-[3.25rem]">
              <VenueMeta venue={venue} />
              <div className="mt-2">
                <MapsLink
                  query={mapsQuery(venue.name, venue.address)}
                  label={venue.address}
                />
              </div>
            </div>

            {alternative && (
              <div className="mt-5 rounded-xl bg-white/[0.02] px-4 py-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
                  If that one is full
                </p>
                <p className="mt-1.5 text-sm font-medium text-ink">
                  {alternative.name}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                  {alternative.note}
                </p>
                <div className="mt-2">
                  <MapsLink
                    query={mapsQuery(alternative.name, alternative.address)}
                    label={`${alternative.walkMinutes} min walk`}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs text-ink-faint shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            <Moon className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            Nothing planned, on purpose
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Venue list                                                          */
/* ------------------------------------------------------------------ */

const WEEKDAYS: Weekday[] = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function VenueList() {
  /*
   * Closed venues are marked, not removed. Hiding one hides the reason it is
   * missing, which on a Sunday is the single most useful thing this filter has
   * to say: Nonbei, the best night in Shibuya, is shut.
   */
  const [weekday, setWeekday] = useState<Weekday>('Sat');

  const assignedIds = useMemo(
    () =>
      eveningPlans
        .filter((evening) => Boolean(evening.venueId))
        .map((evening) => evening.venueId),
    []
  );

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Every venue, walkable from the hotel
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        Pick a day to see what is open. September runs to about{' '}
        {WEATHER.monthlyRainMm} mm across {WEATHER.rainDays} rain days, so the
        shelter flag matters as much as the hours.
      </p>

      <div
        role="group"
        aria-label="Filter venues by day"
        className="mt-5 flex flex-wrap gap-1.5"
      >
        {WEEKDAYS.map((day) => (
          <button
            key={day}
            type="button"
            aria-pressed={weekday === day}
            onClick={() => setWeekday(day)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-[color,background-color,transform] duration-200 ease-out-strong active:scale-[0.97] active:duration-100 motion-reduce:transform-none ${
              weekday === day
                ? 'bg-white/[0.09] text-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]'
                : 'bg-white/[0.03] text-ink-faint hover:text-ink-dim'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <ul className="mt-6 space-y-3">
        {nightlifeVenues.map((venue) => {
          const open = isOpenOn(venue, weekday);
          const assigned = assignedIds.indexOf(venue.id) !== -1;

          return (
            <li
              key={venue.id}
              className={`rounded-xl bg-white/[0.02] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] transition-opacity duration-[280ms] ease-out-strong ${
                open ? '' : 'opacity-45'
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">
                  {venue.name}
                  <span className="ml-2 font-normal text-ink-faint">
                    {venue.kind}
                  </span>
                </p>
                {!open ? (
                  <Pill tone="warn">Closed {weekday}</Pill>
                ) : assigned ? (
                  <Pill tone="glow">On the plan</Pill>
                ) : (
                  <Pill>Any night</Pill>
                )}
              </div>

              <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">
                {venue.note}
              </p>
              <VenueMeta venue={venue} />
              <div className="mt-2">
                <MapsLink
                  query={mapsQuery(venue.name, venue.address)}
                  label={venue.address}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 border-t border-white/[0.06] pt-6">
        <p className="text-sm font-medium text-ink">Late-night food</p>
        <p className="mt-1 text-xs leading-relaxed text-ink-faint">
          Both 24 hours, so neither has an opening time to miss.
        </p>
        <ul className="mt-3 space-y-2.5">
          {lateNightFood.map((place) => (
            <li key={place.id}>
              <p className="text-sm text-ink-dim">{place.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">
                {place.note}
              </p>
              <div className="mt-1">
                <MapsLink
                  query={mapsQuery(place.name, place.address)}
                  label={place.address}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Food lists                                                          */
/* ------------------------------------------------------------------ */

function FoodChecklist({
  picks,
  checkedIds,
  onToggle,
}: {
  picks: FoodPick[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      {picks.map((pick) => {
        const day = pick.tiedToDayId
          ? tokyoDays.find((entry) => entry.id === pick.tiedToDayId)
          : undefined;

        return (
          <div key={pick.id}>
            <ChecklistItem
              id={pick.id}
              label={pick.name}
              detail={[
                pick.vendor,
                day && `${day.weekday} ${day.date}`,
                pick.opens && `${pick.opens} to ${pick.closes}`,
                pick.closedDays && `closed ${pick.closedDays.join(' and ')}`,
                pick.note,
              ]
                .filter(Boolean)
                .join(' · ')}
              checked={checkedIds.has(pick.id)}
              onToggle={onToggle}
              trailing={yen(pick.approxJpy)}
            />
            {pick.address && (
              <div className="ml-[3.25rem] pb-1">
                <MapsLink
                  query={mapsQuery(pick.vendor, pick.address)}
                  label={pick.address}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nights and food                                                     */
/* ------------------------------------------------------------------ */

export default function NightsAndFood({
  checkedIds,
  onToggle,
  budgetBinding,
}: {
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  budgetBinding: BudgetBinding;
}) {
  const violations = useMemo(() => findNightViolations(), []);
  const { ready, state, pending, actions } = budgetBinding;

  /*
   * A night out costs money, so ticking one prefills the quick-add. The amount
   * is only filled where the brief states a price: a cover charge, and a drink
   * price for the one venue that publishes it. Everywhere else the row opens
   * blank with the category set, because inventing a bar tab would be worse
   * than asking for it.
   */
  const onToggleNight = useCallback(
    (id: string) => {
      const wasChecked = checkedIds.has(id);
      onToggle(id);
      if (!ready) return;
      if (wasChecked) return actions.removeExpenseForPlannedItem(id);

      const evening = eveningPlans.find(
        (entry) => nightIdFor(entry.dayId) === id
      );
      const venue = evening?.venueId ? findVenue(evening.venueId) : undefined;
      const known =
        venue && (venue.coverJpy || venue.typicalDrinkJpy)
          ? (venue.coverJpy ?? 0) + (venue.typicalDrinkJpy ?? 0)
          : null;

      actions.prefill({
        jpy: known,
        category: 'nightlife',
        note: venue?.name,
        plannedItemId: id,
      });
    },
    [checkedIds, onToggle, ready, actions]
  );

  return (
    <div className="space-y-5">
      <GlassCard coreClassName="p-6 sm:p-7">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Nights and food
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
          The Personal tab answers what to buy and where to eat dinner. This one
          answers the programme just ended, you are back in Shibuya, now what.
          Everything here is walkable from Sakuragaoka-cho, and the four venues
          marked <span className="text-ink">Any night</span> are deliberately
          unassigned.
        </p>
      </GlassCard>

      {ready && (
        <QuickAddExpense
          pending={pending}
          actions={actions}
          disabled={state.totalJpy === null}
        />
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {eveningPlans.map((evening, index) => (
          <EveningCard
            key={evening.dayId}
            evening={evening}
            index={index}
            checkedIds={checkedIds}
            onToggle={onToggleNight}
          />
        ))}
      </div>

      <VenueList />

      {/* Konbini: the two that matter, because one of them has the ATM */}
      <GlassCard coreClassName="p-6 sm:p-7">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Konbini near the hotel
        </h3>
        <ul className="mt-5 space-y-3">
          {konbini.map((store) => (
            <li
              key={store.id}
              className="rounded-xl bg-white/[0.02] px-4 py-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-ink">{store.name}</p>
                {store.hasForeignAtm && (
                  <Pill tone="glow">7 Bank ATM, takes foreign cards</Pill>
                )}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-dim">
                {store.note}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Pill>{store.walkMinutes} min walk</Pill>
                <Pill>24 hours</Pill>
              </div>
              <div className="mt-2">
                <MapsLink
                  query={mapsQuery(store.name, store.address)}
                  label={store.address}
                />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          Cigarettes come from either, passport in hand. Neither operates
          tax-free, and tobacco duty is not refundable anywhere.
        </p>
      </GlassCard>

      {/* Ticked for interest. These never reach the spend total. */}
      <GlassCard coreClassName="p-6 sm:p-7">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Konbini must-tries
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          Cheap, no queue, no language barrier. Ticked for the sake of it, not
          for the budget.
        </p>
        <div className="mt-5">
          <FoodChecklist
            picks={konbiniPicks}
            checkedIds={checkedIds}
            onToggle={onToggle}
          />
        </div>
      </GlassCard>

      <GlassCard coreClassName="p-6 sm:p-7">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Desserts and street food
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-dim">
          The Asakusa four are all on Saturday 5 September, within a few minutes
          of Sensoji and the Nakamise stalls you are already walking down.
        </p>
        <div className="mt-5">
          <FoodChecklist
            picks={desserts}
            checkedIds={checkedIds}
            onToggle={onToggle}
          />
        </div>
        <p className="mt-6 text-xs leading-relaxed text-ink-faint">
          Also worth eating, with no fixed venue: {alsoWorthEating}
        </p>
      </GlassCard>

      <ViolationsPanel
        violations={violations}
        intro="Checked against the closing days, the opening hours and Friday's coach. The four unassigned venues are not checked, because they are not on a night yet."
      />

      {unassignedVenues.length > 0 && (
        <p className="px-1 text-xs leading-relaxed text-ink-faint">
          Held in reserve:{' '}
          {unassignedVenues.map((venue) => venue.name).join(', ')}.
        </p>
      )}
    </div>
  );
}
