export default function VideoPlayer({ loomUrl, title }) {
  if (!loomUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Video not available</p>
      </div>
    );
  }

  // Add Loom parameters to hide branding, title, and user info
  const getCleanLoomUrl = (url) => {
    const cleanParams = [
      'hide_title=true',
      'hideEmbedTopBar=true',
      'hide_owner=true',
      'hide_share=true',
      'hideEmbedCaptions=true'
    ].join('&');
    
    // Check if URL already has query parameters
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${cleanParams}`;
  };

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-[#000] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        <iframe
          src={getCleanLoomUrl(loomUrl)}
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: 0 }}
          title={title || 'Loom video player'}
        />
      </div>
    </div>
  );
}

