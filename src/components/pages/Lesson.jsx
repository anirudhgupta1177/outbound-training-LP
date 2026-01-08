import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CourseLayout from '../course/CourseLayout';
import VideoPlayer from '../course/VideoPlayer';
import ResourceLinks from '../course/ResourceLinks';
import LessonNavigation from '../course/LessonNavigation';
import { courseData } from '../../constants/courseData';
import { useAuth } from '../../contexts/AuthContext';

export default function Lesson() {
  const { moduleId, lessonId } = useParams();
  const { user, getProgress, saveProgress } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load progress on mount
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
      setIsLoading(false);
    };
    loadProgress();
  }, [user, getProgress]);

  // Save progress to localStorage as backup
  useEffect(() => {
    if (completedLessons.length > 0) {
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
  }, [completedLessons]);

  const module = courseData.modules.find((m) => m.id === moduleId);
  const lesson = module?.lessons.find((l) => l.id === lessonId);

  if (isLoading) {
    return (
      <CourseLayout course={courseData} completedLessons={completedLessons}>
        <div className="w-full flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </CourseLayout>
    );
  }

  if (!module || !lesson) {
    return (
      <CourseLayout course={courseData} completedLessons={completedLessons}>
        <div className="w-full">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Lesson Not Found</h1>
            <p className="text-gray-400 mb-4">The lesson you're looking for doesn't exist.</p>
            <Link
              to="/course"
              className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/30"
            >
              Back to Course
            </Link>
          </div>
        </div>
      </CourseLayout>
    );
  }

  const isCompleted = completedLessons.includes(lesson.id);
  const isComingSoon = lesson.status === 'coming-soon';

  const handleMarkComplete = async () => {
    setIsSaving(true);
    let newCompletedLessons;
    
    if (isCompleted) {
      newCompletedLessons = completedLessons.filter((id) => id !== lesson.id);
    } else {
      newCompletedLessons = [...completedLessons, lesson.id];
    }
    
    setCompletedLessons(newCompletedLessons);
    
    // Save to Supabase
    if (user && saveProgress) {
      try {
        await saveProgress(newCompletedLessons, lesson.id);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
    
    setIsSaving(false);
  };

  return (
    <CourseLayout course={courseData} completedLessons={completedLessons}>
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-gray-400">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/course" className="hover:text-white transition-colors">
                  Course
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-gray-300">
                {module.order === 0 ? 'Welcome' : `Module ${module.order}`}
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-white truncate max-w-xs font-medium">
                {isComingSoon && lesson.titleHidden
                  ? 'Lesson Coming Soon'
                  : lesson.title}
              </li>
            </ol>
          </nav>

          {/* Lesson Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {isComingSoon && lesson.titleHidden
                    ? 'Lesson Coming Soon'
                    : lesson.title}
                </h1>
                <p className="text-sm text-gray-400">
                  {module.order === 0 ? 'Welcome' : `Module ${module.order}`}:{' '}
                  {module.title}
                </p>
              </div>
              {!isComingSoon && (
                <button
                  onClick={handleMarkComplete}
                  disabled={isSaving}
                  className={`flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg border transition-all whitespace-nowrap ${
                    isCompleted
                      ? 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                  ) : (
                    <svg
                      className={`w-5 h-5 ${
                        isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                      fill={isCompleted ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isCompleted ? (
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      )}
                    </svg>
                  )}
                  <span className="text-sm font-medium">
                    {isCompleted ? 'Completed' : 'Mark Complete'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Video Player */}
          {!isComingSoon && (
            <>
              <div className="mb-8">
                <VideoPlayer loomUrl={lesson.loomUrl} />
              </div>

              {/* Resources */}
              <div className="mb-8">
                <ResourceLinks lesson={lesson} />
              </div>
            </>
          )}

          {isComingSoon && (
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-12 text-center bg-[#111111]">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Content Coming Soon
                </h3>
                <p className="text-gray-400">
                  This lesson is currently being prepared. Check back soon!
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          {!isComingSoon && (
            <LessonNavigation
              course={courseData}
              currentModuleId={moduleId}
              currentLessonId={lessonId}
            />
          )}
        </div>
      </div>
    </CourseLayout>
  );
}

