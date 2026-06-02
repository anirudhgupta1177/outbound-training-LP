import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shouldShowDfyUpsell } from '../constants/upsell';

// One increment per browser-tab session (survives in-app navigation/refresh,
// resets when a new tab/session is opened or the user logs in again).
const SESSION_FLAG = 'dfy_login_counted';
const OPEN_DELAY_MS = 1200; // let the dashboard paint before interrupting

/**
 * Records the login (atomic Supabase increment) once per session and decides
 * whether to surface the DFY upsell modal based on the user's login count.
 * Returns { open, close } for a <DfyUpsellModal />.
 */
export function useDfyUpsell() {
  const { user, recordLogin } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (sessionStorage.getItem(SESSION_FLAG)) return; // already counted this session
    sessionStorage.setItem(SESSION_FLAG, '1');

    let active = true;
    let timer;

    recordLogin().then((count) => {
      if (!active || count == null) return;
      if (shouldShowDfyUpsell(count)) {
        timer = setTimeout(() => {
          if (active) setOpen(true);
        }, OPEN_DELAY_MS);
      }
    });

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [user, recordLogin]);

  return { open, close: () => setOpen(false) };
}
