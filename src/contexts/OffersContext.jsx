import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { fetchOffers, emptyOffersState, OFFER_SLUGS } from '../services/offersService';

const OffersContext = createContext(null);

export const useOffers = () => {
  const context = useContext(OffersContext);
  if (!context) {
    throw new Error('useOffers must be used within an OffersProvider');
  }
  return context;
};

export function OffersProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(emptyOffersState);
  // Starts true: before the first fetch resolves we can't tell "locked" from
  // "not loaded yet", and defaulting to not-loading would flash the locked
  // screen at members who actually have access.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Distinguishes "not loaded yet" from "loaded and genuinely empty".
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setState(emptyOffersState);
      setLoaded(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await fetchOffers();
      setState(data);
      setLoaded(true);
    } catch (err) {
      console.error('Error loading offers:', err);
      setError(err.message);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const getOffer = (slug) => state.offers.find((o) => o.slug === slug) || null;

    // If the vault itself failed to load we can't prove entitlement either way.
    // Falling back to "unlocked" for Outbound Mastery keeps the 300+ members who
    // already paid for it out of a lockout caused by a transient API failure;
    // newer offers stay closed until we can actually verify access.
    const isUnlocked = (slug) => {
      const offer = getOffer(slug);
      if (offer) return !!offer.unlocked;
      if (error && slug === OFFER_SLUGS.mastery) return true;
      return false;
    };

    return {
      offers: state.offers,
      entitlements: state.entitlements,
      consult: state.consult,
      settings: state.settings,
      loading,
      loaded,
      error,
      refresh: load,
      getOffer,
      isUnlocked,
    };
  }, [state, loading, loaded, error, load]);

  return <OffersContext.Provider value={value}>{children}</OffersContext.Provider>;
}

export { OFFER_SLUGS };
