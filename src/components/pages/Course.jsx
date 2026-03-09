import { useState, useEffect } from 'react';
import CourseLayout from '../course/CourseLayout';
import VideoPlayer from '../course/VideoPlayer';
import ModuleCard from '../course/ModuleCard';
import CourseProgressBar from '../course/CourseProgressBar';
import { getCourseData, getIntroVideoUrl } from '../../services/courseService';
import {
  calculateCourseProgress,
  getTotalLessons,
  getTotalModules,
} from '../../utils/progress';
import { useAuth } from '../../contexts/AuthContext';

export default function Course() {
  const { user, getProgress, saveProgress } = useAuth();
  const [completedLessons, setCompletedLessons] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load course data and progress
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch course data from Supabase (or fallback to static)
        const data = await getCourseData();
        setCourseData(data);
        setIntroVideoUrl(getIntroVideoUrl());

        // Load user progress
        if (user) {
          const progress = await getProgress();
          if (progress?.completed_lessons) {
            setCompletedLessons(progress.completed_lessons);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to localStorage for progress
        const stored = localStorage.getItem('completedLessons');
        if (stored) {
          setCompletedLessons(JSON.parse(stored));
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [user, getProgress]);

  // Save progress to localStorage as backup
  useEffect(() => {
    if (completedLessons.length > 0) {
      localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
  }, [completedLessons]);

  const progress = courseData ? calculateCourseProgress(courseData, completedLessons) : 0;
  const totalModules = courseData ? getTotalModules(courseData) : 0;
  const totalLessons = courseData ? getTotalLessons(courseData) : 0;

  if (isLoading || !courseData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
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

          {/* WhatsApp Community */}
          <div className="bg-[#111111] border border-gray-800 rounded-xl p-6 sm:p-8 mb-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-white mb-2">Join the Student Community</h2>
                <p className="text-gray-400 mb-4">Connect with fellow students, get support, and share your progress in our private WhatsApp group.</p>
                <a
                  href="https://chat.whatsapp.com/FLdWkFfBRVOIiQgPSqdO62"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Join WhatsApp Group
                </a>
              </div>
            </div>
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

