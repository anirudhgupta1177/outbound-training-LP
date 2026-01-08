import { useState, useEffect } from 'react';
import CourseLayout from '../course/CourseLayout';
import VideoPlayer from '../course/VideoPlayer';
import ModuleCard from '../course/ModuleCard';
import CourseProgressBar from '../course/CourseProgressBar';
import { courseData, introVideoUrl } from '../../constants/courseData';
import {
  calculateCourseProgress,
  getTotalLessons,
  getTotalModules,
} from '../../utils/progress';
import { useAuth } from '../../contexts/AuthContext';

export default function Course() {
  const { user, getProgress, saveProgress } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from Supabase on mount
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
          // Fallback to localStorage
          const stored = localStorage.getItem('completedLessons');
          if (stored) {
            setCompletedLessons(JSON.parse(stored));
          }
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

  const progress = calculateCourseProgress(courseData, completedLessons);
  const totalModules = getTotalModules(courseData);
  const totalLessons = getTotalLessons(courseData);

  if (isLoading) {
    return (
      <CourseLayout course={courseData} completedLessons={completedLessons}>
        <div className="w-full flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </CourseLayout>
    );
  }

  return (
    <CourseLayout course={courseData} completedLessons={completedLessons}>
      <div className="w-full">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
          {/* Course Title and Description */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-gradient">
              {courseData.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed">
              {courseData.description}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span className="text-3xl font-bold text-white">{totalModules}</span>
              </div>
              <p className="text-sm text-gray-400">Modules</p>
            </div>
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-3xl font-bold text-white">{totalLessons}</span>
              </div>
              <p className="text-sm text-gray-400">Lessons</p>
            </div>
            <div className="bg-[#111111] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-3xl font-bold text-white">{progress}%</span>
              </div>
              <p className="text-sm text-gray-400">Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <CourseProgressBar progress={progress} label="Course Progress" />
          </div>

          {/* Intro Video */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to Outbound Mastery</h2>
            <p className="text-gray-400 mb-6">Get started with this introduction video</p>
            <VideoPlayer loomUrl={introVideoUrl} />
          </div>

          {/* Module Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Course Modules</h2>
            <div className="grid gap-6">
              {courseData.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  completedLessons={completedLessons}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </CourseLayout>
  );
}

