'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Course } from '@/lib/types';
import { useState } from 'react';

interface SidebarProps {
  course: Course;
  completedLessons: string[];
}

export default function Sidebar({ course, completedLessons }: SidebarProps) {
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(course.modules.map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const isLessonActive = (moduleId: string, lessonId: string) => {
    return pathname === `/course/${moduleId}/${lessonId}`;
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  return (
    <aside className="hidden lg:block w-80 border-r border-gray-800 bg-[#111111] overflow-y-auto h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-2">
        <Link
          href="/course"
          className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800/50 hover:text-white transition-all"
        >
          Course Overview
        </Link>
        <Link
          href="/course/resources"
          className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800/50 hover:text-white transition-all"
        >
          Resources Library
        </Link>
        <div className="border-t border-gray-800 pt-2 mt-2">
          <h2 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Modules
          </h2>
          {course.modules.map((module) => (
            <div key={module.id} className="mb-1">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800/50 hover:text-white transition-all"
              >
                <span className="text-left">
                  {module.order === 0 ? 'Welcome' : `${module.order}. ${module.title}`}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    expandedModules.has(module.id) ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              {expandedModules.has(module.id) && (
                <div className="ml-4 mt-1 space-y-1">
                  {module.lessons.map((lesson) => {
                    const isActive = isLessonActive(module.id, lesson.id);
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isComingSoon = lesson.status === 'coming-soon';

                    return (
                      <Link
                        key={lesson.id}
                        href={
                          isComingSoon
                            ? '#'
                            : `/course/${module.id}/${lesson.id}`
                        }
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${
                          isComingSoon
                            ? 'text-gray-600 cursor-not-allowed'
                            : isActive
                            ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 font-medium border-l-2 border-blue-500'
                            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                        }`}
                        onClick={(e) => {
                          if (isComingSoon) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
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
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

