interface VideoPlayerProps {
  loomUrl: string;
  title?: string;
}

export default function VideoPlayer({ loomUrl, title }: VideoPlayerProps) {
  if (!loomUrl) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">Video not available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
      )}
      <div className="relative w-full aspect-video bg-[#000] rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
        <iframe
          src={loomUrl}
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          style={{ border: 0 }}
          title={title || 'Loom video player'}
        />
      </div>
    </div>
  );
}

