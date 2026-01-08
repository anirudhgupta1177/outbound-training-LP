// Progress calculation utilities

export function calculateCourseProgress(course, completedLessons) {
  // Exclude coming soon lessons from total count
  const totalLessons = course.modules.reduce((total, module) => {
    const availableLessons = module.lessons.filter(
      (lesson) => lesson.status !== 'coming-soon'
    );
    return total + availableLessons.length;
  }, 0);

  if (totalLessons === 0) return 0;

  const completed = completedLessons.length;
  return Math.round((completed / totalLessons) * 100);
}

export function calculateModuleProgress(module, completedLessons) {
  const availableLessons = module.lessons.filter(
    (lesson) => lesson.status !== 'coming-soon'
  );

  if (availableLessons.length === 0) return 0;

  const completed = availableLessons.filter((lesson) =>
    completedLessons.includes(lesson.id)
  ).length;

  return Math.round((completed / availableLessons.length) * 100);
}

export function getTotalLessons(course) {
  return course.modules.reduce((total, module) => {
    return (
      total +
      module.lessons.filter((lesson) => lesson.status !== 'coming-soon').length
    );
  }, 0);
}

export function getTotalModules(course) {
  return course.modules.length;
}

