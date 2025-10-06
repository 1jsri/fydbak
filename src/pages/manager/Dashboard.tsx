import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Clock, BarChart3, Archive, XCircle, AlertCircle, Download, Crown } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { UsageBanner } from '../../components/manager/UsageBanner';
import { Button } from '../../components/shared/Button';
import { DashboardSkeleton } from '../../components/shared/LoadingSkeleton';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { useIsAdmin } from '../../hooks/useIsAdmin';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import type { Survey } from '../../types';
import { formatRelativeTime, pluralize } from '../../utils/format';
import { formatTimeRemaining, isSurveyClosed } from '../../utils/surveyDuration';
import { exportAllSurveysToCSV } from '../../utils/csvExport';

interface SurveyWithStats extends Survey {
  responseCount: number;
  completedCount: number;
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const isAdmin = useIsAdmin();
  const toast = useToast();
  const [surveys, setSurveys] = useState<SurveyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingSurveyId, setClosingSurveyId] = useState<string | null>(null);
  const [surveyToClose, setSurveyToClose] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'archived' | 'closed'>('all');

  useEffect(() => {
    if (user) {
      loadSurveys();
      loadSurveys();
    }
  }, [user, filter]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSurveys((prev) => [...prev]);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadSurveys() {
    try {
      let query = supabase
        .from('surveys')
        .select('*')
        .eq('manager_id', user!.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: surveysData, error } = await query;

      if (error) throw error;

      const surveysWithStats = await Promise.all(
        (surveysData || []).map(async (survey) => {
          const { count: totalSessions } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', survey.id);

          const { count: completedSessions } = await supabase
            .from('chat_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', survey.id)
            .eq('status', 'completed');

          return {
            ...survey,
            responseCount: totalSessions || 0,
            completedCount: completedSessions || 0,
          };
        })
      );

      setSurveys(surveysWithStats);
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCloseSurveyClick(surveyId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSurveyToClose(surveyId);
  }

  async function closeSurvey() {
    if (!surveyToClose) return;

    setClosingSurveyId(surveyToClose);
    setSurveyToClose(null);

    try {
      const { error } = await supabase
        .from('surveys')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_manually: true,
          closed_by: user!.id,
        })
        .eq('id', closingSurveyId!);

      if (error) throw error;

      await loadSurveys();
      toast.success('Survey closed successfully');
    } catch (error) {
      console.error('Error closing survey:', error);
      toast.error('Failed to close survey. Please try again.');
    } finally {
      setClosingSurveyId(null);
    }
  }

  function handleExportAllCSV() {
    if (surveys.length === 0) {
      toast.warning('No surveys to export');
      return;
    }

    const exportData = surveys.map(survey => ({
      id: survey.id,
      title: survey.title,
      goal: survey.goal,
      status: survey.status,
      created_at: survey.created_at,
      response_count: survey.completedCount,
      completion_rate: survey.responseCount > 0
        ? Math.round((survey.completedCount / survey.responseCount) * 100)
        : 0,
      short_code: survey.short_code
    }));

    exportAllSurveysToCSV(exportData);
    toast.success('CSV exported successfully');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'draft':
        return 'bg-yellow-100 text-yellow-700';
      case 'archived':
        return 'bg-slate-100 text-slate-700';
      case 'closed':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getGoalIcon = (goal: string) => {
    return <BarChart3 className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <ManagerLayout>
        <DashboardSkeleton />
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <UsageBanner />

      {isAdmin && (
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Admin Access Available</h3>
                <p className="text-sm text-slate-600">You have site owner privileges</p>
              </div>
            </div>
            <Link to="/owner">
              <Button variant="primary">
                <Crown className="w-4 h-4 mr-2" />
                Owner Dashboard
              </Button>
            </Link>
          </div>
          <div className="mt-3 text-xs text-slate-500 font-mono bg-white rounded p-2">
            Debug: role={profile?.role}, is_site_owner={profile?.is_site_owner?.toString()}, isAdmin={isAdmin.toString()}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Your Surveys</h1>
        <p className="text-slate-600 mt-2">
          Create conversational surveys and gather meaningful feedback from your team
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          {(['all', 'active', 'draft', 'archived', 'closed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
                ${filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }
              `}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex space-x-3">
          {surveys.length > 0 && (
            <Button variant="outline" onClick={handleExportAllCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
          )}
          <Link to="/surveys/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Survey
            </Button>
          </Link>
        </div>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No surveys yet</h3>
          <p className="text-slate-600 mb-6">
            Create your first conversational survey to start gathering feedback
          </p>
          <Link to="/surveys/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Survey
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Link
              key={survey.id}
              to={`/surveys/${survey.id}`}
              className="group bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {survey.emoji && (
                      <div className="text-3xl mb-2">{survey.emoji}</div>
                    )}
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {survey.title}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                      survey.status
                    )}`}
                  >
                    {survey.status}
                  </span>
                </div>

                {survey.description && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {survey.description}
                  </p>
                )}

                <div className="flex items-center text-sm text-slate-500 mb-4">
                  {getGoalIcon(survey.goal)}
                  <span className="ml-2 capitalize">
                    {survey.goal.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users className="w-4 h-4 mr-1" />
                      {pluralize(survey.completedCount, 'response')}
                    </div>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatRelativeTime(survey.created_at)}
                    </div>
                  </div>

                  {survey.status === 'active' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs font-medium"
                        style={{
                          color: isSurveyClosed(survey) ? '#dc2626' : survey.closes_at ? '#f59e0b' : '#64748b'
                        }}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeRemaining(survey.closes_at)}
                      </div>
                      <button
                        onClick={(e) => handleCloseSurveyClick(survey.id, e)}
                        disabled={closingSurveyId === survey.id}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline disabled:opacity-50"
                      >
                        {closingSurveyId === survey.id ? 'Closing...' : 'Close Now'}
                      </button>
                    </div>
                  )}

                  {survey.status === 'closed' && survey.closed_at && (
                    <div className="flex items-center text-xs text-gray-600">
                      <XCircle className="w-3 h-3 mr-1" />
                      Closed {formatRelativeTime(survey.closed_at)}
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs text-slate-500 font-mono">
                  Code: {survey.short_code}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={surveyToClose !== null}
        onClose={() => setSurveyToClose(null)}
        onConfirm={closeSurvey}
        title="Close Survey"
        message="Are you sure you want to close this survey? Respondents will no longer be able to submit responses."
        confirmText="Close Survey"
        variant="danger"
        loading={closingSurveyId !== null}
      />
    </ManagerLayout>
  );
}
