import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CreditCard,
  BarChart3,
  HelpCircle,
  MessageSquare,
  Settings as SettingsIcon,
  Crown,
  ChevronDown,
  X,
  Menu,
  Download,
  Lock,
  Sparkles,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { Button } from '../shared/Button';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { profile } = useAuth();
  const toast = useToast();
  const isAdmin = useIsAdmin();
  const [surveysExpanded, setSurveysExpanded] = useState(true);
  const [billingExpanded, setBillingExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const planDisplay = {
    free: { name: 'Free', color: 'text-slate-600', bgColor: 'bg-slate-100' },
    pro: { name: 'Pro', color: 'text-blue-600', bgColor: 'bg-blue-100' },
    pro_plus: { name: 'Pro Plus', color: 'text-violet-600', bgColor: 'bg-violet-100' },
  };

  const currentPlan = profile?.current_plan || 'free';
  const planInfo = planDisplay[currentPlan as keyof typeof planDisplay];

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">FydBak</span>
        </Link>
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {isAdmin && (
            <div className="mb-4">
              <Link
                to="/admin"
                className={`
                  flex items-center px-3 py-3 text-sm rounded-lg transition-colors font-medium
                  ${location.pathname.startsWith('/admin')
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700 border border-transparent'
                  }
                `}
              >
                <Shield className="w-5 h-5 mr-3" />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}

          <div className="mb-4">
            <button
              onClick={() => setSurveysExpanded(!surveysExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <span>Surveys</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${surveysExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {surveysExpanded && (
              <div className="ml-2 mt-1 space-y-1">
                <Link
                  to="/dashboard"
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  Dashboard
                </Link>
                <Link
                  to="/surveys/new"
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive('/surveys/new')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <PlusCircle className="w-4 h-4 mr-3" />
                  Create Survey
                </Link>
                <Link
                  to="/dashboard"
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    text-slate-700 hover:bg-slate-50
                  `}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  All Surveys
                </Link>
              </div>
            )}
          </div>

          <div className="mb-4">
            <button
              onClick={() => setBillingExpanded(!billingExpanded)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
            >
              <span>Usage & Billing</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${billingExpanded ? 'rotate-180' : ''}`}
              />
            </button>
            {billingExpanded && (
              <div className="ml-2 mt-1 space-y-1">
                <Link
                  to="/billing"
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    ${isActive('/billing')
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  Current Plan
                </Link>
                <Link
                  to="/billing"
                  className={`
                    flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                    text-slate-700 hover:bg-slate-50
                  `}
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Usage Stats
                </Link>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1">
            <Link
              to="/settings"
              className={`
                flex items-center px-3 py-2 text-sm rounded-lg transition-colors
                ${isActive('/settings')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <SettingsIcon className="w-4 h-4 mr-3" />
              Account Settings
            </Link>
            <Link
              to="/pricing"
              className="flex items-center px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 mr-3" />
              Help & Support
            </Link>
          </div>
        </nav>

        <div className="px-3 py-4">
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start space-x-2 mb-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Coming Soon</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Export respondent names for giveaways, drawings, or contests
                </p>
              </div>
            </div>
            <div className="flex items-center text-xs text-slate-600 mb-3">
              <Lock className="w-3 h-3 mr-1 flex-shrink-0" />
              <span>Available when names are collected</span>
            </div>
            <button
              onClick={() => toast.info('Join the waitlist feature coming soon!')}
              className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-xs font-medium text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center"
            >
              <Download className="w-3 h-3 mr-1" />
              Join Waitlist
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className={`${planInfo.bgColor} rounded-lg p-3`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${planInfo.color} uppercase`}>
              {planInfo.name} Plan
            </span>
            {currentPlan === 'pro_plus' && (
              <Crown className="w-4 h-4 text-violet-600" />
            )}
          </div>
          {profile && (
            <div className="text-xs text-slate-600">
              {profile.responses_used_this_month || 0} responses this month
            </div>
          )}
        </div>

        {currentPlan !== 'pro_plus' && (
          <Link to="/billing" className="block">
            <Button variant="primary" size="sm" className="w-full">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        )}
      </div>
    </aside>
  );
}

export function SidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200 text-slate-700 hover:text-slate-900"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
