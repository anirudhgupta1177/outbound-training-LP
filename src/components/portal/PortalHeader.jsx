import { Link, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';

export default function PortalHeader({ backTo, backLabel }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-[#0a0a0a]/95 backdrop-blur-md supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="max-w-6xl mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-5 min-w-0">
          {backTo && (
            <Link
              to={backTo}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <HiArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{backLabel || 'Back'}</span>
            </Link>
          )}
          <Link to="/portal" className="group min-w-0">
            <span className="block text-base sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-amber-300 transition-all truncate">
              Intent Led Sales
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/portal"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800/50"
          >
            Vault
          </Link>
          {user && (
            <div className="relative group">
              <button
                aria-label="Account menu"
                className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-emerald-500 border border-gray-700 flex items-center justify-center text-black text-sm font-semibold"
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </button>
              <div className="absolute right-0 pt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible focus-within:opacity-100 focus-within:visible transition-all">
                <div className="bg-[#111] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
