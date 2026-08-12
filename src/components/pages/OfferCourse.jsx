import { HiExternalLink } from 'react-icons/hi';
import PortalHeader from '../portal/PortalHeader';
import PhaseCard from '../portal/PhaseCard';
import VideoPlayer from '../course/VideoPlayer';
import { ResourceTile, ToolCard } from '../portal/OfferResources';
import { getAccent } from '../portal/offerAccents';
import { useOffers, OFFER_SLUGS } from '../../contexts/OffersContext';

function StatTile({ value, label, accent, children }) {
  return (
    <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-2">
        <span className={accent}>{children}</span>
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

// Overview for any part-based program in the vault. Mirrors the Outbound
// Mastery course page so members see one structure across every product.
export default function OfferCourse({ slug }) {
  const { getOffer, settings } = useOffers();
  const offer = getOffer(slug);

  const theme = getAccent(offer?.accent);
  const partNoun = offer?.part_noun || 'Part';
  const basePath = offer?.portal_path || '';
  const parts = offer?.parts || [];

  // Resources left unassigned to a part belong to the program as a whole.
  const resources = offer?.resources || [];
  const tools = resources.filter((r) => r.type === 'tool');
  const materials = resources.filter((r) => r.type !== 'tool');
  const bookingUrl = getOffer(OFFER_SLUGS.expertCall)?.cta_url || settings.booking_url;

  const totalTools = parts.reduce(
    (sum, p) => sum + (p.resources || []).filter((r) => r.type === 'tool').length,
    tools.length
  );
  const totalResources = parts.reduce(
    (sum, p) => sum + (p.resources || []).filter((r) => r.type !== 'tool').length,
    materials.length
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader backTo="/portal" backLabel="Back to Vault" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {offer?.badge && (
              <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wider ${theme.badge}`}>
                {offer.badge}
              </span>
            )}
            {offer?.duration_label && (
              <span className="px-2.5 py-1 rounded-full bg-gray-800/70 text-gray-300 text-[11px] font-medium">
                {offer.duration_label}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            {offer?.title || 'Program'}
          </h1>
          {offer?.subtitle && (
            <p className={`text-lg font-medium mb-4 ${theme.label}`}>{offer.subtitle}</p>
          )}
          {offer?.description && (
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-3xl">
              {offer.description}
            </p>
          )}
        </div>

        {/* Stats — same shape as the Outbound Mastery overview. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatTile value={parts.length} label={`${partNoun}s`} accent={theme.bullet}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </StatTile>
          <StatTile value={totalTools} label="Tools" accent="text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </StatTile>
          <StatTile value={totalResources} label="Resources" accent="text-cyan-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </StatTile>
        </div>

        {offer?.highlights?.length > 0 && (
          <section className="bg-[#111111] border border-gray-800 rounded-xl p-6 sm:p-7 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">What you&apos;ll walk away with</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {offer.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme.bullet}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Part cards — the equivalent of Mastery's module list. */}
        {parts.length > 0 ? (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-white">Course {partNoun}s</h2>
            <div className="grid gap-6">
              {parts.map((part, index) => (
                <PhaseCard
                  key={part.id}
                  part={part}
                  index={index}
                  basePath={basePath}
                  accent={offer?.accent}
                  partNoun={partNoun}
                />
              ))}
            </div>
          </div>
        ) : (
          offer?.primary_video_url && (
            // Fallback for a program with no parts: show its single main video.
            <section className="bg-[#111111] border border-gray-800 rounded-xl p-4 sm:p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                {offer.primary_video_title || 'The Full Session'}
              </h2>
              <VideoPlayer loomUrl={offer.primary_video_url} title={offer.primary_video_title} />
            </section>
          )
        )}

        {tools.length > 0 && (
          <section className="rounded-xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.06] to-transparent p-5 sm:p-7 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Tools used in this training</h2>
            <p className="text-base text-gray-300 mb-6">
              Set these up as you follow along — open each one and get your account ready.
            </p>
            <div className="grid gap-4">
              {tools.map((resource, index) => (
                <ToolCard key={resource.id} resource={resource} index={index} />
              ))}
            </div>
          </section>
        )}

        {materials.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Resources</h2>
            <div className="grid gap-3">
              {materials.map((resource) => (
                <ResourceTile key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {parts.length === 0 && materials.length === 0 && tools.length === 0 && (
          <section className="mb-8 p-6 rounded-xl border border-gray-800 bg-[#111111] text-center">
            <p className="text-gray-400">Content for this program is being added shortly.</p>
          </section>
        )}

        {bookingUrl && (
          <section className="rounded-xl border border-purple-500/25 bg-gradient-to-br from-[#15101f] to-[#111111] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white mb-1.5">Want this reviewed live?</h2>
              <p className="text-sm text-gray-400">
                Book a 1-on-1 with an expert and get your campaign pulled apart and rebuilt.
              </p>
            </div>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:from-purple-400 hover:to-indigo-400 transition-all"
            >
              Book Your Call
              <HiExternalLink className="w-4 h-4" />
            </a>
          </section>
        )}
      </main>
    </div>
  );
}
