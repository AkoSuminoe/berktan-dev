/*
 * One icon per category, in one map.
 *
 * Separate from `tokyo-categories.ts` because that file is pure data and gets
 * imported by the logic checks, which have no React to render an icon with.
 * Colour and label live there; the glyph lives here, next to the components
 * that draw it.
 */

import {
  Guitar,
  Boxes,
  Gift,
  Utensils,
  Martini,
  TrainFront,
  Banknote,
  Shapes,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategory } from '@/lib/tokyo-budget';

export const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  pedals: Guitar,
  collection: Boxes,
  gifts: Gift,
  food: Utensils,
  nightlife: Martini,
  transport: TrainFront,
  cash: Banknote,
  other: Shapes,
};
