export default function VideoPlayer({ loomUrl, title }) {
  if (!loomUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Video not available</p>
      </div>
    );
  }

  // Detect video platform from URL
  const getVideoPlatform = (url) => {
    if (url.includes('loom.com')) return 'loom';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    return 'unknown';
  };

  // Extract YouTube video ID from various URL formats
  const getYouTubeVideoId = (url) => {
    // Handle youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];

    // Handle youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];

    // Handle youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // Get clean YouTube embed URL (privacy-enhanced, no branding)
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    // Use youtube-nocookie.com for privacy-enhanced embed
    // Parameters: modestbranding=1 (minimal branding), rel=0 (no related videos at end)
    return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`;
  };

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

  const platform = getVideoPlatform(loomUrl);
  
  // Get the appropriate embed URL based on platform
  let embedUrl;
  if (platform === 'youtube') {
    embedUrl = getYouTubeEmbedUrl(loomUrl);
    if (!embedUrl) {
      return (
        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Invalid YouTube URL</p>
        </div>
      );
    }
  } else if (platform === 'loom') {
    embedUrl = getCleanLoomUrl(loomUrl);
  } else {
    // Unknown platform - try to use URL as-is
    embedUrl = loomUrl;
  }

  return (
    <div className="w-full">
      <div className="relative w-full aspect-video bg-[#000] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        <iframe
          src={embedUrl}
          allowFullScreen
          allow={platform === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : undefined}
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: 0 }}
          title={title || 'Video player'}
        />
      </div>
    </div>
  );
}
