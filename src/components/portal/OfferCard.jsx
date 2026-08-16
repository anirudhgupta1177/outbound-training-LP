import { Link } from 'react-router-dom';
import { HiLockClosed, HiCheckCircle, HiArrowRight, HiExternalLink } from 'react-icons/hi';
import { getAccent } from './offerAccents';

export default function OfferCard({ offer }) {
  const accent = getAccent(offer.accent);
  const unlocked = offer.unlocked;
  const hasInternalDestination = unlocked && offer.portal_path;
  const lockedUrl = offer.landing_page_url;

  return (
    <div
      data-testid={`offer-card-${offer.slug}`}
      data-unlocked={unlocked ? 'true' : 'false'}
      className={`relative flex flex-col h-full rounded-2xl border bg-[#111111] p-6 sm:p-7 transition-all duration-300 ${
        unlocked
          ? `border-gray-800 ${accent.ring} hover:-translate-y-1`
          : 'border-gray-800/70 hover:border-gray-700'
      }`}
    >
      {unlocked && (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-2xl bg-gradient-to-b ${accent.glow} to-transparent`}
        />
      )}

      <div className="relative flex items-start justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {offer.badge && (
            <span
              className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider ${accent.badge}`}
            >
              {offer.badge}
            </span>
          )}
          {offer.duration_label && (
            <span className="px-2.5 py-1 rounded-full bg-gray-800/70 text-gray-300 text-[11px] font-medium">
              {offer.duration_label}
            </span>
          )}
        </div>

        {unlocked ? (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 flex-shrink-0">
            <HiCheckCircle className="w-4 h-4" />
            Unlocked
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 flex-shrink-0">
            <HiLockClosed className="w-4 h-4" />
            Locked
          </span>
        )}
      </div>

      <div className="relative flex-1">
        <h3 className={`text-xl sm:text-2xl font-bold mb-1.5 ${unlocked ? 'text-white' : 'text-gray-300'}`}>
          {offer.title}
        </h3>
        {offer.subtitle && (
          <p className={`text-sm font-medium mb-3 ${accent.label}`}>{offer.subtitle}</p>
        )}
        {offer.description && (
          <p className="text-sm text-gray-400 leading-relaxed mb-5">{offer.description}</p>
        )}

        {offer.highlights.length > 0 && (
          <ul className="space-y-2 mb-6">
            {offer.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-gray-300">
                <svg
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${accent.bullet}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative mt-auto pt-2">
        {hasInternalDestination ? (
          <Link
            to={offer.portal_path}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${accent.button}`}
          >
            {offer.cta_label || 'Open'}
            <HiArrowRight className="w-4 h-4" />
          </Link>
        ) : unlocked ? (
          <div className="w-full text-center px-5 py-3 rounded-xl bg-gray-800/60 text-gray-400 text-sm font-medium">
            Content coming soon
          </div>
        ) : lockedUrl ? (
          <a
            href={lockedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${accent.button}`}
          >
            {offer.locked_cta_label || 'Get Access'}
            <HiExternalLink className="w-4 h-4" />
          </a>
        ) : (
          // Only reachable if an offer has no landing_page_url — say "Locked"
          // rather than "Opening soon", which implied the program did not exist
          // yet when in fact it just had nowhere to send the buyer.
          <button
            type="button"
            disabled
            title="This offer isn't open for enrolment yet"
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-800/60 text-gray-500 font-semibold cursor-not-allowed"
          >
            <HiLockClosed className="w-4 h-4" />
            Locked
          </button>
        )}
      </div>
    </div>
  );
}
