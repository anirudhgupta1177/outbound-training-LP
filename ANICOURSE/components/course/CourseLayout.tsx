'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Course } from '@/lib/types';

interface CourseLayoutProps {
  children: ReactNode;
  course: Course;
  completedLessons: string[];
}

export default function CourseLayout({
  children,
  course,
  completedLessons,
}: CourseLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <div className="flex">
        <Sidebar course={course} completedLessons={completedLessons} />
        <main className="flex-1 overflow-y-auto h-[calc(100vh-4rem)] lg:ml-0 bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}

