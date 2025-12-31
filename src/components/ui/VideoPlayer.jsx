import { useEffect, useRef } from 'react';

export default function VideoPlayer({ loomUrl, title, className = '' }) {
  const containerRef = useRef(null);

  // Extract video ID from Loom URL
  const getVideoId = (url) => {
    if (!url) return null;
    // Handle both share URLs and embed URLs
    const shareMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
    const embedMatch = url.match(/loom\.com\/embed\/([a-f0-9]+)/);
    return shareMatch?.[1] || embedMatch?.[1] || null;
  };

  const videoId = getVideoId(loomUrl);

  if (!videoId) {
    return (
      <div className={`w-full bg-dark-secondary rounded-lg flex items-center justify-center p-12 ${className}`}>
        <p className="text-text-muted text-center">Video URL not available</p>
      </div>
    );
  }

  // Build embed URL with custom parameters (same as Hero and Instructor sections)
  const embedUrl = `https://www.loom.com/embed/${videoId}?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true&speed=1.5`;

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-dark-secondary rounded-lg overflow-hidden ${className}`}
      style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
    >
      <iframe
        src={embedUrl}
        frameBorder="0"
        webkitallowfullscreen
        mozallowfullscreen
        allowFullScreen
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%' 
        }}
        title={title || 'Course Video'}
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}

