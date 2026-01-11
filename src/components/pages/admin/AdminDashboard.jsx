import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import { 
  HiPlus, 
  HiPencil, 
  HiTrash, 
  HiMenu,
  HiChevronUp,
  HiChevronDown,
  HiLogout,
  HiAcademicCap,
  HiVideoCamera,
  HiRefresh
} from 'react-icons/hi';

export default function AdminDashboard() {
  const [modules, setModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  
  const { logout, adminEmail, getToken } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/modules', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      
      const data = await response.json();
      setModules(data.modules || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ title: newModuleTitle.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to create module');
      }

      setNewModuleTitle('');
      setIsCreating(false);
      fetchModules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!confirm('Are you sure you want to delete this module? This will also delete all lessons in it.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modules?id=${moduleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete module');
      }

      fetchModules();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReorder = async (moduleId, direction) => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= modules.length) return;

    const reordered = [...modules];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Optimistic update
    setModules(reordered);

    try {
      const response = await fetch('/api/admin/modules/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          moduleIds: reordered.map(m => m.id)
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder modules');
        fetchModules(); // Revert on error
      }
    } catch (err) {
      setError(err.message);
      fetchModules();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#111] border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HiAcademicCap className="w-8 h-8 text-gold" />
              <div>
                <h1 className="text-lg font-bold text-white">Course Admin</h1>
                <p className="text-xs text-gray-400">{adminEmail}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/course" 
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                View Course →
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                <HiLogout className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Modules</h2>
            <p className="text-gray-400">Manage your course modules and lessons</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchModules}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              New Module
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Create Module Form */}
        {isCreating && (
          <div className="mb-6 p-6 bg-[#111] border border-gray-800 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Module</h3>
            <form onSubmit={handleCreateModule} className="flex gap-4">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Module title..."
                className="flex-1 px-4 py-2 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-gold focus:ring-1 focus:ring-gold"
                autoFocus
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setNewModuleTitle('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        ) : modules.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <HiAcademicCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No modules yet</h3>
            <p className="text-gray-400 mb-6">Get started by creating your first module</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-black font-medium rounded-lg hover:bg-gold-light transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Create First Module
            </button>
          </div>
        ) : (
          /* Modules List */
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div
                key={module.id}
                className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Drag Handle / Order */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleReorder(module.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiChevronUp className="w-5 h-5" />
                    </button>
                    <span className="text-gray-500 text-sm font-mono">{index + 1}</span>
                    <button
                      onClick={() => handleReorder(module.id, 'down')}
                      disabled={index === modules.length - 1}
                      className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <HiChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Module Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {module.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-sm text-gray-400">
                        <HiVideoCamera className="w-4 h-4" />
                        {module.lesson_count || 0} lessons
                      </span>
                      {module.description && (
                        <span className="text-sm text-gray-500 truncate">
                          {module.description}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/modules/${module.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete module"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

