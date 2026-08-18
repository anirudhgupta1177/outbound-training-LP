// Loader for Razorpay's hosted checkout script.
//
// Extracted from the course checkout so the vault's consultation upsell opens
// the same popup through the same (deduped, timeout-guarded) code path rather
// than a second copy that drifts.

const RAZORPAY_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

// How long to wait for Razorpay's script before giving up. Networks that drop
// packets instead of refusing them (regional blocks, corporate firewalls, some
// DNS filters) never fire `error` on a <script>, so without this the promise
// would never settle and the pay button would spin forever.
const RAZORPAY_LOAD_TIMEOUT_MS = 10000;

// Message shown when the script never arrives. Ad blockers and VPNs are by far
// the most common cause, so lead with those rather than a generic failure.
export const RAZORPAY_UNAVAILABLE_MESSAGE =
  "We couldn't load the payment gateway. Please disable any ad blocker or VPN, check your internet connection, and try again. If the problem persists, try a different browser.";

// Load the Razorpay checkout script exactly once (deduped across mounts/clicks).
// Resolves true when window.Razorpay is available, false on load failure or timeout.
// On failure the cached promise AND the dead <script> tag are cleared, so a later
// click retries from scratch rather than listening to an element whose error
// event has already fired.
let razorpayScriptPromise = null;

export const loadRazorpayScript = () => {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    let settled = false;
    let timeoutId = null;

    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (timeoutId) clearTimeout(timeoutId);

      const ready = ok && typeof window !== 'undefined' && !!window.Razorpay;
      if (!ready) {
        razorpayScriptPromise = null; // allow a retry on next attempt
        // Drop the failed tag. Leaving it behind would make the next attempt
        // attach listeners to an already-errored script that never fires again.
        document.querySelectorAll(`script[src="${RAZORPAY_SRC}"]`).forEach((el) => el.remove());
      }
      resolve(ready);
    };

    timeoutId = setTimeout(() => finish(false), RAZORPAY_LOAD_TIMEOUT_MS);

    const script = document.createElement('script');
    script.src = RAZORPAY_SRC;
    script.async = true;
    script.onload = () => finish(true);
    script.onerror = () => finish(false);
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
};

/**
 * Ensure window.Razorpay exists, retrying the load if an earlier preload failed.
 * @returns {Promise<boolean>} true when the checkout popup can be opened.
 */
export const ensureRazorpayReady = async () => {
  if (typeof window !== 'undefined' && window.Razorpay) return true;
  await loadRazorpayScript();
  return typeof window !== 'undefined' && !!window.Razorpay;
};
