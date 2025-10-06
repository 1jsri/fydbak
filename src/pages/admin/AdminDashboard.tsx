import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Link as LinkIcon, Activity, Crown, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from '../../components/admin/AdminLayout';

interface Stats {
  totalUsers: number;
  freeUsers: number;
  proUsers: number;
  proPlusUsers: number;
  activeTrials: number;
  totalResponses: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    freeUsers: 0,
    proUsers: 0,
    proPlusUsers: 0,
    activeTrials: 0,
    totalResponses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('current_plan, trial_active, responses_used_this_month');

      if (error) {
        console.error('Error loading profiles:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      if (profiles) {
        console.log(`Successfully loaded ${profiles.length} profiles`);
        const stats: Stats = {
          totalUsers: profiles.length,
          freeUsers: profiles.filter(p => p.current_plan === 'free').length,
          proUsers: profiles.filter(p => p.current_plan === 'pro').length,
          proPlusUsers: profiles.filter(p => p.current_plan === 'pro_plus').length,
          activeTrials: profiles.filter(p => p.trial_active).length,
          totalResponses: profiles.reduce((sum, p) => sum + p.responses_used_this_month, 0),
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading admin dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600">
          Manage users, create trial links, and monitor platform health
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.totalUsers}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Users</h3>
          <div className="space-y-1 text-xs text-slate-500">
            <div className="flex justify-between">
              <span>Free:</span>
              <span className="font-medium">{stats.freeUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Pro:</span>
              <span className="font-medium">{stats.proUsers}</span>
            </div>
            <div className="flex justify-between">
              <span>Pro Plus:</span>
              <span className="font-medium">{stats.proPlusUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.activeTrials}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Active Trials</h3>
          <p className="text-xs text-slate-500">
            Users currently on trial periods
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-3xl font-bold text-slate-900">{stats.totalResponses}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Responses</h3>
          <p className="text-xs text-slate-500">
            Responses collected this month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-blue-500 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
              <p className="text-sm text-slate-600">View and manage all users</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Search users, change plans, reset usage, and view user activity
          </p>
        </Link>

        <Link
          to="/admin/trial-links"
          className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-green-500 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <LinkIcon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Trial Links</h3>
              <p className="text-sm text-slate-600">Create and manage trial codes</p>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            Generate shareable trial links, track redemptions, and monitor conversions
          </p>
        </Link>
      </div>
    </AdminLayout>
  );
}
