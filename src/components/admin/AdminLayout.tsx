import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Users, Link as LinkIcon, BarChart3, LayoutDashboard, Menu, X, LogOut, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../shared/Button';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/trial-links', icon: LinkIcon, label: 'Trial Links' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-gradient-to-b from-amber-50 to-white border-r border-amber-200
            transform transition-transform duration-300 ease-in-out
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            flex flex-col
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-amber-200 bg-amber-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-900">Admin Panel</h1>
                <p className="text-xs text-amber-700">System Management</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-amber-600 hover:text-amber-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center px-3 py-2.5 text-sm rounded-lg transition-all
                    ${isActive(item.path)
                      ? 'bg-amber-600 text-white shadow-md font-medium'
                      : 'text-amber-900 hover:bg-amber-100'
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-amber-200">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2.5 text-sm text-amber-900 hover:bg-amber-100 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowLeft className="w-5 h-5 mr-3" />
                Back to Dashboard
              </Link>
              <Link
                to="/settings"
                className="flex items-center px-3 py-2.5 text-sm text-amber-900 hover:bg-amber-100 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 mr-3" />
                Account Settings
              </Link>
            </div>
          </nav>

          {/* Admin Info Footer */}
          <div className="p-4 border-t border-amber-200 bg-amber-50">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {profile?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 truncate">
                  {profile?.full_name || 'Admin User'}
                </p>
                <p className="text-xs text-amber-700 truncate">{profile?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-600 hover:text-slate-900"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-slate-900">Admin Panel</span>
              </div>
              <div className="w-10" />
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
