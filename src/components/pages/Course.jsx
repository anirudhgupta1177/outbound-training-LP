import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiChevronDown, HiChevronRight, HiOutlineLockClosed, HiOutlinePlay } from 'react-icons/hi';
import { courseModules } from '../../constants/courseData';

export default function Course() {
  const [expandedModules, setExpandedModules] = useState({});
  const navigate = useNavigate();

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // Calculate overall progress (assuming all videos are accessible for now)
  const totalVideos = courseModules.reduce((sum, module) => sum + module.videos.length, 0);
  const completedVideos = 0; // Will be updated with actual progress later
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const handleVideoClick = (moduleId, videoId, video) => {
    if (video.comingSoon || !video.loomUrl) return;
    navigate(`/course/${moduleId}/${videoId}`);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-80 bg-dark-secondary border-r border-purple/20 flex-shrink-0 overflow-y-auto sticky top-0 h-screen">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-display font-bold text-white mb-1">
              Complete AI-Powered Outbound System
            </h1>
            <p className="text-text-muted text-xs">
              Master the exact system
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Course Progress</span>
              <span className="text-sm font-medium text-gold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-purple to-gold"
              />
            </div>
            <p className="text-xs text-text-muted mt-2">
              {completedVideos} of {totalVideos} videos completed
            </p>
          </div>

          {/* Module List */}
          <div className="space-y-2">
            {courseModules.map((module, moduleIndex) => {
              const isExpanded = expandedModules[module.id] ?? (moduleIndex === 0); // First module expanded by default
              const availableVideos = module.videos.filter(v => v.loomUrl && !v.comingSoon).length;
              const totalModuleVideos = module.videos.length;

              return (
                <div key={module.id} className="border border-purple/20 rounded-lg overflow-hidden bg-dark/50">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-purple/10 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <HiChevronDown className="w-5 h-5 text-purple-light" />
                        ) : (
                          <HiChevronRight className="w-5 h-5 text-text-muted group-hover:text-purple-light transition-colors" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-white">{module.title}</span>
                          {module.level && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-purple/20 text-purple-light border border-purple/40">
                              {module.level}
                            </span>
                          )}
                          {module.paid && (
                            <span className="px-1.5 py-0.5 rounded text-xs bg-gold/20 text-gold border border-gold/40">
                              {module.paidAmount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted">
                          {availableVideos}/{totalModuleVideos} videos
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Module Videos */}
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-purple/20"
                    >
                      <div className="py-2">
                        {module.videos.map((video, videoIndex) => {
                          const isAvailable = video.loomUrl && !video.comingSoon;
                          return (
                            <button
                              key={video.id}
                              onClick={() => handleVideoClick(module.id, video.id, video)}
                              disabled={!isAvailable}
                              className={`w-full px-4 py-2.5 flex items-center gap-3 text-left hover:bg-purple/10 transition-colors group ${
                                !isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple/20 flex items-center justify-center text-xs font-medium text-purple-light group-hover:bg-purple/30 transition-colors">
                                {videoIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`text-sm font-medium truncate ${
                                    isAvailable ? 'text-white group-hover:text-gold' : 'text-text-muted'
                                  } transition-colors`}>
                                    {video.title}
                                  </p>
                                  {video.comingSoon && (
                                    <span className="px-1.5 py-0.5 rounded text-xs bg-text-muted/20 text-text-muted flex-shrink-0">
                                      Soon
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isAvailable && (
                                <HiOutlinePlay className="w-4 h-4 text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
                              )}
                              {!isAvailable && !video.comingSoon && (
                                <HiOutlineLockClosed className="w-4 h-4 text-text-muted flex-shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Welcome to the Course
            </h2>
            <p className="text-text-secondary">
              Select a module from the sidebar to begin your learning journey
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="glass-card rounded-xl p-6 border border-purple/30">
              <p className="text-text-muted text-sm mb-1">Total Modules</p>
              <p className="text-2xl font-bold text-white">{courseModules.length}</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-purple/30">
              <p className="text-text-muted text-sm mb-1">Total Videos</p>
              <p className="text-2xl font-bold text-white">{totalVideos}</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-purple/30">
              <p className="text-text-muted text-sm mb-1">Progress</p>
              <p className="text-2xl font-bold text-gold">{progressPercent}%</p>
            </div>
          </div>

          {/* Module Preview Cards */}
          <div className="grid gap-6">
            {courseModules.map((module, moduleIndex) => {
              const availableVideos = module.videos.filter(v => v.loomUrl && !v.comingSoon);
              const firstAvailableVideo = availableVideos[0];
              
              return (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: moduleIndex * 0.1 }}
                  className="glass-card rounded-xl p-6 border border-purple/30 hover:border-purple/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-display font-bold text-white">
                          {module.title}
                        </h3>
                        {module.level && (
                          <span className="px-2.5 py-1 rounded-full bg-purple/20 border border-purple/40 text-purple-light text-xs font-medium">
                            {module.level}
                          </span>
                        )}
                        {module.paid && (
                          <span className="px-2.5 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-medium">
                            PAID {module.paidAmount}
                          </span>
                        )}
                      </div>
                      <p className="text-text-muted text-sm">
                        {availableVideos.length} of {module.videos.length} videos available
                      </p>
                    </div>
                    {firstAvailableVideo && (
                      <button
                        onClick={() => navigate(`/course/${module.id}/${firstAvailableVideo.id}`)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple to-purple-light hover:from-purple-light hover:to-gold text-white font-medium text-sm transition-all"
                      >
                        Start Module
                      </button>
                    )}
                  </div>

                  {/* Video Preview List */}
                  <div className="space-y-2">
                    {module.videos.slice(0, 3).map((video, videoIndex) => (
                      <div
                        key={video.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-dark-secondary/50 border border-purple/20"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple/20 flex items-center justify-center text-xs font-medium text-purple-light">
                          {videoIndex + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{video.title}</p>
                          {video.comingSoon && (
                            <p className="text-xs text-text-muted">Coming soon</p>
                          )}
                        </div>
                        {video.whimsicalUrl && (
                          <a
                            href={video.whimsicalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded text-xs bg-purple/20 text-purple-light hover:bg-purple/30 transition-colors"
                          >
                            Resource
                          </a>
                        )}
                      </div>
                    ))}
                    {module.videos.length > 3 && (
                      <p className="text-xs text-text-muted text-center py-2">
                        + {module.videos.length - 3} more videos
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

