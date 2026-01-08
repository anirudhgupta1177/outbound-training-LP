interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export default function ProgressBar({
  progress,
  label,
  size = 'md',
  showPercentage = true,
}: ProgressBarProps) {
  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">{progress}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-800 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-300 ease-out rounded-full shadow-lg shadow-blue-500/50"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
    </div>
  );
}

