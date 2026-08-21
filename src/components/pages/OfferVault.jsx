import { Link } from 'react-router-dom';
import { HiRefresh } from 'react-icons/hi';
import PortalHeader from '../portal/PortalHeader';
import OfferCard from '../portal/OfferCard';
import ConsultCallBanner from '../portal/ConsultCallBanner';
import { useOffers } from '../../contexts/OffersContext';
import { useAuth } from '../../contexts/AuthContext';

export default function OfferVault() {
  const { user } = useAuth();
  const { offers, settings, loading, loaded, error, refresh } = useOffers();

  // Consult-kind rows are deliberately not rendered here any more: the 1:1 call
  // is sold by <ConsultCallBanner />, which owns its own price and checkout.
  // Filtering rather than trusting the row to be deactivated keeps a leftover
  // (or re-enabled) consult offer from putting a second, free call CTA on the
  // page next to the paid one.
  // A locked course card is an advert — that is why locked offers are shown at
  // all. A locked order bump is not: the bumps are only ever sold alongside a
  // checkout, so there is nothing for a member to click. Showing them a
  // permanent, unbuyable "Locked" card is just noise, so resources appear only
  // once they are owned.
  const productOffers = offers.filter(
    (o) => o.kind !== 'consult' && !(o.kind === 'resource' && !o.unlocked)
  );
  const unlockedCount = productOffers.filter((o) => o.unlocked).length;

  if (loading && !loaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <PortalHeader />
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="mb-10 sm:mb-12">
          <p className="text-sm text-gray-500 mb-2">
            Signed in as <span className="text-gray-300">{user?.email}</span>
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent mb-4">
            {settings.vault_heading || 'Your Offer Vault'}
          </h1>
          {settings.vault_subheading && (
            <p className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed">
              {settings.vault_subheading}
            </p>
          )}
          {productOffers.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              {unlockedCount} of {productOffers.length} programs unlocked
            </p>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-4 flex-wrap">
            <span className="text-red-400">
              We couldn&apos;t load your vault. Your access is safe — please retry.
            </span>
            <div className="flex items-center gap-2">
              {/* The vault is how members reach their programs, so give them a
                  direct way in while it's broken. */}
              <Link
                to="/course"
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-gray-200 text-sm font-medium"
              >
                Open Outbound Mastery
              </Link>
              <button
                onClick={refresh}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 transition-colors text-red-200 text-sm font-medium"
              >
                <HiRefresh className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {productOffers.length === 0 && !error ? (
          <div className="text-center py-20 border border-gray-800 rounded-2xl bg-[#111111]">
            <p className="text-gray-400">No offers are published yet. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 mb-10">
            {productOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}

        <ConsultCallBanner />
      </main>
    </div>
  );
}
