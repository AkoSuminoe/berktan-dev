/*
 * Shared binding types.
 *
 * They used to be re-exported from PersonalPlan, which meant the Money tab had
 * to import from a sibling tab to describe its own props. A type that three
 * components need is not owned by one of them.
 */

import type { useTokyoBudget } from '@/hooks/useTokyoBudget';
import type { useTokyoSettings } from '@/hooks/useTokyoSettings';

export type BudgetBinding = ReturnType<typeof useTokyoBudget>;
export type SettingsBinding = ReturnType<typeof useTokyoSettings>;
