import { useCallback, useEffect, useRef, useState } from 'react';
import {
  HiCalendar,
  HiExternalLink,
  HiLockClosed,
  HiCheckCircle,
  HiRefresh,
  HiChevronDown,
} from 'react-icons/hi';
import { usePricing } from '../../contexts/PricingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOffers } from '../../contexts/OffersContext';
import { supabase } from '../../lib/supabase';
import { ensureRazorpayReady, RAZORPAY_UNAVAILABLE_MESSAGE } from '../../lib/razorpay';
import { formatPrice } from '../../constants/pricing';
import { INDIAN_STATES } from '../../constants/indianStates';
import { CONSULT_ANCHOR_ID } from './consultCallLink';
import {
  CONSULT_BOOKING_URL,
  CONSULT_PRODUCT,
  CONSULT_SLUG,
  CONSULT_TITLE,
} from '../../constants/consultCall';

// What the session actually includes. Lifted verbatim from the OTO page's
// checkout so a member is promised exactly the same thing here as they are in
// the funnel — one session, one set of deliverables, one description of it.
const INCLUDES = [
  'A focused 60-minute working session with me, one to one, on Zoom',
  'A full audit of where you actually are — what you have tried, what is built, what is missing',
  'A diagnosis of what will work and what will waste your time or budget',
  'A specific, sequenced roadmap you can start executing the same day',
  'Lifetime access to the recording of the call',
];

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const FULFILMENT_FAILED = (paymentId) =>
  `Your payment went through (${paymentId}) but we couldn't unlock booking automatically. Email support@intentledsales.com with that payment ID and we'll sort it immediately.`;

/**
 * The paid 1:1 consultation upsell in the Offer Vault.
 *
 * Three states, decided by the member's `consultation-call` entitlement and by
 * whether the vault could be read at all:
 *   - vault unreadable -> retry, never a pay button (selling here would charge
 *     a member twice for a session they already own)
 *   - not bought       -> Razorpay popup at the server's price
 *   - bought           -> the booking calendar the funnel's OTO page uses
 *
 * The price is fetched rather than computed: /api/consult-quote and
 * /api/create-order resolve the region the same way, so the figure on the
 * button is the figure on the card.
 */
export default function ConsultCallBanner() {
  const { user } = useAuth();
  const { entitlements, consult, settings, refresh, error: vaultError, loaded } = useOffers();
  const { country } = usePricing();

  const [quote, setQuote] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  // Set the moment the server confirms the payment, so the booking link appears
  // immediately instead of waiting on the vault refetch.
  const [justPurchased, setJustPurchased] = useState(false);
  const [rebuying, setRebuying] = useState(false);
  const [gstOpen, setGstOpen] = useState(false);
  const [gst, setGst] = useState({ gstin: '', businessName: '', stateCode: '' });
  const [gstError, setGstError] = useState(null);
  const rootRef = useRef(null);

  const purchased = justPurchased || entitlements.includes(CONSULT_SLUG);
  const bookingUrl = settings.booking_url || CONSULT_BOOKING_URL;
  const sessionsPurchased = consult?.sessions_purchased || 0;

  // When the vault failed to load, `entitlements` is empty because we never got
  // an answer — not because this member hasn't bought. Selling into that state
  // would charge someone a second time for a call they already own and hide the
  // booking link they paid for, so the banner asks them to retry instead.
  const accessUnknown = (vaultError || !loaded) && !justPurchased && !purchased;

  // Course pages link here as /portal#consultation-call. React Router won't
  // scroll to a hash on a client-side navigation, and the banner isn't in the
  // DOM until the vault has loaded, so it brings itself into view once mounted.
  useEffect(() => {
    if (window.location.hash !== `#${CONSULT_ANCHOR_ID}`) return;
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // The browser's own country is passed as a hint only; outside production the
  // server ignores it and trusts Vercel's edge header instead.
  useEffect(() => {
    let cancelled = false;
    const url = country ? `/api/consult-quote?country=${encodeURIComponent(country)}` : '/api/consult-quote';
    fetch(url, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.currency) setQuote(data);
      })
      .catch((err) => console.warn('Consultation quote unavailable:', err));
    return () => {
      cancelled = true;
    };
  }, [country]);

  const isIndia = quote?.currency === 'INR';
  const totalLabel = quote ? formatPrice(quote.total, quote.currency) : null;
  const baseLabel = quote ? formatPrice(quote.basePrice, quote.currency) : null;

  const validateGst = useCallback(() => {
    if (!gstOpen || !isIndia) return true;
    const value = gst.gstin.trim().toUpperCase();
    if (!value) return true; // opened but left blank: just skip the GST details
    if (!GSTIN_REGEX.test(value)) {
      setGstError('Please enter a valid 15-character GSTIN, or clear it to continue without one.');
      return false;
    }
    setGstError(null);
    return true;
  }, [gstOpen, isIndia, gst.gstin]);

  const startPurchase = async () => {
    setError(null);

    // Never open a checkout against a price we haven't been quoted.
    if (!quote) return;
    if (!validateGst()) return;

    setSubmitting(true);

    if (!(await ensureRazorpayReady())) {
      setSubmitting(false);
      setRebuying(false);
      setError(RAZORPAY_UNAVAILABLE_MESSAGE);
      return;
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_name: CONSULT_TITLE,
        value: quote.total,
        currency: quote.currency,
      });
    }

    try {
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: CONSULT_PRODUCT,
          country,
          // Receipt must be max 40 chars.
          receipt: `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error('Consult order creation failed:', orderData);
        setError(
          orderData?.razorpay_error?.error?.description ||
            orderData?.error ||
            "We couldn't start the payment. Please try again."
        );
        setSubmitting(false);
        setRebuying(false);
        return;
      }

      const metadata = user?.user_metadata || {};
      const prefillName = [metadata.first_name, metadata.last_name].filter(Boolean).join(' ').trim();
      const gstin = isIndia && gstOpen ? gst.gstin.trim().toUpperCase() : '';
      const stateRow = INDIAN_STATES.find((s) => s.code === gst.stateCode);

      const razorpay = new window.Razorpay({
        key: orderData.key_id,
        order_id: orderData.order_id,
        name: 'IntentLedSales',
        description: CONSULT_TITLE,
        prefill: {
          name: prefillName || undefined,
          email: user?.email || undefined,
          contact: metadata.phone || undefined,
        },
        handler: async (response) => {
          try {
            const { data } = await supabase.auth.getSession();
            const accessToken = data?.session?.access_token;

            const claimResponse = await fetch('/api/consult-purchase', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                gstin: gstin || null,
                business_name: gstin ? gst.businessName.trim() || null : null,
                business_state: gstin ? stateRow?.name || null : null,
                business_state_code: gstin ? stateRow?.code || null : null,
              }),
            });

            const claimData = await claimResponse.json();

            if (!claimResponse.ok) {
              // The money is taken. Say so plainly and give them a way out
              // rather than a bare error — support can grant access manually.
              console.error('Failed to record consultation purchase:', claimData);
              setError(FULFILMENT_FAILED(response.razorpay_payment_id));
              setSubmitting(false);
              setRebuying(false);
              return;
            }

            if (typeof window.fbq === 'function') {
              window.fbq('track', 'Purchase', {
                content_name: CONSULT_TITLE,
                value: quote.total,
                currency: quote.currency,
              });
            }

            setJustPurchased(true);
            setSubmitting(false);
            setRebuying(false);
            setGstOpen(false);
            refresh(); // picks up the entitlement and the new session count
          } catch (err) {
            console.error('Error confirming consultation purchase:', err);
            setError(FULFILMENT_FAILED(response.razorpay_payment_id));
            setSubmitting(false);
            setRebuying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setRebuying(false);
          },
        },
        theme: { color: '#a855f7' },
      });

      razorpay.open();
    } catch (err) {
      console.error('Consultation payment flow error:', err);
      setError('Something went wrong starting the payment. Please try again.');
      setSubmitting(false);
      setRebuying(false);
    }
  };

  const gstField = (label, value, onChange, placeholder, extra = {}) => (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-gray-800 text-sm text-white placeholder-gray-600 focus:border-purple-500/60 focus:outline-none"
        {...extra}
      />
    </label>
  );

  return (
    <div
      id={CONSULT_ANCHOR_ID}
      ref={rootRef}
      data-testid="consult-call-banner"
      className="relative scroll-mt-24 overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#15101f] via-[#111111] to-[#111111] p-6 sm:p-8"
    >
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <HiCalendar className="w-7 h-7 text-purple-300" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="inline-block mb-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider bg-purple-400/10 text-purple-300 border-purple-400/30">
            {purchased ? 'BOOKING UNLOCKED' : '1:1 WITH ANIRUDH'}
          </span>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{CONSULT_TITLE}</h2>
          <p className="text-sm font-medium text-purple-300 mb-2">
            A focused 60-minute working session — together on Zoom
          </p>
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            {purchased
              ? "Your session is paid for. Pick a time that suits you and come with your setup open — we'll spend the hour on your business, not on theory."
              : "I'll personally go through your business, what you've built so far, what's working and what isn't — and hand you a prioritised action plan for implementing the system, step by step."}
          </p>

          <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-gray-300">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Optional invoice details. Indian buyers only — a GSTIN is what lets
              a business claim the 18% back, and it changes nothing about the
              amount charged. */}
          {!accessUnknown && !purchased && isIndia && (
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setGstOpen((open) => !open)}
                aria-expanded={gstOpen}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <HiChevronDown className={`w-4 h-4 transition-transform ${gstOpen ? 'rotate-180' : ''}`} />
                Buying as a business? Add GST details to your invoice
              </button>

              {gstOpen && (
                <div className="mt-3 grid sm:grid-cols-3 gap-3 max-w-2xl">
                  {gstField('GSTIN', gst.gstin, (v) => setGst({ ...gst, gstin: v.toUpperCase() }), '22AAAAA0000A1Z5', {
                    maxLength: 15,
                    autoComplete: 'off',
                  })}
                  {gstField('Business name', gst.businessName, (v) => setGst({ ...gst, businessName: v }), 'Acme Pvt Ltd')}
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">
                      State
                    </span>
                    <select
                      value={gst.stateCode}
                      onChange={(e) => setGst({ ...gst, stateCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0a0a0a] border border-gray-800 text-sm text-white focus:border-purple-500/60 focus:outline-none"
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  {gstError && (
                    <p role="alert" className="sm:col-span-3 text-xs text-red-300">
                      {gstError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 w-full lg:w-64 lg:text-right">
          {accessUnknown ? (
            <>
              <p className="text-sm text-gray-400 mb-3">
                We couldn&apos;t check whether you already have this session.
              </p>
              <button
                type="button"
                onClick={refresh}
                className="w-full flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all border border-gray-700 text-gray-200 hover:border-gray-600 hover:text-white"
              >
                <HiRefresh className="w-4 h-4" />
                Retry
              </button>
              <p className="mt-2.5 text-[11px] text-gray-500">
                If you have already paid, retrying will bring your booking link back.
              </p>
            </>
          ) : purchased ? (
            <>
              <p className="flex items-center gap-2 lg:justify-end text-sm text-emerald-300 mb-3">
                <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
                {sessionsPurchased > 1
                  ? `${sessionsPurchased} sessions paid for`
                  : 'Session paid for'}
              </p>
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400"
              >
                Book Your Call
                <HiExternalLink className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setRebuying(true);
                  startPurchase();
                }}
                disabled={submitting || !quote}
                className="mt-3 w-full text-xs text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-60"
              >
                {rebuying && submitting ? 'Opening checkout…' : 'Need another session? Buy again'}
              </button>
            </>
          ) : (
            <>
              {quote ? (
                <div className="mb-4">
                  <p className="text-3xl font-bold text-white leading-none">{totalLabel}</p>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {quote.gstAmount > 0
                      ? `${baseLabel} + 18% GST · one-time`
                      : 'One-time · no subscription'}
                  </p>
                </div>
              ) : (
                <div className="mb-4 h-[52px] flex lg:justify-end items-start" aria-hidden="true">
                  <div className="h-8 w-28 rounded-lg bg-gray-800 animate-pulse" />
                </div>
              )}

              <button
                type="button"
                onClick={startPurchase}
                disabled={submitting || !quote}
                className="w-full flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  'Opening checkout…'
                ) : (
                  <>
                    <HiLockClosed className="w-4 h-4" />
                    Book My 1:1 Call
                  </>
                )}
              </button>
              <p className="mt-2.5 text-[11px] text-gray-500">
                Secure payment via Razorpay · You pick your slot right after
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
