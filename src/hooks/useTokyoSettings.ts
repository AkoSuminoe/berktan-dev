'use client';

import { useCallback, useEffect, useState } from 'react';
import { settingsKey } from '@/lib/tokyo-profiles';
import {
  defaultSettings,
  readSettings,
  writeSettings,
  type TokyoSettings,
} from '@/lib/tokyo-settings';

/**
 * Card settings for the active profile.
 *
 * Same shape as `useTokyoBudget`: nothing is read or written before a profile
 * exists, `ready` gates anything that would otherwise render a stored value
 * during SSR, and the effect re-runs on a profile switch.
 */
export function useTokyoSettings(profileId: string | null) {
  const [settings, setSettings] = useState<TokyoSettings>(defaultSettings);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!profileId) {
      setSettings(defaultSettings());
      setReady(false);
      return;
    }
    setSettings(readSettings(settingsKey(profileId)));
    setReady(true);
  }, [profileId]);

  const update = useCallback(
    (patch: Partial<TokyoSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        if (profileId) writeSettings(settingsKey(profileId), next);
        return next;
      });
    },
    [profileId]
  );

  return { settings, ready, update };
}
