import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { detectCountry } from '../services/geolocation';
import { getPricingByCountry } from '../constants/pricing';

const PricingContext = createContext(null);

export const PricingProvider = ({ children }) => {
  const [country, setCountry] = useState('IN'); // Default to India
  const [pricing, setPricing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountry = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const detectedCountry = await detectCountry();
        setCountry(detectedCountry);
        setPricing(getPricingByCountry(detectedCountry));
      } catch (err) {
        console.error('Error detecting country:', err);
        setError(err);
        // Default to India on error
        setCountry('IN');
        setPricing(getPricingByCountry('IN'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountry();
  }, []);

  const value = {
    country,
    pricing,
    isLoading,
    error,
    isIndia: country === 'IN',
  };

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

