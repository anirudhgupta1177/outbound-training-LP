import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import {
  HiArrowLeft,
  HiSave,
  HiPlus,
  HiTrash,
  HiCheck,
  HiExternalLink,
  HiVideoCamera,
  HiLink
} from 'react-icons/hi';

export default function LessonEditor() {
  const { id: lessonId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAdminAuth();

  const [lesson, setLesson] = useState(null);
  const [resources, setResources] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loomUrl, setLoomUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('available');

  // New resource state
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'link',
    description: ''
  });

  useEffect(() => {
    fetchLesson();
    fetchModules();
  }, [lessonId]);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (err) {
      console.error('Error fetching modules:', err);
    }
  };

  const fetchLesson = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lesson');
      }

      const data = await response.json();
      setLesson(data.lesson);
      setTitle(data.lesson.title);
      setDescription(data.lesson.description || '');
      setLoomUrl(data.lesson.loom_url || '');
      setDuration(data.lesson.duration || '');
      setStatus(data.lesson.status || 'available');
      setSelectedModuleId(data.lesson.module_id);
      setResources(data.resources || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToModule = async (newModuleId) => {
    if (newModuleId === lesson.module_id) return;
    
    setIsMoving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ module_id: newModuleId })
      });

      if (!response.ok) {
        throw new Error('Failed to move lesson');
      }

      setSuccessMessage('Lesson moved successfully!');
      setSelectedModuleId(newModuleId);
      setLesson({ ...lesson, module_id: newModuleId });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsMoving(false);
    }
  };

  const handleSaveLesson = async () => {
    setIsSaving(true);
    setError(null);

    try {
      // Convert video URLs to embed format if needed
      let embedUrl = loomUrl;
      
      if (loomUrl.includes('loom.com/share/')) {
        // Convert Loom share URL to embed URL
        const match = loomUrl.match(/share\/([a-f0-9]+)/);
        if (match && match[1]) {
          embedUrl = `https://www.loom.com/embed/${match[1]}`;
        }
      } else if (loomUrl.includes('youtube.com/watch') || loomUrl.includes('youtu.be')) {
        // Convert YouTube watch/short URL to embed URL
        let videoId = null;
        const watchMatch = loomUrl.match(/[?&]v=([^&]+)/);
        if (watchMatch) videoId = watchMatch[1];
        if (!videoId) {
          const shortMatch = loomUrl.match(/youtu\.be\/([^?&]+)/);
          if (shortMatch) videoId = shortMatch[1];
        }
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      const response = await fetch(`/api/admin/lessons?id=${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          title,
          description,
          loom_url: embedUrl,
          duration,
          status
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save lesson');
      }

      setSuccessMessage('Lesson saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.url.trim()) return;

    try {
      const response = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          ...newResource
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add resource');
      }

      setNewResource({ title: '', url: '', type: 'link', description: '' });
      setIsAddingResource(false);
      fetchLesson();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Delete this resource?')) return;

    try {
      const response = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }

      fetchLesson();
    } catch (err) {
      setError(err.message);
    }
  };

  // Detect video platform from URL
  const getVideoPlatform = () => {
    if (!loomUrl) return null;
    if (loomUrl.includes('loom.com')) return 'loom';
    if (loomUrl.includes('youtube.com') || loomUrl.includes('youtu.be')) return 'youtube';
    return 'unknown';
  };

  // Get video preview URL based on platform
  const getVideoPreviewUrl = () => {
    if (!loomUrl) return null;
    
    const platform = getVideoPlatform();
    
    if (platform === 'loom') {
      // Extract Loom video ID
      const match = loomUrl.match(/(?:embed|share)\/([a-f0-9]+)/);
      if (match) {
        return `https://www.loom.com/embed/${match[1]}?hide_title=true&hideEmbedTopBar=true&hide_owner=true&hide_share=true`;
      }
    } else if (platform === 'youtube') {
      // Extract YouTube video ID from various formats
      let videoId = null;
      
      // youtube.com/watch?v=VIDEO_ID
      const watchMatch = loomUrl.match(/[?&]v=([^&]+)/);
      if (watchMatch) videoId = watchMatch[1];
      
      // youtu.be/VIDEO_ID
      if (!videoId) {
        const shortMatch = loomUrl.match(/youtu\.be\/([^?&]+)/);
        if (shortMatch) videoId = shortMatch[1];
      }
      
      // youtube.com/embed/VIDEO_ID
      if (!videoId) {
        const embedMatch = loomUrl.match(/youtube\.com\/embed\/([^?&]+)/);
        if (embedMatch) videoId = embedMatch[1];
      }
      
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?modestbranding=1&rel=0`;
      }
    }
    
    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Lesson not found</p>
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
                to={`/admin/modules/${lesson.module_id}`}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <HiArrowLeft className="w-5 h-5" />
                Back to Module
              </Link>
            </div>

            <button
              onClick={handleSaveLesson}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Lesson Details */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Lesson Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    placeholder="Lesson title..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold resize-none"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:border-gold focus:ring-1 focus:ring-gold"
                  >
                    <option value="available">Available</option>
                    <option value="coming-soon">Coming Soon</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    placeholder="e.g., 12:34"
                  />
                </div>

                {/* Move to Module */}
                <div className="pt-4 border-t border-gray-800">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Move to Module
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedModuleId}
                      onChange={(e) => handleMoveToModule(e.target.value)}
                      disabled={isMoving}
                      className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:border-gold focus:ring-1 focus:ring-gold disabled:opacity-50"
                    >
                      {modules.map((mod) => (
                        <option key={mod.id} value={mod.id}>
                          {mod.title}
                        </option>
                      ))}
                    </select>
                    {isMoving && (
                      <div className="w-5 h-5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select a different module to move this lesson
                  </p>
                </div>
              </div>
            </div>

            {/* Video */}
            <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <HiVideoCamera className="w-5 h-5" />
                Video
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={loomUrl}
                    onChange={(e) => setLoomUrl(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                    placeholder="Loom or YouTube URL..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Supports Loom (loom.com/share/...) or YouTube (youtube.com/watch?v=... or youtu.be/...)
                  </p>
                </div>

                {/* Video Preview */}
                {loomUrl && getVideoPreviewUrl() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Preview
                    </label>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getVideoPreviewUrl()}
                        allowFullScreen
                        allow={getVideoPlatform() === 'youtube' ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' : undefined}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Resources */}
          <div>
            <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <HiLink className="w-5 h-5" />
                    Resources
                  </h2>
                  <p className="text-sm text-gray-400">Links, documents, and files</p>
                </div>

                <button
                  onClick={() => setIsAddingResource(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <HiPlus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Add Resource Form */}
              {isAddingResource && (
                <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                  <form onSubmit={handleAddResource} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={newResource.title}
                        onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                        placeholder="Resource title..."
                        className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                        autoFocus
                      />
                    </div>
                    
                    <div>
                      <input
                        type="url"
                        value={newResource.url}
                        onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div>
                      <select
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                        className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white focus:border-gold focus:ring-1 focus:ring-gold"
                      >
                        <option value="link">Link</option>
                        <option value="whimsical">Whimsical</option>
                        <option value="drive">Google Drive</option>
                        <option value="doc">Google Doc</option>
                        <option value="notion">Notion</option>
                        <option value="file">File</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
                      >
                        Add Resource
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingResource(false);
                          setNewResource({ title: '', url: '', type: 'link', description: '' });
                        }}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Resources List */}
              {resources.length === 0 ? (
                <div className="p-12 text-center">
                  <HiLink className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No resources yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white truncate">
                          {resource.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded">
                            {resource.type}
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-gold hover:underline flex items-center gap-1"
                          >
                            Open <HiExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteResource(resource.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

