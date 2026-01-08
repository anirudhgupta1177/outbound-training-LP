export default function ResourceLinks({ lesson }) {
  const hasResources =
    lesson.whimsicalLinks?.length ||
    lesson.driveLinks?.length ||
    lesson.resources?.length;

  if (!hasResources) {
    return null;
  }

  const renderLink = (url, title, type, index) => {
    const isWhimsical = url.includes('whimsical.com');
    const isDrive = url.includes('drive.google.com');
    const isDoc = url.includes('docs.google.com');
    const isNotion = url.includes('notion.site');

    let icon = (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
    );
    let displayTitle = title;

    if (isWhimsical) {
      icon = (
        <svg
          className="w-5 h-5 text-purple-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      );
      displayTitle = displayTitle || 'View Diagram';
    } else if (isDrive) {
      icon = (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
      displayTitle = displayTitle || 'Open Drive Folder';
    } else if (isDoc) {
      icon = (
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
      displayTitle = displayTitle || 'Open Document';
    } else if (isNotion) {
      icon = (
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      );
      displayTitle = displayTitle || 'Open in Notion';
    }

    return (
      <a
        key={`${type}-${index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 p-4 border border-gray-800 rounded-xl bg-[#111111] hover:bg-gray-800/50 hover:border-gray-700 transition-all group"
      >
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
            {displayTitle}
          </p>
          <p className="text-xs text-gray-500 truncate">{url}</p>
        </div>
        <svg
          className="w-4 h-4 text-gray-500 group-hover:text-blue-400 flex-shrink-0 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Resources</h3>
      <div className="space-y-2">
        {lesson.whimsicalLinks?.map((url, index) =>
          renderLink(url, `Whimsical Diagram ${index + 1}`, 'whimsical', index)
        )}
        {lesson.driveLinks?.map((url, index) =>
          renderLink(
            url,
            url.includes('docs.google.com')
              ? 'Google Document'
              : 'Google Drive',
            url.includes('docs.google.com') ? 'doc' : 'drive',
            index
          )
        )}
        {lesson.resources?.map((resource, index) =>
          renderLink(resource.url, resource.title, resource.type, index)
        )}
      </div>
    </div>
  );
}

