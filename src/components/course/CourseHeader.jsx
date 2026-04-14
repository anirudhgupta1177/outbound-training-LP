import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

export default function CourseHeader() {
  const [logoError, setLogoError] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4 sm:space-x-6">
          <Link to="/course" className="flex items-center space-x-3 group">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-amber-300 transition-all">
              Outbound Mastery
            </h1>
          </Link>
        </div>
        <div className="flex items-center space-x-3 sm:space-x-4">
          <Link
            to="/course/resources"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
          >
            <span className="hidden sm:inline">Resources</span>
            <span className="sm:hidden">Res</span>
          </Link>
          {user && (
            <div className="relative group">
              <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 border border-gray-700 flex items-center justify-center text-black text-sm font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="px-4 py-2 border-b border-gray-800">
                  <p className="text-sm text-white truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

