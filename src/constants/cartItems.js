// Value in INR - will be converted dynamically based on currency
export const cartItemsINR = [
  { name: '30+ hours of video training', valueINR: 15000 },
  { name: '78-page Outbound guide', valueINR: 3000 },
  { name: 'All automation workflow maps', valueINR: 5000 },
  { name: '500K verified lead database', valueINR: 15000 },
  { name: 'Private community access', valueINR: 2000 },
  { name: 'Bonus: Complete system setup guide', valueINR: 4000 },
];

/**
 * Get cart items with currency-specific values
 * @param {string} currency - Currency code (INR or USD)
 * @returns {Array} Cart items with formatted values
 */
export const getCartItems = (currency) => {
  const conversionRate = 83; // 1 USD = 83 INR (approximate)
  
  return cartItemsINR.map(item => ({
    name: item.name,
    value: currency === 'INR' 
      ? `₹${item.valueINR.toLocaleString('en-IN')}`
      : `$${Math.round(item.valueINR / conversionRate).toLocaleString('en-US')}`
  }));
};

// Deprecated - use getCartItems() instead
export const cartItems = cartItemsINR.map(item => ({ 
  name: item.name, 
  value: `₹${item.valueINR.toLocaleString('en-IN')}` 
}));

// Deprecated - use pricing context instead
export const packagePrice = 3497;
export const originalPrice = 43999;

