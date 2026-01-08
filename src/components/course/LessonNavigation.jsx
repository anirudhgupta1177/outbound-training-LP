import { Link } from 'react-router-dom';

export default function LessonNavigation({
  course,
  currentModuleId,
  currentLessonId,
}) {
  // Find current module and lesson
  const currentModule = course.modules.find((m) => m.id === currentModuleId);
  const currentLessonIndex = currentModule?.lessons.findIndex(
    (l) => l.id === currentLessonId
  );

  // Find current module index
  const currentModuleIndex = course.modules.findIndex(
    (m) => m.id === currentModuleId
  );

  // Find previous lesson
  let prevLesson = null;
  if (currentModule && currentLessonIndex !== undefined && currentLessonIndex > 0) {
    const prev = currentModule.lessons[currentLessonIndex - 1];
    if (prev && prev.status === 'available') {
      prevLesson = { module: currentModule, lesson: prev };
    }
  } else if (currentModuleIndex > 0) {
    // Check previous module
    const prevModule = course.modules[currentModuleIndex - 1];
    const prevModuleLessons = prevModule.lessons.filter(
      (l) => l.status === 'available'
    );
    if (prevModuleLessons.length > 0) {
      prevLesson = {
        module: prevModule,
        lesson: prevModuleLessons[prevModuleLessons.length - 1],
      };
    }
  }

  // Find next lesson
  let nextLesson = null;
  if (
    currentModule &&
    currentLessonIndex !== undefined &&
    currentLessonIndex < currentModule.lessons.length - 1
  ) {
    const next = currentModule.lessons[currentLessonIndex + 1];
    if (next && next.status === 'available') {
      nextLesson = { module: currentModule, lesson: next };
    }
  } else if (currentModuleIndex < course.modules.length - 1) {
    // Check next module
    const nextModule = course.modules[currentModuleIndex + 1];
    const firstAvailableLesson = nextModule.lessons.find(
      (l) => l.status === 'available'
    );
    if (firstAvailableLesson) {
      nextLesson = { module: nextModule, lesson: firstAvailableLesson };
    }
  }

  if (!prevLesson && !nextLesson) {
    return null;
  }

  return (
    <div className="border-t border-gray-800 pt-6 mt-8 flex items-center justify-between">
      {prevLesson ? (
        <Link
          to={`/course/${prevLesson.module.id}/${prevLesson.lesson.id}`}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group px-4 py-2 rounded-lg hover:bg-gray-800/50"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <div>
            <p className="text-xs text-gray-500">Previous</p>
            <p className="text-sm font-medium text-white">{prevLesson.lesson.title}</p>
          </div>
        </Link>
      ) : (
        <div></div>
      )}

      {nextLesson ? (
        <Link
          to={`/course/${nextLesson.module.id}/${nextLesson.lesson.id}`}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors group px-4 py-2 rounded-lg hover:bg-gray-800/50"
        >
          <div className="text-right">
            <p className="text-xs text-gray-500">Next</p>
            <p className="text-sm font-medium text-white">{nextLesson.lesson.title}</p>
          </div>
          <svg
            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}

