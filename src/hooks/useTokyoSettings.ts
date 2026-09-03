'use client';

import { useCallback, useEffect, useState } from 'react';
import { SETTINGS_STORAGE_KEY } from '@/lib/tokyo-storage';
import {
  defaultSettings,
  readSettings,
  writeSettings,
  type TokyoSettings,
} from '@/lib/tokyo-settings';

/**
 * Card settings.
 *
 * Same shape as `useTokyoBudget`: `ready` gates anything that would otherwise
 * render a stored value during SSR, because localStorage cannot be read on the
 * server and the first client render has to match the one it replaces.
 */
export function useTokyoSettings() {
  const [settings, setSettings] = useState<TokyoSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(readSettings(SETTINGS_STORAGE_KEY));
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<TokyoSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeSettings(SETTINGS_STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { settings, ready, update };
}
