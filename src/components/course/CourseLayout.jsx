import CourseHeader from './CourseHeader';
import CourseSidebar from './CourseSidebar';

export default function CourseLayout({ children, course, completedLessons }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <CourseHeader />
      <div className="flex">
        <CourseSidebar course={course} completedLessons={completedLessons} />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] lg:ml-0 bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}

