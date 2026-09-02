'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, AlertTriangle, Info, CircleAlert } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import ChecklistItem from '@/components/tokyo/ChecklistItem';
import { tokyoDays } from '@/lib/tokyo-itinerary';
import {
  personalDays,
  shoppingItems,
  dailyAllowance,
  preTripChecklist,
  budget,
  findShop,
  findDinner,
  findViolations,
  toGbp,
  CATEGORY_LABELS,
  EXCHANGE_RATE,
  type ShoppingCategory,
  type Violation,
} from '@/lib/tokyo-personal';

const easeOut: [number, number, number, number] = [0.23, 1, 0.32, 1];

const yen = (value: number) => `¥${Math.round(value).toLocaleString('en-GB')}`;
const pounds = (value: number) => `£${toGbp(value).toFixed(0)}`;

/* Coordinates beat a text search: a name can land on the wrong branch. */
function mapsUrl(coords: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
}

/* ------------------------------------------------------------------ */
/* Budget                                                              */
/* ------------------------------------------------------------------ */

function BudgetPanel({ spent }: { spent: number }) {
  const remaining = budget.afterTaxFree - spent;
  const pct = Math.min(100, Math.round((spent / budget.afterTaxFree) * 100));

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            Spent so far
          </p>
          <p className="mt-2 font-mono text-3xl tracking-tight text-ink">
            {yen(spent)}
          </p>
          <p className="mt-1 font-mono text-sm text-ink-dim">{pounds(spent)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.16em] text-ink-faint">
            Left of the plan
          </p>
          <p className="mt-2 font-mono text-2xl tracking-tight text-ink-dim">
            {yen(remaining)}
          </p>
          <p className="mt-1 font-mono text-sm text-ink-faint">
            {pounds(remaining)}
          </p>
        </div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Budget spent"
        className="mt-6 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.07]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff3b30] to-[#57c1ff] transition-[width] duration-500 ease-out-strong motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
        {[
          { label: 'Shopping', value: budget.shopping },
          { label: 'Dinners', value: budget.dinners },
          { label: 'Daily', value: budget.daily },
          { label: 'Tax-free back', value: -budget.taxFreeSaving },
        ].map((line) => (
          <div key={line.label}>
            <dt className="text-xs text-ink-faint">{line.label}</dt>
            <dd
              className={`mt-1 font-mono text-sm ${
                line.value < 0 ? 'text-glow' : 'text-ink-dim'
              }`}
            >
              {line.value < 0 ? '-' : ''}
              {yen(Math.abs(line.value))}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        Planned total {yen(budget.afterTaxFree)} ({pounds(budget.afterTaxFree)})
        after tax-free, from a {yen(budget.sticker)} sticker. Rate used is ¥
        {EXCHANGE_RATE} to the pound. Tax-free takes the consumption tax out of
        a tax-inclusive price, so it returns about 9.09%, not 10%.
      </p>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Violations                                                          */
/* ------------------------------------------------------------------ */

const SEVERITY = {
  error: {
    Icon: CircleAlert,
    ring: 'shadow-[inset_0_0_0_1px_rgba(248,113,113,0.32)]',
    tint: 'text-red-300',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'shadow-[inset_0_0_0_1px_rgba(130,143,255,0.3)]',
    tint: 'text-glow',
  },
  note: {
    Icon: Info,
    ring: 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]',
    tint: 'text-ink-faint',
  },
} as const;

function ViolationsPanel({ violations }: { violations: Violation[] }) {
  if (violations.length === 0) return null;

  return (
    <GlassCard coreClassName="p-6 sm:p-7">
      <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
        Worth knowing
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-dim">
        Checked against the shop hours, the closing days and the sequencing
        rules. Nothing here is hidden from the plan because it is inconvenient.
      </p>

      <ul className="mt-6 space-y-3">
        {violations.map((violation) => {
          const { Icon, ring, tint } = SEVERITY[violation.severity];
          return (
            <li
              key={violation.id}
              className={`flex items-start gap-3.5 rounded-xl bg-white/[0.02] px-4 py-3.5 ${ring}`}
            >
              <Icon
                aria-hidden
                className={`mt-0.5 h-4 w-4 shrink-0 ${tint}`}
                strokeWidth={1.5}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">
                  {violation.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-dim">
                  {violation.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

/* ------------------------------------------------------------------ */
/* Day card                                                            */
/* ------------------------------------------------------------------ */

function PersonalDayCard({
  index,
  checkedIds,
  onToggle,
  day,
}: {
  index: number;
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
  day: (typeof personalDays)[number];
}) {
  const programme = tokyoDays.find((entry) => entry.id === day.dayId);
  const dinner = day.dinnerId ? findDinner(day.dinnerId) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.62, delay: (index % 2) * 0.06, ease: easeOut }}
    >
      <GlassCard className="h-full" coreClassName="p-6 sm:p-7">
        <p className="font-mono text-xs text-ink-faint">
          {day.weekday} {day.date}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">
          {programme?.title ?? 'Free day'}
        </h3>

        {/* What the programme already claims, so the day is read in context */}
        {programme && programme.items.length > 0 && (
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Programme: {programme.items.map((item) => item.label).join(' · ')}
          </p>
        )}

        <p className="mt-4 text-sm leading-relaxed text-ink-dim">
          {day.rationale}
        </p>

        {day.stops.length > 0 && (
          <div className="mt-6">
            <p className="px-3 text-xs uppercase tracking-[0.16em] text-ink-faint">
              Stops
            </p>
            <div className="mt-2 space-y-1">
              {day.stops.map((stop) => {
                const shop = stop.shopId ? findShop(stop.shopId) : undefined;
                const items = (stop.itemIds ?? [])
                  .map((id) => shoppingItems.find((item) => item.id === id))
                  .filter((item): item is (typeof shoppingItems)[number] =>
                    Boolean(item)
                  );
                const cost = items.reduce((total, item) => total + item.jpy, 0);

                return (
                  <div key={stop.id}>
                    <ChecklistItem
                      id={stop.id}
                      label={stop.label}
                      detail={[
                        shop && `${shop.name}, ${shop.opens} to ${shop.closes}`,
                        stop.detail,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      checked={checkedIds.has(stop.id)}
                      onToggle={onToggle}
                      trailing={
                        stop.lookOnly ? 'look' : cost > 0 ? yen(cost) : undefined
                      }
                    />
                    {shop && (
                      <a
                        href={mapsUrl(shop.coords)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group ml-[3.25rem] inline-flex items-center gap-1.5 pb-1 text-xs text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
                      >
                        {shop.area}
                        <ArrowUpRight
                          className="h-3 w-3 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          strokeWidth={1.5}
                        />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="px-3 text-xs uppercase tracking-[0.16em] text-ink-faint">
            Dinner
          </p>
          {dinner ? (
            <>
              <ChecklistItem
                id={`dinner-${dinner.id}`}
                label={`${dinner.kind}: ${dinner.name}`}
                detail={[
                  dinner.opens && `${dinner.opens} to ${dinner.closes}`,
                  dinner.note,
                ]
                  .filter(Boolean)
                  .join(' · ')}
                checked={checkedIds.has(`dinner-${dinner.id}`)}
                onToggle={onToggle}
                trailing={yen(dinner.jpy)}
              />
              {dinner.coords && (
                <a
                  href={mapsUrl(dinner.coords)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group ml-[3.25rem] inline-flex items-center gap-1.5 text-xs text-glow transition-colors duration-[280ms] ease-out-strong hover:text-ink"
                >
                  {dinner.area}
                  <ArrowUpRight
                    className="h-3 w-3 transition-transform duration-[280ms] ease-out-strong group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </a>
              )}
            </>
          ) : (
            <p className="mt-2 px-3 text-sm leading-relaxed text-ink-dim">
              {day.eveningNote ?? 'Nothing planned.'}
            </p>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Personal plan                                                       */
/* ------------------------------------------------------------------ */

export default function PersonalPlan({
  checkedIds,
  onToggle,
}: {
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const violations = useMemo(() => findViolations(), []);

  /* Ticking is spending: the number only moves for things actually bought. */
  const spent = useMemo(() => {
    const goods = shoppingItems
      .filter((item) => checkedIds.has(item.id))
      .reduce((total, item) => total + item.jpy, 0);

    const meals = personalDays
      .map((day) => day.dinnerId)
      .filter((id): id is string => Boolean(id))
      .filter((id) => checkedIds.has(`dinner-${id}`))
      .map((id) => findDinner(id)?.jpy ?? 0)
      .reduce((total, jpy) => total + jpy, 0);

    return goods + meals;
  }, [checkedIds]);

  const byCategory = useMemo(() => {
    const groups: Record<ShoppingCategory, typeof shoppingItems> = {
      pedals: [],
      collection: [],
      gifts: [],
    };
    for (const item of shoppingItems) groups[item.category].push(item);
    return groups;
  }, []);

  return (
    <div className="space-y-5">
      <BudgetPanel spent={spent} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {personalDays.map((day, index) => (
          <PersonalDayCard
            key={day.dayId}
            day={day}
            index={index}
            checkedIds={checkedIds}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* The list itself, grouped, for ticking things off in a shop */}
      <GlassCard coreClassName="p-6 sm:p-7">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Shopping list
        </h3>
        <div className="mt-6 space-y-8">
          {(Object.keys(byCategory) as ShoppingCategory[]).map((category) => (
            <div key={category}>
              <p className="px-3 text-sm font-medium text-ink">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="mt-2 space-y-1">
                {byCategory[category].map((item) => {
                  const shop = item.shopId ? findShop(item.shopId) : undefined;
                  return (
                    <ChecklistItem
                      key={item.id}
                      id={item.id}
                      label={item.label}
                      detail={[
                        shop ? `${shop.name}, ${shop.area}` : 'Anywhere',
                        item.taxFree ? 'tax-free' : null,
                        item.note,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                      checked={checkedIds.has(item.id)}
                      onToggle={onToggle}
                      trailing={yen(item.jpy)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <p className="px-3 text-sm font-medium text-ink">Daily allowance</p>
            <p className="mt-1 px-3 text-xs leading-relaxed text-ink-faint">
              Counted in the plan but not ticked off, because it is spent a
              little at a time rather than bought.
            </p>
            <div className="mt-3 space-y-1">
              {dailyAllowance.map((line) => (
                <div
                  key={line.id}
                  className="flex items-baseline justify-between gap-4 px-3 py-1.5"
                >
                  <span className="text-sm text-ink-dim">
                    {line.label}
                    {line.note && (
                      <span className="text-ink-faint"> · {line.note}</span>
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-faint">
                    {yen(line.jpy)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <ViolationsPanel violations={violations} />

      <GlassCard coreClassName="p-6 sm:p-7">
        <h3 className="text-xs font-medium uppercase tracking-[0.18em] text-ink-faint">
          Before the flight
        </h3>
        <div className="mt-4 space-y-1">
          {preTripChecklist.map((task) => (
            <ChecklistItem
              key={task.id}
              id={task.id}
              label={task.label}
              detail={task.detail}
              checked={checkedIds.has(task.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
