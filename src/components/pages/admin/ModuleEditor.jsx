import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiArrowLeft,
  HiSave,
  HiPlus,
  HiPencil,
  HiTrash,
  HiChevronUp,
  HiChevronDown,
  HiVideoCamera,
  HiExternalLink,
  HiCheck,
  HiClock
} from 'react-icons/hi';

export default function ModuleEditor() {
  const { id: moduleId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAdminAuth();

  const [module, setModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // New lesson state
  const [isCreatingLesson, setIsCreatingLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  useEffect(() => {
    fetchModule();
  }, [moduleId]);

  const fetchModule = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch module');
      }

      const data = await response.json();
      setModule(data.module);
      setTitle(data.module.title);
      setDescription(data.module.description || '');
      setLessons(data.lessons || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveModule = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title, description })
      });

      if (!response.ok) {
        throw new Error('Failed to save module');
      }

      setSuccessMessage('Module saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateLesson = async (e) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    try {
      const response = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          module_id: moduleId,
          title: newLessonTitle.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create lesson');
      }

      setNewLessonTitle('');
      setIsCreatingLesson(false);
      fetchModule();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete lesson');
      }

      fetchModule();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReorderLesson = async (lessonId, direction) => {
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= lessons.length) return;

    const reordered = [...lessons];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    setLessons(reordered);

    try {
      const response = await fetch('/api/admin/lessons/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          moduleId,
          lessonIds: reordered.map(l => l.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder lessons');
      }
    } catch (err) {
      setError(err.message);
      fetchModule();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Module not found</p>
          <Link to="/admin" className="text-gold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-700" />
              <h1 className="text-lg font-bold text-white">Edit Module</h1>
            </div>

            <button
              onClick={handleSaveModule}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <HiSave className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
            <button onClick={() => setError(null)} className="ml-4 underline">
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 flex items-center gap-2">
            <HiCheck className="w-5 h-5" />
            {successMessage}
          </div>
        )}

        {/* Module Details */}
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Module Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                placeholder="Module title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold resize-none"
                placeholder="Brief description of this module..."
              />
            </div>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-white">Lessons</h2>
              <p className="text-sm text-gray-400">{lessons.length} lessons in this module</p>
            </div>
            
            <button
              onClick={() => setIsCreatingLesson(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Add Lesson
            </button>
          </div>

          {/* New Lesson Form */}
          {isCreatingLesson && (
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <form onSubmit={handleCreateLesson} className="flex gap-4">
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Lesson title..."
                  className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingLesson(false);
                    setNewLessonTitle('');
                  }}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Lessons List */}
          {lessons.length === 0 ? (
            <div className="p-12 text-center">
              <HiVideoCamera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No lessons yet</p>
              <button
                onClick={() => setIsCreatingLesson(true)}
                className="mt-4 text-gold hover:underline"
              >
                Add your first lesson
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-900/50 transition-colors"
                >
                  {/* Order Controls */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => handleReorderLesson(lesson.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <HiChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-gray-500 font-mono">{index + 1}</span>
                    <button
                      onClick={() => handleReorderLesson(lesson.id, 'down')}
                      disabled={index === lessons.length - 1}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <HiChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lesson Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">{lesson.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      {lesson.loom_url ? (
                        <span className="flex items-center gap-1 text-green-400">
                          <HiVideoCamera className="w-4 h-4" />
                          Video added
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <HiVideoCamera className="w-4 h-4" />
                          No video
                        </span>
                      )}
                      
                      <span className={`flex items-center gap-1 ${
                        lesson.status === 'available' ? 'text-green-400' : 
                        lesson.status === 'coming-soon' ? 'text-yellow-500' : 'text-gray-500'
                      }`}>
                        {lesson.status === 'available' ? (
                          <HiCheck className="w-4 h-4" />
                        ) : (
                          <HiClock className="w-4 h-4" />
                        )}
                        {lesson.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/lessons/${lesson.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

