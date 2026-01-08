import ProgressBar from './ProgressBar';

interface CourseHeaderProps {
  title: string;
  description: string;
  progress: number;
  totalModules: number;
  totalLessons: number;
}

export default function CourseHeader({
  title,
  description,
  progress,
  totalModules,
  totalLessons,
}: CourseHeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-gradient">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-gray-300 mb-8 max-w-3xl leading-relaxed">{description}</p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400 mb-6">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            {totalModules} Modules
          </span>
          <span className="hidden sm:inline text-gray-600">•</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {totalLessons} Lessons
          </span>
        </div>
        <div className="max-w-2xl">
          <ProgressBar progress={progress} label="Course Progress" />
        </div>
      </div>
    </div>
  );
}

