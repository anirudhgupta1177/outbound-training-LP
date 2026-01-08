'use client';

import Link from 'next/link';
import { Module } from '@/lib/types';
import ProgressBar from './ProgressBar';
import { calculateModuleProgress } from '@/lib/utils/progress';

interface ModuleCardProps {
  module: Module;
  completedLessons: string[];
}

export default function ModuleCard({ module, completedLessons }: ModuleCardProps) {
  const progress = calculateModuleProgress(module, completedLessons);
  const availableLessons = module.lessons.filter(
    (lesson) => lesson.status !== 'coming-soon'
  );
  const completedCount = availableLessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;

  const firstAvailableLesson = module.lessons.find(
    (lesson) => lesson.status === 'available'
  );

  return (
    <div className="border border-gray-800 rounded-xl bg-[#111111] hover:border-gray-700 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group">
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              {module.order === 0 ? 'Welcome' : `Module ${module.order}`}: {module.title}
            </h3>
            {module.description && (
              <p className="text-sm text-gray-400 mb-4">{module.description}</p>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>
              {completedCount} of {availableLessons.length} lessons completed
            </span>
          </div>
          <ProgressBar progress={progress} size="sm" showPercentage={false} />
        </div>
        <div className="space-y-2 mb-4">
          {module.lessons.slice(0, 3).map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isComingSoon = lesson.status === 'coming-soon';

            return (
              <div
                key={lesson.id}
                className={`flex items-center space-x-2 text-sm ${
                  isComingSoon ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                <span className="flex-shrink-0">
                  {isComingSoon ? (
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      Coming Soon
                    </span>
                  ) : isCompleted ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  )}
                </span>
                <span className="flex-1 truncate">
                  {isComingSoon && lesson.titleHidden
                    ? 'Lesson Coming Soon'
                    : lesson.title}
                </span>
              </div>
            );
          })}
          {module.lessons.length > 3 && (
            <div className="text-sm text-gray-500 pt-1">
              +{module.lessons.length - 3} more lessons
            </div>
          )}
        </div>
        {firstAvailableLesson && (
          <Link
            href={`/course/${module.id}/${firstAvailableLesson.id}`}
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
          >
            {completedCount === 0
              ? 'Start Module'
              : progress === 100
              ? 'Review Module'
              : 'Continue Learning'}
          </Link>
        )}
      </div>
    </div>
  );
}

