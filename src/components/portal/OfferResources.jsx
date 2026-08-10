import { HiExternalLink, HiTemplate, HiFolder, HiLink, HiSparkles, HiDocumentText } from 'react-icons/hi';

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

export function ResourceTile({ resource }) {
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
export function ToolCard({ resource, index }) {
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
