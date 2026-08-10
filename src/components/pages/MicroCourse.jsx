import { useState } from 'react';
import { HiExternalLink, HiTemplate, HiFolder, HiLink, HiSparkles, HiDocumentText, HiChevronDown } from 'react-icons/hi';
import PortalHeader from '../portal/PortalHeader';
import VideoPlayer from '../course/VideoPlayer';
import { useOffers, OFFER_SLUGS } from '../../contexts/OffersContext';

const RESOURCE_ICONS = {
  whimsical: HiTemplate,
  drive: HiFolder,
  doc: HiDocumentText,
  notion: HiDocumentText,
  file: HiDocumentText,
  video: HiSparkles,
  tool: HiSparkles,
  link: HiLink,
};

// Strips the scheme so the link reads as a clean, quotable address.
const displayUrl = (url) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

function ResourceTile({ resource }) {
  const Icon = RESOURCE_ICONS[resource.type] || HiLink;

  // min-w-0 on the card: as a grid item it defaults to min-width:auto, which
  // lets a long URL push the card past the viewport instead of truncating.
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 p-4 sm:p-5 min-w-0 rounded-xl border border-gray-800 bg-[#111111] hover:border-amber-400/40 hover:bg-amber-400/5 transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-amber-400/10 text-amber-400">
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white transition-colors">{resource.title}</p>
        {resource.description && (
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{resource.description}</p>
        )}
        <p className="text-xs text-gray-600 mt-1.5 truncate">{resource.url}</p>
      </div>

      <HiExternalLink className="flex-shrink-0 w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors mt-1" />
    </a>
  );
}

// Tools sit right under the video and are deliberately loud: members are meant
// to open and sign up for these while the session is still playing.
function ToolCard({ resource, index }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 min-w-0 rounded-2xl border-2 border-emerald-400/25 bg-emerald-400/[0.04] hover:border-emerald-400/70 hover:bg-emerald-400/10 transition-all"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-lg font-bold">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-lg sm:text-xl font-bold text-white mb-1">{resource.title}</p>
        {resource.description && (
          <p className="text-sm text-gray-400 mb-2.5 leading-relaxed">{resource.description}</p>
        )}
        <p className="text-base sm:text-lg font-semibold text-emerald-400 group-hover:text-emerald-300 break-all leading-snug">
          {displayUrl(resource.url)}
        </p>
      </div>

      <span className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-400 text-black font-bold text-base group-hover:bg-emerald-300 transition-colors">
        Open
        <HiExternalLink className="w-5 h-5" />
      </span>
    </a>
  );
}

// One phase of the marathon: its own video, its own tool stack, its own files.
function PhaseSection({ part, index, expanded, onToggle }) {
  const panelId = `phase-panel-${part.id}`;
  const resources = part.resources || [];
  const tools = resources.filter((r) => r.type === 'tool');
  const materials = resources.filter((r) => r.type !== 'tool');

  return (
    <section className="rounded-2xl border border-gray-800 bg-[#111111] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-gray-800/30 transition-colors"
      >
        <span className="flex-shrink-0 w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 text-lg font-bold">
          {index + 1}
        </span>

        <span className="flex-1 min-w-0">
          <span className="block text-base sm:text-lg font-bold text-white">{part.title}</span>
          {part.subtitle && (
            <span className="block text-sm text-gray-400 mt-0.5">{part.subtitle}</span>
          )}
        </span>

        <HiChevronDown
          className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div id={panelId} className="px-5 sm:px-6 pb-6 space-y-6">
          {part.description && (
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{part.description}</p>
          )}

          {part.video_url ? (
            <VideoPlayer loomUrl={part.video_url} title={part.title} />
          ) : (
            <div className="w-full aspect-video rounded-xl border border-gray-800 bg-gray-900 flex items-center justify-center">
              <p className="text-sm text-gray-500">Video coming soon</p>
            </div>
          )}

          {tools.length > 0 && (
            <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.06] to-transparent p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                Tools you need for this phase
              </h3>
              <p className="text-sm text-gray-300 mb-5">
                Open each one and get your account ready before you follow along.
              </p>
              <div className="grid gap-4">
                {tools.map((resource, toolIndex) => (
                  <ToolCard key={resource.id} resource={resource} index={toolIndex} />
                ))}
              </div>
            </div>
          )}

          {materials.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">
                Resources for this phase
              </h3>
              <div className="grid gap-3">
                {materials.map((resource) => (
                  <ResourceTile key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default function MicroCourse() {
  const { getOffer, settings } = useOffers();
  const offer = getOffer(OFFER_SLUGS.microCourse);

  const parts = offer?.parts || [];
  // Resources left unassigned to a phase still belong to the offer as a whole.
  const resources = offer?.resources || [];
  const tools = resources.filter((r) => r.type === 'tool');
  const materials = resources.filter((r) => r.type !== 'tool');
  const bookingUrl = getOffer(OFFER_SLUGS.expertCall)?.cta_url || settings.booking_url;

  // Phase 1 opens on arrival; the rest stay collapsed so the page is scannable.
  // Null means "untouched", so the default survives parts arriving asynchronously
  // without needing an effect to seed it.
  const [expandedOverride, setExpandedOverride] = useState(null);
  const [showFullRecording, setShowFullRecording] = useState(false);

  const expanded =
    expandedOverride ?? (parts.length > 0 ? new Set([parts[0].id]) : new Set());

  const togglePart = (partId) => {
    const next = new Set(expanded);
    if (next.has(partId)) next.delete(partId);
    else next.add(partId);
    setExpandedOverride(next);
  };

  const allExpanded = parts.length > 0 && expanded.size === parts.length;
  const nothingToShow = parts.length === 0 && materials.length === 0 && tools.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <PortalHeader backTo="/portal" backLabel="Back to Vault" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {offer?.badge && (
              <span className="px-2.5 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 text-[11px] font-semibold tracking-wider">
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
            {offer?.title || 'Outbound Micro-Course'}
          </h1>
          {offer?.subtitle && (
            <p className="text-lg font-medium text-amber-400 mb-4">{offer.subtitle}</p>
          )}
          {offer?.description && (
            <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-3xl">
              {offer.description}
            </p>
          )}
        </div>

        {parts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Work through it in {parts.length} phases
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Each phase has its own video and the exact tools you need for it.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setExpandedOverride(allExpanded ? new Set() : new Set(parts.map((p) => p.id)))
                }
                className="text-sm text-gray-400 hover:text-white transition-colors whitespace-nowrap"
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </button>
            </div>

            <div className="grid gap-4">
              {parts.map((part, index) => (
                <PhaseSection
                  key={part.id}
                  part={part}
                  index={index}
                  expanded={expanded.has(part.id)}
                  onToggle={() => togglePart(part.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* The uncut recording, behind a toggle so it doesn't compete with the
            phase breakdown above. */}
        {offer?.primary_video_url && (
          <section className="rounded-2xl border border-gray-800 bg-[#111111] overflow-hidden mb-8">
            <button
              type="button"
              onClick={() => setShowFullRecording((value) => !value)}
              aria-expanded={showFullRecording}
              aria-controls="full-session-panel"
              className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-gray-800/30 transition-colors"
            >
              <span className="min-w-0">
                <span className="block text-base sm:text-lg font-bold text-white">
                  {offer.primary_video_title || 'The Full Session'}
                </span>
                <span className="block text-sm text-gray-400 mt-0.5">
                  Prefer it in one sitting? Watch the complete, unsplit recording.
                </span>
              </span>
              <HiChevronDown
                className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform ${
                  showFullRecording ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showFullRecording && (
              <div id="full-session-panel" className="px-5 sm:px-6 pb-6">
                <VideoPlayer
                  loomUrl={offer.primary_video_url}
                  title={offer.primary_video_title}
                />
              </div>
            )}
          </section>
        )}

        {offer?.highlights?.length > 0 && (
          <section className="bg-[#111111] border border-gray-800 rounded-2xl p-6 sm:p-7 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">What you&apos;ll walk away with</h2>
            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {offer.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tools.length > 0 && (
          <section className="rounded-2xl border border-emerald-400/20 bg-gradient-to-b from-emerald-400/[0.06] to-transparent p-5 sm:p-7 mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Tools used in this training
            </h2>
            <p className="text-base text-gray-300 mb-6">
              Set these up as you follow along — open each one and get your account ready before the
              next step.
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
            <h2 className="text-xl font-bold text-white mb-1">Resources</h2>
            <p className="text-sm text-gray-400 mb-4">
              Everything referenced in the session, ready to open.
            </p>
            <div className="grid gap-3">
              {materials.map((resource) => (
                <ResourceTile key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        {nothingToShow && (
          <section className="mb-8 p-6 rounded-2xl border border-gray-800 bg-[#111111] text-center">
            <p className="text-gray-400">Content for this session is being added shortly.</p>
          </section>
        )}

        {bookingUrl && (
          <section className="rounded-2xl border border-purple-500/25 bg-gradient-to-br from-[#15101f] to-[#111111] p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
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
