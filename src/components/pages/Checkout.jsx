import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiCheck, HiX, HiShieldCheck, HiSparkles } from 'react-icons/hi';
import { getCartItems } from '../../constants/cartItems';
import { validateCoupon, DEFAULT_COUPON } from '../../constants/coupons';
import { usePricing } from '../../contexts/PricingContext';
import { formatPrice } from '../../constants/pricing';
import skoolWinImage from '../../assets/testimonials/skool-win.png';

export default function Checkout() {
  const navigate = useNavigate();
  const { pricing, isIndia, isLoading: pricingLoading } = usePricing();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [showCouponPopup, setShowCouponPopup] = useState(false);

  // Wait for pricing to load
  if (pricingLoading || !pricing) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Get cart items with correct currency
  const cartItems = getCartItems(pricing.currency);

  // Calculate pricing with coupon discount
  const basePrice = pricing.basePrice;
  const discountPercent = appliedCoupon?.discount || 0;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const discountedPrice = basePrice - discountAmount;
  
  // Calculate GST on discounted price (only for India)
  const gstAmount = isIndia ? Math.round(discountedPrice * pricing.gstRate) : 0;
  const totalAmount = discountedPrice + gstAmount;

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          setRazorpayLoaded(true);
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  // Auto-apply default coupon on page load
  useEffect(() => {
    if (!appliedCoupon && DEFAULT_COUPON) {
      const result = validateCoupon(DEFAULT_COUPON);
      if (result.valid) {
        setCouponCode(DEFAULT_COUPON);
        setAppliedCoupon(result);
        // Show popup after a short delay for better UX
        setTimeout(() => {
          setShowCouponPopup(true);
        }, 500);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCouponChange = (e) => {
    const value = e.target.value.toUpperCase();
    setCouponCode(value);
    // Clear error when user starts typing
    if (couponError) {
      setCouponError('');
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('');
      return;
    }

    const result = validateCoupon(couponCode);
    
    if (result.valid) {
      setAppliedCoupon(result);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCouponKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!razorpayLoaded || !window.Razorpay) {
      alert('Payment gateway is loading. Please try again in a moment.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Convert amount to smallest currency unit (paise for INR, cents for USD)
      const amountInSmallestUnit = pricing.currency === 'INR' 
        ? totalAmount * 100  // INR: paise
        : Math.round(totalAmount * 100); // USD: cents

      // Step 2: Create Razorpay order with auto-capture
      console.log('Creating Razorpay order...', {
        amount: amountInSmallestUnit,
        currency: pricing.currency,
        coupon: appliedCoupon?.code
      });

      let orderResponse;
      try {
        orderResponse = await fetch('/api/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amountInSmallestUnit,
            currency: pricing.currency,
            couponCode: appliedCoupon?.code || null,
            // Receipt must be max 40 chars - use timestamp + random suffix
            receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
          })
        });
      } catch (fetchError) {
        console.error('Network error creating order:', fetchError);
        alert('Network error. Please check your connection and try again.');
        setIsSubmitting(false);
        return;
      }

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error('Failed to create order:', orderData);
        const errorMsg = orderData?.razorpay_error?.error?.description 
          || orderData?.razorpay_error?.message 
          || orderData?.error 
          || 'Failed to create payment order. Please try again.';
        alert(`Payment Error: ${errorMsg}`);
        setIsSubmitting(false);
        return;
      }

      console.log('Order created successfully:', orderData.order_id);

      // Step 3: Build description with correct currency
      const gstText = isIndia && gstAmount > 0 ? ` + ${formatPrice(gstAmount, pricing.currency)} GST` : '';
      const baseDescription = `Complete AI-Powered Outbound System (${formatPrice(discountedPrice, pricing.currency)}${gstText})`;
      const couponText = appliedCoupon ? ` - Coupon: ${appliedCoupon.code} (${appliedCoupon.discount}% off)` : '';

      // Step 4: Open Razorpay checkout with order_id (auto-capture enabled)
      const options = {
        key: orderData.key_id, // Use key_id from order response
        order_id: orderData.order_id, // Use order_id instead of amount/currency
        name: 'The Organic Buzz',
        description: baseDescription + couponText,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
        },
        handler: async (response) => {
          // Call serverless function to create contact in Systeme.io
          try {
            const enrollResponse = await fetch('/api/create-contact', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: amountInSmallestUnit, // Amount in smallest currency unit
                currency: pricing.currency,
                customer_email: formData.email,
                customer_first_name: formData.firstName,
                customer_last_name: formData.lastName,
              })
            });

            const enrollData = await enrollResponse.json();

            if (!enrollResponse.ok) {
              console.error('Failed to create contact:', enrollData);
              // Still redirect to thank you page even if enrollment fails
              // The user has paid, so we'll handle enrollment separately if needed
            }
          } catch (error) {
            console.error('Error creating contact:', error);
            // Still redirect to thank you page even if API call fails
          }

          // Set payment session flag so ThankYou page knows it's a valid visit
          sessionStorage.setItem('payment_completed', 'true');
          
          // Redirect to thank you page on success
          navigate('/thank-you');
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          }
        },
        theme: {
          color: '#FFD700'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error in payment flow:', error);
      alert('Error initiating payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-text-secondary">Fill in your details to proceed with payment</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl md:rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-6">
                Customer Information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-2">
                      First Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-dark-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white ${
                        errors.firstName ? 'border-error' : 'border-white/20'
                      }`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-error">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-2">
                      Last Name <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-dark-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white ${
                        errors.lastName ? 'border-error' : 'border-white/20'
                      }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-error">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-dark-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white ${
                      errors.email ? 'border-error' : 'border-white/20'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-gold text-dark font-display font-bold rounded-xl px-8 py-4 text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
                </button>
              </form>
            </motion.div>

            {/* Trust Elements Section - Below Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 space-y-4"
            >
              {/* Row 1: Guarantee + Social Proof */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* 30-Day Money Back Guarantee */}
                <div className="glass-card rounded-xl p-5 bg-gradient-to-r from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <HiShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold">30-Day Money Back Guarantee</p>
                      <p className="text-emerald-300/60 text-sm mt-1">
                        Not satisfied? Get a full refund.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="glass-card rounded-xl p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-dark flex items-center justify-center text-sm font-bold text-white">A</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-500 border-2 border-dark flex items-center justify-center text-sm font-bold text-white">S</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 border-2 border-dark flex items-center justify-center text-sm font-bold text-white">R</div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-dark flex items-center justify-center text-sm font-bold text-white">+</div>
                    </div>
                    <div>
                      <p className="text-white font-bold">Join 1,132+ Students</p>
                      <p className="text-text-muted text-sm mt-1">Already mastering AI-powered outbound</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Student Success Story */}
              <div className="glass-card rounded-xl p-4 overflow-hidden">
                <p className="text-text-secondary text-sm mb-3 flex items-center gap-2">
                  <span className="text-gold">★</span> Student Success Story from our Community
                </p>
                <img 
                  src={skoolWinImage} 
                  alt="Student success: Just hit $4,500 in two weeks using outbound automation strategies"
                  className="w-full rounded-lg border border-white/10"
                />
              </div>

              {/* Row 3: Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card rounded-xl p-4 text-center">
                  <span className="text-2xl mb-2 block">🔒</span>
                  <p className="text-white font-semibold text-sm">Secure Payment</p>
                  <p className="text-text-muted text-xs mt-1">256-bit SSL</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <span className="text-2xl mb-2 block">⚡</span>
                  <p className="text-white font-semibold text-sm">Instant Access</p>
                  <p className="text-text-muted text-xs mt-1">Start learning now</p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="text-white font-semibold text-sm">Lifetime Access</p>
                  <p className="text-text-muted text-xs mt-1">All future updates</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl md:rounded-2xl p-6 md:p-8 sticky top-8"
            >
              <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-6">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="space-y-3 md:space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HiCheck className="w-3 h-3 text-success" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-text-secondary text-sm">{item.name}</p>
                      <p className="text-text-muted text-xs line-through mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent my-4 md:my-6" />

              {/* Coupon Code Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div>
                    <label htmlFor="couponCode" className="block text-sm font-medium text-text-secondary mb-2">
                      Coupon Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="couponCode"
                        value={couponCode}
                        onChange={handleCouponChange}
                        onKeyPress={handleCouponKeyPress}
                        placeholder="Enter coupon code"
                        className="flex-1 px-4 py-2 bg-dark-secondary border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold text-white placeholder:text-text-muted"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-gold text-dark font-display font-bold rounded-lg hover:bg-gold-light transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-error text-xs mt-2">{couponError}</p>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-success text-sm font-medium">
                          Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p className="text-text-secondary text-xs mt-0.5">
                          {appliedCoupon.discount}% discount applied
                        </p>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="p-1 text-text-secondary hover:text-white transition-colors"
                        aria-label="Remove coupon"
                      >
                        <HiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gold to-transparent my-4 md:my-6" />

              {/* Price Summary */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Original Price:</span>
                  <span className="text-text-muted text-sm line-through">{pricing.displayOriginalPrice}</span>
                </div>
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Base Price:</span>
                    <span className="text-text-secondary text-sm">{formatPrice(basePrice, pricing.currency)}</span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Discount ({appliedCoupon.discount}%):</span>
                        <span className="text-success text-sm">-{formatPrice(discountAmount, pricing.currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Price after discount:</span>
                        <span className="text-text-secondary text-sm">{formatPrice(discountedPrice, pricing.currency)}</span>
                      </div>
                    </>
                  )}
                  {isIndia && gstAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">GST (18%):</span>
                      <span className="text-text-secondary text-sm">{formatPrice(gstAmount, pricing.currency)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-white font-medium">Total:</span>
                  <div className="text-right">
                    <p className="text-2xl md:text-3xl font-display font-bold gradient-text">
                      {formatPrice(totalAmount, pricing.currency)}
                    </p>
                    <p className="text-text-muted text-xs">
                      {isIndia && gstAmount > 0 ? '(Including GST)' : ''}
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      {/* Coupon Applied Popup */}
      <AnimatePresence>
        {showCouponPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCouponPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-dark-secondary to-dark border border-gold/30 rounded-2xl p-6 md:p-8 max-w-md w-full text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                <HiSparkles className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-2">
                Lucky You! 🎉
              </h3>
              <p className="text-text-secondary mb-4">
                A special <span className="text-gold font-bold">5% discount</span> has been applied to your order!
              </p>
              <div className="bg-dark/50 border border-gold/20 rounded-lg p-3 mb-6">
                <p className="text-text-muted text-sm">Coupon Code</p>
                <p className="text-gold text-xl font-bold font-mono">{DEFAULT_COUPON}</p>
              </div>
              <button
                onClick={() => setShowCouponPopup(false)}
                className="w-full btn-gold text-dark font-display font-bold rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105"
              >
                Continue to Checkout
              </button>
              <p className="text-text-muted text-xs mt-4">
                Have a different coupon? You can change it in the order summary.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

