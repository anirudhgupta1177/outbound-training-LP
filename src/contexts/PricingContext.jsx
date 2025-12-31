import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { detectCountry } from '../services/geolocation';
import { getPricingByCountry } from '../constants/pricing';

const PricingContext = createContext(null);

export const PricingProvider = ({ children }) => {
  // Initialize with India pricing immediately so components can render
  const [country, setCountry] = useState('IN'); // Default to India
  const [pricing, setPricing] = useState(getPricingByCountry('IN')); // Start with India pricing
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountry = async () => {
      setIsLoading(true);
      setError(null);
      
      // Check for test country override in URL (e.g., ?country=US or ?country=IN)
      const urlParams = new URLSearchParams(window.location.search);
      const testCountry = urlParams.get('country')?.toUpperCase();
      
      // Check for test country in localStorage (for manual testing)
      const storedTestCountry = localStorage.getItem('testCountry');
      
      if (testCountry && (testCountry === 'IN' || testCountry === 'US')) {
        // URL parameter override (for testing)
        console.log('🌍 TEST MODE: Using country from URL parameter:', testCountry);
        sessionStorage.removeItem('detectedCountry');
        const pricingConfig = getPricingByCountry(testCountry);
        setCountry(testCountry);
        setPricing(pricingConfig);
        setIsLoading(false);
        return;
      } else if (storedTestCountry && (storedTestCountry === 'IN' || storedTestCountry === 'US')) {
        // localStorage override (for manual testing)
        console.log('🌍 TEST MODE: Using country from localStorage:', storedTestCountry);
        const pricingConfig = getPricingByCountry(storedTestCountry);
        setCountry(storedTestCountry);
        setPricing(pricingConfig);
        setIsLoading(false);
        return;
      }
      
      try {
        const detectedCountry = await detectCountry();
        console.log('🌍 Detected country:', detectedCountry);
        const pricingConfig = getPricingByCountry(detectedCountry);
        console.log('💰 Pricing:', {
          currency: pricingConfig.currency,
          price: pricingConfig.displayPrice,
          originalPrice: pricingConfig.displayOriginalPrice,
          gst: detectedCountry === 'IN' ? '18%' : 'None'
        });
        
        setCountry(detectedCountry);
        setPricing(pricingConfig);
      } catch (err) {
        console.error('❌ Error detecting country:', err);
        setError(err);
        // Default to India on error
        setCountry('IN');
        setPricing(getPricingByCountry('IN'));
        console.log('🔄 Defaulted to India pricing due to error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountry();
    
    // Watch for URL changes (for testing with ?country=US)
    const handlePopState = () => {
      fetchCountry();
    };
    window.addEventListener('popstate', handlePopState);
    
    // Also check URL on any navigation (for React Router)
    const checkUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const testCountry = urlParams.get('country');
      if (testCountry && (testCountry === 'IN' || testCountry === 'US')) {
        fetchCountry();
      }
    };
    
    // Check URL every second (for testing purposes)
    const interval = setInterval(checkUrl, 1000);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearInterval(interval);
    };
  }, []);

  // Use useMemo to ensure value object reference changes when pricing changes
  // This forces React components to re-render when pricing updates
  const value = useMemo(() => ({
    country,
    pricing,
    isLoading,
    error,
    isIndia: country === 'IN',
  }), [country, pricing, isLoading, error]);

  // Debug logging when pricing changes
  useEffect(() => {
    console.log('💰 PricingContext updated - Currency:', pricing.currency, 'Price:', pricing.displayPrice, 'Country:', country);
  }, [pricing, country]);

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within PricingProvider');
  }
  return context;
};

