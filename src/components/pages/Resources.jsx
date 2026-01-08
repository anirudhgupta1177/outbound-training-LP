import { useState, useEffect } from 'react';
import CourseLayout from '../course/CourseLayout';
import { courseData, globalResources } from '../../constants/courseData';
import { useAuth } from '../../contexts/AuthContext';

export default function Resources() {
  const { user, getProgress } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const progress = await getProgress();
          if (progress?.completed_lessons) {
            setCompletedLessons(progress.completed_lessons);
          }
        } catch (error) {
          console.error('Error loading progress:', error);
          const stored = localStorage.getItem('completedLessons');
          if (stored) {
            setCompletedLessons(JSON.parse(stored));
          }
        }
      } else {
        const stored = localStorage.getItem('completedLessons');
        if (stored) {
          setCompletedLessons(JSON.parse(stored));
        }
      }
    };
    loadProgress();
  }, [user, getProgress]);

  const getResourceIcon = (type) => {
    const iconClass = 'w-5 h-5';
    switch (type) {
      case 'whimsical':
        return (
          <svg className={`${iconClass} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
      case 'drive':
        return (
          <svg className={`${iconClass} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      case 'doc':
        return (
          <svg className={`${iconClass} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'notion':
        return (
          <svg className={`${iconClass} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconClass} text-gray-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'guide':
        return 'Guides';
      case 'database':
        return 'Databases';
      case 'template':
        return 'Templates';
      case 'diagram':
        return 'Diagrams';
      case 'document':
        return 'Documents';
      default:
        return 'Resources';
    }
  };

  const resourcesByCategory = globalResources.reduce((acc, resource) => {
    const category = resource.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(resource);
    return acc;
  }, {});

  return (
    <CourseLayout course={courseData} completedLessons={completedLessons}>
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Resources Library
            </h1>
            <p className="text-gray-400">
              All course resources, guides, templates, and supplementary materials in one place.
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(resourcesByCategory).map(([category, resources]) => (
              <div key={category}>
                <h2 className="text-xl font-semibold text-white mb-4">
                  {getCategoryLabel(category)}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {resources.map((resource) => {
                    const module = resource.moduleId
                      ? courseData.modules.find((m) => m.id === resource.moduleId)
                      : null;

                    return (
                      <a
                        key={resource.id}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start space-x-3 p-4 border border-gray-800 rounded-xl bg-[#111111] hover:bg-gray-800/50 hover:border-gray-700 transition-all group"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getResourceIcon(resource.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {resource.title}
                            </p>
                            {module && (
                              <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                Module {module.order}
                              </span>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-xs text-gray-400 mb-1">
                              {resource.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-600 truncate">
                            {resource.url}
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CourseLayout>
  );
}

