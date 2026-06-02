// DFY (Done-For-You) high-ticket upsell configuration.
// Positioning: "Want me and my team to build and run this entire outbound
// channel for you? Book a call with me..." -> dfy.intentledsales.com

export const DFY_UPSELL_URL = 'https://dfy.intentledsales.com';

// Login numbers on which the dashboard upsell popup should appear:
//   1st, 5th, 10th, 20th, 30th login... then every +10 logins (40, 50, 60, ...).
export const DFY_UPSELL_MILESTONES = [1, 5, 10, 20, 30];
const DFY_UPSELL_RECURRING_EVERY = 10; // after the last fixed milestone (30)

/**
 * Decide whether to show the DFY upsell popup for a given (1-based) login count.
 * Fires on 1, 5, 10, 20, 30, 40, 50, 60, ... (every 10 after 30).
 * @param {number} loginCount
 * @returns {boolean}
 */
export function shouldShowDfyUpsell(loginCount) {
  if (!Number.isInteger(loginCount) || loginCount < 1) return false;
  if (DFY_UPSELL_MILESTONES.includes(loginCount)) return true;
  const lastFixed = DFY_UPSELL_MILESTONES[DFY_UPSELL_MILESTONES.length - 1]; // 30
  if (loginCount > lastFixed && loginCount % DFY_UPSELL_RECURRING_EVERY === 0) return true;
  return false;
}
