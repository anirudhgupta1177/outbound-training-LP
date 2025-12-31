import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiOutlineExternalLink, HiCheckCircle, HiChevronDown, HiChevronUp, HiOutlineLockClosed } from 'react-icons/hi';
import { getModuleById, getVideoById, courseModules } from '../../constants/courseData';
import VideoPlayer from '../ui/VideoPlayer';
import { useState } from 'react';

export default function ModuleVideo() {
  const { moduleId, videoId } = useParams();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const module = getModuleById(moduleId);
  const video = getVideoById(moduleId, videoId);

  if (!module || !video) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Video not found</p>
          <Link to="/course" className="text-gold hover:underline">
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  const currentVideoIndex = module.videos.findIndex(v => v.id === videoId);
  const previousVideo = currentVideoIndex > 0 ? module.videos[currentVideoIndex - 1] : null;
  const nextVideo = currentVideoIndex < module.videos.length - 1 ? module.videos[currentVideoIndex + 1] : null;

  // Get previous module's last video if needed
  const currentModuleIndex = courseModules.findIndex(m => m.id === moduleId);
  const previousModule = currentModuleIndex > 0 ? courseModules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < courseModules.length - 1 ? courseModules[currentModuleIndex + 1] : null;

  const previousVideoInCourse = previousVideo 
    ? { moduleId, videoId: previousVideo.id, video: previousVideo }
    : previousModule 
    ? { moduleId: previousModule.id, videoId: previousModule.videos[previousModule.videos.length - 1].id, video: previousModule.videos[previousModule.videos.length - 1] }
    : null;

  const nextVideoInCourse = nextVideo
    ? { moduleId, videoId: nextVideo.id, video: nextVideo }
    : nextModule
    ? { moduleId: nextModule.id, videoId: nextModule.videos[0].id, video: nextModule.videos[0] }
    : null;

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className={`${sidebarExpanded ? 'w-80' : 'w-0'} bg-dark-secondary border-r border-purple/20 flex-shrink-0 overflow-y-auto sticky top-0 h-screen transition-all duration-300`}>
        {sidebarExpanded && (
          <div className="p-6">
            {/* Header */}
            <div className="mb-6">
              <Link to="/course" className="inline-flex items-center gap-2 text-text-muted hover:text-gold transition-colors mb-4">
                <HiChevronLeft className="w-4 h-4" />
                <span className="text-sm">Back to Course</span>
              </Link>
              <h1 className="text-xl font-display font-bold text-white mb-1">
                {module.title}
              </h1>
              <div className="flex items-center gap-2">
                {module.level && (
                  <span className="px-2 py-1 rounded-full bg-purple/20 border border-purple/40 text-purple-light text-xs font-medium">
                    {module.level}
                  </span>
                )}
                {module.paid && (
                  <span className="px-2 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold text-xs font-medium">
                    {module.paidAmount}
                  </span>
                )}
              </div>
            </div>

            {/* Module Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white">Module Progress</span>
                <span className="text-sm font-medium text-gold">{Math.round(((currentVideoIndex + 1) / module.videos.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-dark rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentVideoIndex + 1) / module.videos.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple to-gold"
                />
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-1">
              {module.videos.map((v, index) => {
                const isActive = v.id === videoId;
                const isCompleted = index < currentVideoIndex;
                const isAvailable = v.loomUrl && !v.comingSoon;
                
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (isAvailable) {
                        navigate(`/course/${moduleId}/${v.id}`);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 text-left transition-all ${
                      isActive
                        ? 'bg-purple/30 border-2 border-purple/50'
                        : isCompleted
                        ? 'bg-dark-secondary/50 border border-purple/20 hover:border-purple/40 hover:bg-purple/10'
                        : 'bg-dark-secondary/30 border border-purple/10 hover:border-purple/30 hover:bg-purple/5'
                    } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive
                        ? 'bg-gold text-dark'
                        : isCompleted
                        ? 'bg-success/20 text-success'
                        : 'bg-purple/20 text-purple-light'
                    }`}>
                      {isCompleted ? (
                        <HiCheckCircle className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isActive ? 'text-gold' : isAvailable ? 'text-white' : 'text-text-muted'
                      }`}>
                        {v.title}
                      </p>
                      {v.comingSoon && (
                        <p className="text-xs text-text-muted mt-0.5">Coming Soon</p>
                      )}
                    </div>
                    {!isAvailable && !v.comingSoon && (
                      <HiOutlineLockClosed className="w-4 h-4 text-text-muted flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Whimsical Resource */}
            {video.whimsicalUrl && (
              <div className="mt-6 pt-6 border-t border-purple/20">
                <a
                  href={video.whimsicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-purple/20 hover:bg-purple/30 border border-purple/40 transition-all group"
                >
                  <HiOutlineExternalLink className="w-5 h-5 text-purple-light group-hover:text-gold transition-colors" />
                  <span className="text-sm font-medium text-white group-hover:text-gold transition-colors">
                    View Resource
                  </span>
                </a>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-dark-secondary border-b border-purple/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="p-2 rounded-lg bg-dark hover:bg-purple/20 border border-purple/20 transition-colors"
              >
                {sidebarExpanded ? (
                  <HiChevronLeft className="w-5 h-5 text-white" />
                ) : (
                  <HiChevronRight className="w-5 h-5 text-white" />
                )}
              </button>
              <div>
                <h2 className="text-lg font-display font-bold text-white">
                  {video.title}
                </h2>
                <p className="text-xs text-text-muted">
                  {module.title} • Video {currentVideoIndex + 1} of {module.videos.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Content */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {video.comingSoon ? (
              <div className="w-full bg-dark-secondary rounded-xl flex items-center justify-center p-16 border border-purple/20">
                <div className="text-center">
                  <p className="text-text-muted text-xl mb-2">Coming Soon</p>
                  <p className="text-text-secondary text-sm">This video will be available soon</p>
                </div>
              </div>
            ) : (
              <VideoPlayer 
                loomUrl={video.loomUrl} 
                title={video.title}
                className="mb-8"
              />
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4 pt-6 border-t border-purple/20">
              {previousVideoInCourse ? (
                <Link
                  to={`/course/${previousVideoInCourse.moduleId}/${previousVideoInCourse.videoId}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-dark-secondary hover:bg-purple/20 border border-purple/20 hover:border-purple/40 transition-all group flex-1"
                >
                  <HiChevronLeft className="w-5 h-5 text-text-muted group-hover:text-gold transition-colors flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="text-xs text-text-muted mb-1">Previous</p>
                    <p className="text-sm font-medium text-white group-hover:text-gold transition-colors truncate">
                      {previousVideoInCourse.video.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="flex-1"></div>
              )}

              {nextVideoInCourse && (
                <Link
                  to={`/course/${nextVideoInCourse.moduleId}/${nextVideoInCourse.videoId}`}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-purple to-purple-light hover:from-purple-light hover:to-gold text-white font-medium transition-all group flex-1 justify-end"
                >
                  <div className="text-right min-w-0">
                    <p className="text-xs text-white/70 mb-1">Next</p>
                    <p className="text-sm font-medium truncate">
                      {nextVideoInCourse.video.title}
                    </p>
                  </div>
                  <HiChevronRight className="w-5 h-5 flex-shrink-0" />
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
