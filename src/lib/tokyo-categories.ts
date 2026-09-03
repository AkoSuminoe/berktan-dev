/*
 * What each spending category looks like, defined once.
 *
 * Colour, label and the planned figure all live here so the donut, the bars,
 * the legend and the expense rows cannot drift apart. The planned figures used
 * to sit in a const inside BudgetTracker, which meant the chart and the list
 * had two chances to disagree about what the plan said.
 *
 * Keyed on `ExpenseCategory`, so adding a category to the union is a type error
 * here until it has been given a colour and a figure, rather than a silently
 * missing slice.
 */

import type { ExpenseCategory } from '@/lib/tokyo-budget';

export type CategoryMeta = {
  label: string;
  /** Hex, because SVG strokes and gradients cannot take a Tailwind class. */
  colour: string;
  /** What the plan expects this to cost across the whole trip. */
  plannedJpy: number;
};

/*
 * The palette.
 *
 * Six are the colours the retired profile chooser used, picked to sit against
 * the abyss ground with none of them reading as red; the last two are existing
 * theme tokens (glow.deep and ink-dim). Red is deliberately absent: it means
 * over budget, on the bars and nowhere else, and a category permanently
 * wearing it would make that signal unreadable.
 *
 * Cash and Other are the two quietest on purpose. An ATM fee is incidental and
 * should not draw the eye away from what the money was actually spent on.
 */
export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  pedals: { label: 'Pedals', colour: '#828fff', plannedJpy: 68700 },
  collection: { label: 'Collection', colour: '#57c1ff', plannedJpy: 46000 },
  gifts: { label: 'Gifts', colour: '#d98fd0', plannedJpy: 24500 },
  /* 22,300 of dinners plus the 3,000 lunch line on the free days. */
  food: { label: 'Food', colour: '#5fd4b0', plannedJpy: 25300 },
  nightlife: { label: 'Nightlife', colour: '#f0b354', plannedJpy: 15000 },
  transport: { label: 'Transport', colour: '#8ba3c7', plannedJpy: 9000 },
  /* Nothing planned: ATM fees are incidental, not budgeted. */
  cash: { label: 'ATM fee', colour: '#5e6ad2', plannedJpy: 0 },
  other: { label: 'Other', colour: '#9d9da7', plannedJpy: 7000 },
};

export const categoryColour = (category: ExpenseCategory) =>
  CATEGORY_META[category].colour;

export const categoryLabel = (category: ExpenseCategory) =>
  CATEGORY_META[category].label;

export const plannedFor = (category: ExpenseCategory) =>
  CATEGORY_META[category].plannedJpy;
