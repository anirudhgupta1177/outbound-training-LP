import { Link } from 'react-router-dom';
import { HiCalendar, HiExternalLink, HiRefresh } from 'react-icons/hi';
import PortalHeader from '../portal/PortalHeader';
import OfferCard from '../portal/OfferCard';
import { getAccent } from '../portal/offerAccents';
import { useOffers } from '../../contexts/OffersContext';
import { useAuth } from '../../contexts/AuthContext';

function ExpertCallBanner({ offer }) {
  const accent = getAccent(offer.accent);
  const bookingUrl = offer.cta_url;

  return (
    <div
      data-testid="offer-card-expert-call"
      className="relative overflow-hidden rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#15101f] via-[#111111] to-[#111111] p-6 sm:p-8"
    >
      <div className="absolute -top-24 -right-16 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
          <HiCalendar className="w-7 h-7 text-purple-300" />
        </div>

        <div className="flex-1 min-w-0">
          {offer.badge && (
            <span className={`inline-block mb-2 px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider ${accent.badge}`}>
              {offer.badge}
            </span>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">{offer.title}</h2>
          {offer.subtitle && (
            <p className="text-sm font-medium text-purple-300 mb-2">{offer.subtitle}</p>
          )}
          {offer.description && (
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{offer.description}</p>
          )}

          {offer.highlights.length > 0 && (
            <ul className="mt-4 grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {offer.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-shrink-0 w-full lg:w-auto">
          {bookingUrl ? (
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full lg:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold transition-all ${accent.button}`}
            >
              {offer.cta_label || 'Book Your Call'}
              <HiExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Booking link not configured yet"
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gray-800/60 text-gray-500 font-semibold cursor-not-allowed"
            >
              Booking opens soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OfferVault() {
  const { user } = useAuth();
  const { offers, settings, loading, loaded, error, refresh } = useOffers();

  const productOffers = offers.filter((o) => o.kind !== 'consult');
  const consultOffers = offers.filter((o) => o.kind === 'consult');
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

        {consultOffers.map((offer) => (
          <ExpertCallBanner key={offer.id} offer={offer} />
        ))}
      </main>
    </div>
  );
}
