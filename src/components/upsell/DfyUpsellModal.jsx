import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DFY_UPSELL_URL } from '../../constants/upsell';

/**
 * High-ticket DFY (done-for-you) upsell - center modal.
 * Positioning: "Want me and my team to build and run this entire outbound
 * channel for you? Book a call with me..." -> dfy.intentledsales.com
 *
 * Props:
 *   open    {boolean}   whether the modal is visible
 *   onClose {function}  called when the user dismisses (backdrop / Esc / Maybe later / CTA)
 */
export default function DfyUpsellModal({ open, onClose }) {
  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleCtaClick = () => {
    // Mark intent so we don't keep nagging the same session, then let the
    // anchor open the DFY landing page in a new tab.
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dfy-upsell-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal card (gradient border) */}
          <motion.div
            className="relative w-full max-w-lg rounded-2xl p-[1.5px] bg-gradient-to-br from-cyan-400 via-amber-400 to-cyan-400 bg-[length:200%_200%] shadow-2xl shadow-cyan-400/20"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="relative rounded-2xl bg-[#0b0b0f] overflow-hidden">
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-amber-400/10 blur-3xl" />

              {/* Close button */}
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative p-7 sm:p-9">
                {/* Founder row */}
                <div className="flex items-center gap-3 mb-5">
                  <img
                    src="/ani.jpg"
                    alt="Anirudh"
                    className="w-11 h-11 rounded-full object-cover border border-cyan-400/40"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
                      A personal invitation
                    </p>
                    <p className="text-sm text-gray-400">from Anirudh &amp; team</p>
                  </div>
                </div>

                {/* Headline */}
                <h2
                  id="dfy-upsell-title"
                  className="font-display text-2xl sm:text-[28px] leading-tight font-extrabold text-white mb-3"
                >
                  Want me and my team to{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                    build and run
                  </span>{' '}
                  this entire outbound channel for you?
                </h2>

                {/* Body */}
                <p className="text-gray-300 text-[15px] leading-relaxed mb-5">
                  You've got the full system. But if you'd rather skip the build entirely,
                  my team and I will install your outbound machine, run it end-to-end, and
                  book qualified meetings straight onto your calendar.
                </p>

                {/* Value bullets */}
                <ul className="space-y-2.5 mb-6">
                  {[
                    'Done-for-you setup + ongoing management',
                    'We run the exact system taught in this course',
                    'Book a call directly with me to see if you’re a fit',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[14px] text-gray-200">
                      <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Scarcity strip */}
                <div className="flex items-center gap-2 mb-6 text-[12px] text-amber-300/90">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Application only · Limited build slots each month
                </div>

                {/* CTAs */}
                <a
                  href={DFY_UPSELL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleCtaClick}
                  className="group flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-400 text-black font-display font-bold text-base shadow-lg shadow-cyan-400/25 hover:shadow-cyan-400/45 hover:scale-[1.015] transition-all duration-300"
                >
                  Book a call with me
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>

                <button
                  onClick={onClose}
                  className="block w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
