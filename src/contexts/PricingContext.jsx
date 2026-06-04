import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { detectCountry } from '../services/geolocation';
import {
  buildPricing,
  getPricingByCountry,
  tierForCountry,
  FALLBACK_TIERS,
} from '../constants/pricing';

const PricingContext = createContext(null);

const resolveCountryOverride = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fromUrl = urlParams.get('country')?.toUpperCase();
  if (fromUrl && (fromUrl === 'IN' || fromUrl === 'US')) return { source: 'url', country: fromUrl };

  const fromStorage = localStorage.getItem('testCountry');
  if (fromStorage && (fromStorage === 'IN' || fromStorage === 'US')) {
    return { source: 'localStorage', country: fromStorage };
  }
  return null;
};

// Detect country but never let a hung geolocation request block the price
// reveal forever. Resolves to null on timeout so we fall back to default.
const detectCountryWithTimeout = (ms = 2500) =>
  Promise.race([
    detectCountry(),
    new Promise((resolve) => setTimeout(() => resolve(null), ms)),
  ]);

const fetchTiersFromApi = async () => {
  try {
    const res = await fetch('/api/pricing', { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.tiers) return null;
    return data.tiers;
  } catch (err) {
    console.warn('Failed to fetch /api/pricing, falling back to static defaults:', err);
    return null;
  }
};

const pricingFromTiers = (country, tiers) => {
  if (!tiers) return getPricingByCountry(country); // static fallback path
  const key = tierForCountry(country);
  const row = tiers[key] || FALLBACK_TIERS[key];
  return buildPricing(row);
};

export const PricingProvider = ({ children }) => {
  const [country, setCountry] = useState('IN');
  const [tiers, setTiers] = useState(null); // null => use FALLBACK_TIERS
  const [pricing, setPricing] = useState(getPricingByCountry('IN'));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      setIsLoading(true);
      setError(null);

      // Fire DB fetch and country detection in parallel.
      const tiersPromise = fetchTiersFromApi();
      const override = resolveCountryOverride();

      let resolvedCountry = 'IN';
      if (override) {
        console.log(`🌍 TEST MODE (${override.source}): country =`, override.country);
        if (override.source === 'url') {
          sessionStorage.removeItem('detectedCountry');
          localStorage.removeItem('detectedCountry');
        }
        resolvedCountry = override.country;
      } else {
        try {
          const detected = await detectCountryWithTimeout();
          if (detected) resolvedCountry = detected;
        } catch (err) {
          console.error('❌ Country detection failed, defaulting to IN:', err);
          if (!cancelled) setError(err);
        }
      }

      const fetchedTiers = await tiersPromise;
      if (cancelled) return;

      const nextPricing = pricingFromTiers(resolvedCountry, fetchedTiers);
      console.log('💰 Pricing resolved:', {
        country: resolvedCountry,
        tier: nextPricing.tier,
        currency: nextPricing.currency,
        price: nextPricing.displayPrice,
        source: fetchedTiers ? 'db' : 'fallback',
      });

      setCountry(resolvedCountry);
      setTiers(fetchedTiers);
      setPricing(nextPricing);
      setIsLoading(false);
    };

    resolve();

    // Re-resolve when the URL changes (lets ?country=US testing work after navigation).
    const handlePopState = () => resolve();
    window.addEventListener('popstate', handlePopState);
    return () => {
      cancelled = true;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const value = useMemo(() => ({
    country,
    pricing,
    isLoading,
    // True once the canonical (DB/geo-resolved) price is known. Components should
    // gate price *display* on this so the fallback number is never shown.
    priceReady: !isLoading,
    error,
    isIndia: country === 'IN',
    tier: pricing.tier,
  }), [country, pricing, isLoading, error]);

  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricing = () => {
  const context = useContext(PricingContext);
  if (!context) throw new Error('usePricing must be used within PricingProvider');
  return context;
};
