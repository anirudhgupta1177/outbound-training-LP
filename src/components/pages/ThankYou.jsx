import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiMail, HiAcademicCap } from 'react-icons/hi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ThankYou() {
  const navigate = useNavigate();
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user came from a valid payment
    const paymentSession = sessionStorage.getItem('payment_completed');

    if (paymentSession) {
      // Valid payment session exists
      setIsValidSession(true);

      // Read payment details (may be absent for legacy sessions — fall back gracefully)
      let payment = {};
      try {
        payment = JSON.parse(sessionStorage.getItem('payment_details') || '{}');
      } catch (_) {}
      const currency = payment.currency || 'INR';
      const value = typeof payment.value === 'number' ? payment.value : 0;
      const conversionId = payment.payment_id;

      // Clear the session so page can't be accessed again by direct URL
      sessionStorage.removeItem('payment_completed');
      sessionStorage.removeItem('payment_details');

      // Fire Meta Pixel + Reddit Pixel Purchase event
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', { currency, value, ...(conversionId && { eventID: conversionId }) });
      }
      if (typeof window.rdt === 'function') {
        window.rdt('track', 'Purchase', {
          currency,
          itemCount: 1,
          value,
          ...(conversionId && { conversionId }),
        });
      }

      // Fire GA4 course_purchase with the full, dynamic pricing/coupon breakdown
      // captured at click time on the checkout page. All monetary values are
      // integers. `value` = revenue (price after discount, before GST);
      // `final_amount_paid` = total charged (incl. GST). Works for any coupon.
      if (typeof window.gtag === 'function') {
        const basePrice = typeof payment.base_price === 'number' ? payment.base_price : 0;
        const priceAfterDiscount = typeof payment.price_after_discount === 'number'
          ? payment.price_after_discount
          : value;
        const couponCode = payment.coupon_code || 'none';
        const isDefaultCoupon = payment.is_default_coupon === true;

        // Categorize coupon for cleaner reporting
        let couponType = 'none';
        if (couponCode !== 'none') {
          couponType = isDefaultCoupon ? 'default_auto_applied' : 'user_applied';
        }

        window.gtag('event', 'course_purchase', {
          event_category: 'conversion',
          event_label: 'course_purchase_completed',

          // Primary revenue metric (price after discount, before GST)
          value: priceAfterDiscount,
          currency,

          // Dynamic coupon details — works for any coupon
          coupon_code: couponCode,
          coupon_type: couponType,
          discount_percent: typeof payment.discount_percent === 'number' ? payment.discount_percent : 0,
          discount_amount: typeof payment.discount_amount === 'number' ? payment.discount_amount : 0,

          // Full pricing breakdown
          base_price: basePrice,
          gst_amount: typeof payment.gst_amount === 'number' ? payment.gst_amount : 0,
          final_amount_paid: typeof payment.final_amount === 'number' ? payment.final_amount : value,

          // Transaction identifiers
          offer_type: 'course',
          transaction_id: conversionId || `course_${Date.now()}`,
          order_id: payment.order_id || '',
          source_domain: window.location.hostname,
        });
      } else {
        console.warn('gtag not loaded — course_purchase event skipped');
      }
    } else {
      // No valid payment session - redirect to home
      navigate('/', { replace: true });
    }
    setIsLoading(false);
  }, [navigate]);

  // Show loading while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render if session is invalid (will redirect)
  if (!isValidSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="glass-card rounded-xl md:rounded-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6 flex justify-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-success/20 flex items-center justify-center">
              <HiCheckCircle className="w-12 h-12 md:w-16 md:h-16 text-success" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-display font-bold text-white mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-text-secondary text-lg md:text-xl mb-8"
          >
            Thank you for your purchase. You now have access to the Complete AI-Powered Outbound System.
          </motion.p>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-dark-secondary rounded-lg p-6 mb-8 text-left"
          >
            <h2 className="text-xl font-display font-bold text-white mb-4">
              What Happens Next?
            </h2>
            <ul className="space-y-3 text-text-secondary">
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">1.</span>
                <span>You'll receive an email with your login credentials and access link within the next few minutes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">2.</span>
                <span>Check your inbox (and spam folder) for an email.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">3.</span>
                <span>Join the private WhatsApp community to get instant support from 1,132+ members.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gold text-xl mt-0.5">4.</span>
                <span>Start with Module 1 to define your ICP and build your offer.</span>
              </li>
            </ul>
          </motion.div>

          {/* DFY High-Ticket Upsell */}
          <motion.a
            href="https://dfy.intentledsales.com"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="group block relative overflow-hidden rounded-2xl p-[1.5px] mb-8 text-left bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-[length:200%_100%] hover:bg-[position:100%_0] transition-[background-position] duration-500"
          >
            <div className="relative rounded-2xl bg-[#0b0b0f] p-6 sm:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-amber-400/5 pointer-events-none" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-2">
                  Want it done for you?
                </p>
                <h3 className="font-display text-2xl sm:text-[26px] leading-tight font-extrabold text-white mb-3">
                  Want me and my team to{' '}
                  <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                    build and run
                  </span>{' '}
                  this entire outbound channel for you?
                </h3>
                <p className="text-text-secondary text-[15px] leading-relaxed mb-5">
                  You just unlocked the complete system. If you'd rather skip the build, my team
                  and I will set it all up, run it end-to-end, and book qualified meetings straight
                  onto your calendar — fully done for you.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-amber-400 text-black font-display font-bold text-base shadow-lg shadow-cyan-400/25 group-hover:shadow-cyan-400/45 transition-shadow whitespace-nowrap">
                    Book a call with me
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                  <span className="flex items-center gap-2 text-[12px] text-amber-300/90">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Application only · Limited build slots
                  </span>
                </div>
              </div>
            </div>
          </motion.a>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="mb-8 p-4 bg-gold/10 border border-gold/30 rounded-lg"
          >
            <p className="text-text-secondary mb-2">
              Have questions or need help?
            </p>
            <a
              href="mailto:anirudh@intentledsales.com"
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors"
            >
              <HiMail className="w-5 h-5" />
              <span>anirudh@intentledsales.com</span>
            </a>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="https://chat.whatsapp.com/FLdWkFfBRVOIiQgPSqdO62"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white font-display font-bold rounded-xl px-8 py-4 text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <FaWhatsapp className="w-6 h-6" />
              <span>Join WhatsApp Community</span>
            </a>
            <button
              onClick={() => navigate('/login')}
              className="btn-gold text-dark font-display font-bold rounded-xl px-8 py-4 text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <HiAcademicCap className="w-5 h-5" />
              <span>Go to Course</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

