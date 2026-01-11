// Service to fetch course data from Supabase or fallback to static data
import { courseData as staticCourseData, globalResources as staticGlobalResources, introVideoUrl } from '../constants/courseData';

let cachedCourseData = null;
let cachedGlobalResources = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch course data from API or use static fallback
export async function getCourseData() {
  // Check cache
  if (cachedCourseData && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedCourseData;
  }

  try {
    const response = await fetch('/api/course-data');
    const data = await response.json();

    if (data.useStatic || !data.courseData) {
      // Use static data
      cachedCourseData = staticCourseData;
      cacheTimestamp = Date.now();
      return staticCourseData;
    }

    // Use dynamic data from Supabase
    cachedCourseData = data.courseData;
    cacheTimestamp = Date.now();
    return data.courseData;
  } catch (error) {
    console.error('Error fetching course data:', error);
    // Fallback to static data on error
    return staticCourseData;
  }
}

// Fetch global resources
export async function getGlobalResources() {
  // Check cache
  if (cachedGlobalResources && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedGlobalResources;
  }

  try {
    const response = await fetch('/api/course-data');
    const data = await response.json();

    if (data.useStatic || !data.globalResources) {
      cachedGlobalResources = staticGlobalResources;
      return staticGlobalResources;
    }

    cachedGlobalResources = data.globalResources;
    return data.globalResources;
  } catch (error) {
    console.error('Error fetching global resources:', error);
    return staticGlobalResources;
  }
}

// Get intro video URL (always static for now)
export function getIntroVideoUrl() {
  return introVideoUrl;
}

// Clear cache (useful after admin updates)
export function clearCourseCache() {
  cachedCourseData = null;
  cachedGlobalResources = null;
  cacheTimestamp = null;
}

// Helper to find a module by ID
export function findModule(courseData, moduleId) {
  return courseData.modules.find(m => m.id === moduleId);
}

// Helper to find a lesson by IDs
export function findLesson(courseData, moduleId, lessonId) {
  const module = findModule(courseData, moduleId);
  if (!module) return null;
  return module.lessons.find(l => l.id === lessonId);
}

// Get all lessons flat
export function getAllLessons(courseData) {
  return courseData.modules.flatMap(m => 
    m.lessons.map(l => ({
      ...l,
      moduleId: m.id,
      moduleTitle: m.title
    }))
  );
}

// Get next/prev lessons for navigation
export function getLessonNavigation(courseData, moduleId, lessonId) {
  const allLessons = getAllLessons(courseData);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  
  return {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  };
}

