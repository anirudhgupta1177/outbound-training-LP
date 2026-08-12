import { Link } from 'react-router-dom';
import { getAccent } from './offerAccents';
import { stripPartPrefix } from './partLabel';

// Mirrors ModuleCard from Outbound Mastery so every program in the vault reads
// the same way: numbered heading, what's inside, then one call to action.
export default function PhaseCard({ part, index, basePath, accent, partNoun = 'Part' }) {
  const theme = getAccent(accent);
  const resources = part.resources || [];
  const tools = resources.filter((r) => r.type === 'tool');
  const materials = resources.filter((r) => r.type !== 'tool');
  const preview = [...tools, ...materials];

  return (
    <div className="border border-gray-800 rounded-xl bg-[#111111] hover:border-gray-700 transition-all group">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-white mb-2">
              {partNoun} {index + 1}: {stripPartPrefix(part.title)}
            </h3>
            {part.subtitle && <p className={`text-sm mb-2 ${theme.label}`}>{part.subtitle}</p>}
            {part.description && <p className="text-sm text-gray-400">{part.description}</p>}
          </div>
          {!part.video_url && (
            <span className="flex-shrink-0 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
              No video
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          {part.video_url && (
            <span className="flex items-center gap-1.5">
              <svg className={`w-4 h-4 ${theme.bullet}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              1 video
            </span>
          )}
          {tools.length > 0 && (
            <span>
              {tools.length} tool{tools.length === 1 ? '' : 's'}
            </span>
          )}
          {materials.length > 0 && (
            <span>
              {materials.length} resource{materials.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {preview.length > 0 && (
          <div className="space-y-2 mb-4">
            {preview.slice(0, 3).map((resource) => (
              <div key={resource.id} className="flex items-center space-x-2 text-sm text-gray-300">
                <span className="flex-shrink-0">
                  {resource.type === 'tool' ? (
                    <span className="text-[10px] uppercase tracking-wide bg-emerald-400/10 text-emerald-300 px-2 py-0.5 rounded">
                      Tool
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                      {resource.type}
                    </span>
                  )}
                </span>
                <span className="flex-1 truncate">{resource.title}</span>
              </div>
            ))}
            {preview.length > 3 && (
              <div className="text-sm text-gray-500 pt-1">+{preview.length - 3} more</div>
            )}
          </div>
        )}

        <Link
          to={`${basePath}/${part.id}`}
          className={`inline-block px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${theme.button}`}
        >
          Start {partNoun} {index + 1}
        </Link>
      </div>
    </div>
  );
}
