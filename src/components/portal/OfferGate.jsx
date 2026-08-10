import { Link } from 'react-router-dom';
import { HiLockClosed, HiArrowLeft, HiExternalLink } from 'react-icons/hi';
import PortalHeader from './PortalHeader';
import { useOffers } from '../../contexts/OffersContext';

// Wraps an offer's portal experience. Renders its children only once we've
// confirmed the signed-in member is entitled to that offer.
export default function OfferGate({ slug, children }) {
  const { getOffer, isUnlocked, loaded, loading } = useOffers();

  if (!loaded && loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  if (isUnlocked(slug)) {
    return children;
  }

  const offer = getOffer(slug);
  const landingUrl = offer?.landing_page_url;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader backTo="/portal" backLabel="Back to Vault" />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gray-800/70 border border-gray-700 flex items-center justify-center">
          <HiLockClosed className="w-8 h-8 text-gray-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {offer?.title ? `${offer.title} is locked` : 'This program is locked'}
        </h1>
        <p className="text-gray-400 leading-relaxed mb-8">
          {offer?.description ||
            "You don't have access to this program yet. Unlock it to start straight away."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {landingUrl ? (
            <a
              href={landingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-500 text-black font-semibold hover:from-cyan-300 hover:to-emerald-400 transition-all"
            >
              {offer?.locked_cta_label || 'Get Access'}
              <HiExternalLink className="w-4 h-4" />
            </a>
          ) : null}

          <Link
            to="/portal"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:text-white hover:border-gray-600 transition-colors"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to Vault
          </Link>
        </div>
      </main>
    </div>
  );
}
