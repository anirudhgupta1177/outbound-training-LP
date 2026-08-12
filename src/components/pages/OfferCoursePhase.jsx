import { Link, useParams, Navigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiExternalLink } from 'react-icons/hi';
import PortalHeader from '../portal/PortalHeader';
import VideoPlayer from '../course/VideoPlayer';
import { ResourceTile, ToolCard } from '../portal/OfferResources';
import { getAccent } from '../portal/offerAccents';
import { stripPartPrefix } from '../portal/partLabel';
import { useOffers, OFFER_SLUGS } from '../../contexts/OffersContext';

// A single part of a program — the counterpart of a Mastery lesson page.
export default function OfferCoursePhase({ slug }) {
  const { partId } = useParams();
  const { getOffer, settings } = useOffers();
  const offer = getOffer(slug);

  const theme = getAccent(offer?.accent);
  const partNoun = offer?.part_noun || 'Part';
  const basePath = offer?.portal_path || '';
  const parts = offer?.parts || [];
  const index = parts.findIndex((p) => p.id === partId);
  const part = index >= 0 ? parts[index] : null;

  // Unknown or removed part: fall back to the overview rather than a blank page.
  if (parts.length > 0 && !part) {
    return <Navigate to={basePath || '/portal'} replace />;
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-[#0a0a0a]">
        <PortalHeader backTo="/portal" backLabel="Back to Vault" />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-gray-400 mb-6">This {partNoun.toLowerCase()} isn&apos;t available.</p>
          <Link to={basePath || '/portal'} className={`hover:underline ${theme.label}`}>
            ← Back to the overview
          </Link>
        </main>
      </div>
    );
  }

  const resources = part.resources || [];
  const tools = resources.filter((r) => r.type === 'tool');
  const materials = resources.filter((r) => r.type !== 'tool');
  const prev = index > 0 ? parts[index - 1] : null;
  const next = index < parts.length - 1 ? parts[index + 1] : null;
  const bookingUrl = getOffer(OFFER_SLUGS.expertCall)?.cta_url || settings.booking_url;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader backTo="/portal" backLabel="Back to Vault" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          to={basePath}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
        >
          <HiArrowLeft className="w-4 h-4" />
          All {partNoun.toLowerCase()}s
        </Link>

        <div className="mb-6">
          <p className={`text-sm font-semibold mb-2 ${theme.label}`}>
            {partNoun} {index + 1} of {parts.length}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            {stripPartPrefix(part.title)}
          </h1>
          {part.subtitle && <p className="text-base text-gray-300 mb-2">{part.subtitle}</p>}
          {part.description && (
            <p className="text-base text-gray-400 leading-relaxed">{part.description}</p>
          )}
        </div>

        <section className="mb-8">
          {part.video_url ? (
            <VideoPlayer loomUrl={part.video_url} title={part.title} />
          ) : (
            <div className="w-full aspect-video rounded-xl border border-gray-800 bg-gray-900 flex items-center justify-center">
              <p className="text-sm text-gray-500">Video coming soon</p>
            </div>
          )}
        </section>

        {tools.length > 0 && (
          <section className="rounded-xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.06] to-transparent p-5 sm:p-7 mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Tools you need for this {partNoun.toLowerCase()}
            </h2>
            <p className="text-base text-gray-300 mb-6">
              Open each one and get your account ready before you follow along.
            </p>
            <div className="grid gap-4">
              {tools.map((resource, toolIndex) => (
                <ToolCard key={resource.id} resource={resource} index={toolIndex} />
              ))}
            </div>
          </section>
        )}

        {materials.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Resources for this {partNoun.toLowerCase()}
            </h2>
            <div className="grid gap-3">
              {materials.map((resource) => (
                <ResourceTile key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {/* Prev / next, mirroring the Mastery lesson navigation. */}
        <nav className="flex items-stretch gap-3 sm:gap-4 pt-6 border-t border-gray-800">
          {prev ? (
            <Link
              to={`${basePath}/${prev.id}`}
              className="flex-1 min-w-0 flex items-center gap-3 p-4 rounded-xl border border-gray-800 bg-[#111111] hover:border-gray-700 transition-all group"
            >
              <HiArrowLeft className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-xs text-gray-500">Previous</span>
                <span className="block text-sm font-medium text-white truncate">
                  {partNoun} {index}: {stripPartPrefix(prev.title)}
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next ? (
            <Link
              to={`${basePath}/${next.id}`}
              className="flex-1 min-w-0 flex items-center justify-end gap-3 p-4 rounded-xl border border-gray-800 bg-[#111111] hover:border-gray-700 transition-all group text-right"
            >
              <span className="min-w-0">
                <span className="block text-xs text-gray-500">Next</span>
                <span className="block text-sm font-medium text-white truncate">
                  {partNoun} {index + 2}: {stripPartPrefix(next.title)}
                </span>
              </span>
              <HiArrowRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
            </Link>
          ) : (
            bookingUrl && (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-0 flex items-center justify-end gap-3 p-4 rounded-xl border border-purple-500/25 bg-gradient-to-br from-[#15101f] to-[#111111] hover:border-purple-500/50 transition-all text-right"
              >
                <span className="min-w-0">
                  <span className="block text-xs text-gray-500">Finished the training?</span>
                  <span className="block text-sm font-medium text-white truncate">
                    Book a call with an expert
                  </span>
                </span>
                <HiExternalLink className="w-5 h-5 text-purple-400 flex-shrink-0" />
              </a>
            )
          )}
        </nav>
      </main>
    </div>
  );
}
