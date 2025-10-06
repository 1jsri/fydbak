import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Settings, User, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useIsOwner } from '../../hooks/useIsOwner';

export function UserAccountMenu() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const isOwner = useIsOwner();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 pl-4 border-l border-slate-200 hover:bg-slate-50 rounded-lg p-2 transition-colors"
      >
        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
          {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
            {profile?.full_name || 'User'}
            {isOwner && (
              <Shield className="w-3.5 h-3.5 text-amber-600" title="Admin" />
            )}
          </div>
          <div className="text-xs text-slate-500">{profile?.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                {profile?.full_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-medium text-slate-900 flex items-center gap-1">
                  {profile?.full_name || 'User'}
                  {isOwner && (
                    <Shield className="w-3.5 h-3.5 text-amber-600" title="Admin" />
                  )}
                </div>
                <div className="text-xs text-slate-500">{profile?.email}</div>
              </div>
            </div>
          </div>

          <div className="py-2">
            {isOwner && (
              <Link
                to="/owner"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Owner Dashboard
              </Link>
            )}
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Account Settings
            </Link>
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </div>

          <div className="border-t border-slate-200 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                handleSignOut();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
