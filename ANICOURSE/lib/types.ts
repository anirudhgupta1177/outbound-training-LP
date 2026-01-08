// Types for course content

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'whimsical' | 'drive' | 'doc' | 'notion' | 'file';
  description?: string;
}

export interface Lesson {
  id: string;
  title: string;
  loomUrl: string;
  resources?: Resource[];
  driveLinks?: string[];
  whimsicalLinks?: string[];
  duration?: string;
  order: number;
  status?: 'available' | 'coming-soon';
  titleHidden?: boolean; // For coming soon lessons
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order: number;
}

export interface Course {
  title: string;
  description: string;
  modules: Module[];
}

export interface UserProgress {
  completedLessons: string[]; // lesson IDs
  currentLesson?: string;
  progressPercentage: number;
}

export interface GlobalResource {
  id: string;
  title: string;
  url: string;
  type: 'whimsical' | 'drive' | 'doc' | 'notion' | 'file';
  description?: string;
  category?: 'guide' | 'database' | 'template' | 'diagram' | 'document';
  moduleId?: string; // Optional: if resource is from a specific module
}

