import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Users, CheckCircle, Clock, ExternalLink, Download, CreditCard as Edit, Archive, XCircle, AlertTriangle, Play, Trash2 } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { SurveyDetailSkeleton } from '../../components/shared/LoadingSkeleton';
import { ConfirmModal } from '../../components/shared/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import type { Survey, ChatSession, SessionSummary } from '../../types';
import { formatRelativeTime, formatDate } from '../../utils/format';
import { exportSurveyToCSV } from '../../utils/csvExport';
import { formatTimeRemaining, formatClosureDate, isSurveyClosed } from '../../utils/surveyDuration';

interface SessionWithSummary extends ChatSession {
  summary?: SessionSummary | null;
}

export function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [sessions, setSessions] = useState<SessionWithSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingLoading, setClosingLoading] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id && user) {
      loadSurveyData();
    }
  }, [id, user]);

  async function loadSurveyData() {
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id!)
        .eq('manager_id', user!.id)
        .single();

      if (surveyError) throw surveyError;
      setSurvey(surveyData);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*, session_summaries(*)')
        .eq('survey_id', id!)
        .order('started_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      const sessionsWithSummaries = sessionsData.map((session: any) => ({
        ...session,
        summary: session.session_summaries?.[0] || null,
      }));

      setSessions(sessionsWithSummaries);
    } catch (error) {
      console.error('Error loading survey data:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    const link = `${window.location.origin}/s/${survey?.short_code}`;
    navigator.clipboard.writeText(link);
    toast.success('Survey link copied to clipboard!');
  }

  function copyShortCode() {
    navigator.clipboard.writeText(survey?.short_code || '');
    toast.success('Short code copied!');
  }

  async function closeSurvey() {
    if (!survey) return;

    setShowCloseModal(false);
    setClosingLoading(true);

    try {
      const { error } = await supabase
        .from('surveys')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          closed_manually: true,
          closed_by: user!.id,
        })
        .eq('id', survey.id);

      if (error) throw error;

      setSurvey({
        ...survey,
        status: 'closed',
        closed_at: new Date().toISOString(),
        closed_manually: true,
        closed_by: user!.id,
      });

      toast.success('Survey closed successfully');
    } catch (error) {
      console.error('Error closing survey:', error);
      toast.error('Failed to close survey');
    } finally {
      setClosingLoading(false);
    }
  }

  async function reopenSurvey() {
    if (!survey) return;

    setShowReopenModal(false);
    setClosingLoading(true);

    try {
      const { error } = await supabase
        .from('surveys')
        .update({ status: 'active' })
        .eq('id', survey.id);

      if (error) throw error;

      setSurvey({ ...survey, status: 'active' });
      toast.success('Survey reopened successfully');
    } catch (error) {
      console.error('Error reopening survey:', error);
      toast.error('Failed to reopen survey');
    } finally {
      setClosingLoading(false);
    }
  }

  async function toggleStatus() {
    if (!survey) return;

    const newStatus = survey.status === 'active' ? 'archived' : 'active';

    const { error } = await supabase
      .from('surveys')
      .update({ status: newStatus })
      .eq('id', survey.id);

    if (!error) {
      setSurvey({ ...survey, status: newStatus });
    }
  }

  async function deleteSurvey() {
    if (!survey) return;

    setShowDeleteModal(false);
    setDeleteLoading(true);

    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', survey.id);

      if (error) throw error;

      toast.success('Survey deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('Failed to delete survey');
      setDeleteLoading(false);
    }
  }

  async function handleExportCSV() {
    if (!survey) return;

    try {
      const { data: responsesData, error } = await supabase
        .from('chat_sessions')
        .select(`
          id,
          rep_name,
          created_at,
          completed_at,
          responses (
            questions (question_text),
            answer_text,
            created_at
          ),
          session_summaries (
            ai_summary,
            action_points,
            key_themes
          )
        `)
        .eq('survey_id', survey.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      exportSurveyToCSV(survey.title, responsesData || []);
      toast.success('CSV exported successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV. Please try again.');
    }
  }

  const completedSessions = sessions.filter((s) => s.status === 'completed');
  const completionRate =
    sessions.length > 0
      ? Math.round((completedSessions.length / sessions.length) * 100)
      : 0;

  if (loading) {
    return (
      <ManagerLayout>
        <SurveyDetailSkeleton />
      </ManagerLayout>
    );
  }

  if (!survey) {
    return (
      <ManagerLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Survey not found</p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {survey.emoji && <span className="text-4xl">{survey.emoji}</span>}
              <h1 className="text-3xl font-bold text-slate-900">{survey.title}</h1>
            </div>
            {survey.description && (
              <p className="text-slate-600 max-w-2xl">{survey.description}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {survey.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCloseModal(true)}
                disabled={closingLoading}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {closingLoading ? 'Closing...' : 'Close Survey'}
              </Button>
            )}
            {survey.status === 'closed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReopenModal(true)}
                disabled={closingLoading}
              >
                <Play className="w-4 h-4 mr-2" />
                {closingLoading ? 'Reopening...' : 'Reopen Survey'}
              </Button>
            )}
            {survey.status !== 'closed' && (
              <Button variant="outline" size="sm" onClick={toggleStatus}>
                {survey.status === 'active' ? (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </>
                ) : (
                  'Activate'
                )}
              </Button>
            )}
            {(survey.status === 'draft' || survey.status === 'archived') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteLoading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {survey.status === 'closed' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-start space-x-3">
            <XCircle className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Survey Closed</h3>
              <p className="text-sm text-gray-700 mb-2">
                {survey.closed_manually
                  ? `Manually closed ${survey.closed_at ? formatRelativeTime(survey.closed_at) : 'recently'}`
                  : `Automatically closed ${survey.closed_at ? formatRelativeTime(survey.closed_at) : 'after duration expired'}`}
              </p>
              <p className="text-xs text-gray-600">
                Respondents accessing this survey will see a thank you message. No new responses can be submitted.
              </p>
            </div>
          </div>
        </div>
      )}

      {survey.status === 'active' && survey.closes_at && (
        <div className={`border rounded-xl p-6 mb-6 ${
          isSurveyClosed(survey)
            ? 'bg-red-50 border-red-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Clock className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
              isSurveyClosed(survey) ? 'text-red-600' : 'text-amber-600'
            }`} />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 mb-1">
                {isSurveyClosed(survey) ? 'Survey Expired' : 'Scheduled Closure'}
              </h3>
              <p className="text-sm text-slate-700 mb-2">
                {formatTimeRemaining(survey.closes_at)}
              </p>
              <p className="text-xs text-slate-600">
                {isSurveyClosed(survey)
                  ? 'This survey has passed its scheduled closure time. Close it manually to stop accepting responses.'
                  : `Scheduled to close on ${formatClosureDate(survey.closes_at)}`}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">
              {sessions.length}
            </span>
          </div>
          <div className="text-sm text-slate-600">Total Responses</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-2xl font-bold text-slate-900">
              {completedSessions.length}
            </span>
          </div>
          <div className="text-sm text-slate-600">Completed</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-2xl font-bold text-slate-900">
              {completionRate}%
            </span>
          </div>
          <div className="text-sm text-slate-600">Completion Rate</div>
        </div>
      </div>

      {survey.status !== 'closed' && (
        <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl border border-blue-200 p-6 mb-8">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">
          Share this survey
        </h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1 bg-white rounded-lg px-4 py-3 border border-slate-200 font-mono text-sm text-slate-700">
            {window.location.origin}/s/{survey.short_code}
          </div>
          <Button variant="outline" onClick={copyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" onClick={copyShortCode}>
            Code: {survey.short_code}
          </Button>
        </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Responses</h2>
          {completedSessions.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {completedSessions.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">No responses yet</p>
            <p className="text-sm text-slate-500">
              Share the survey link to start collecting feedback
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedSessions.map((session) => (
              <Link
                key={session.id}
                to={`/surveys/${survey.id}/responses/${session.id}`}
                className="block group"
              >
                <div className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-slate-900 group-hover:text-blue-600">
                        {session.rep_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatRelativeTime(session.completed_at || session.started_at)}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                  </div>

                  {session.summary && (
                    <p className="text-sm text-slate-700 line-clamp-2">
                      {session.summary.ai_summary}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={closeSurvey}
        title="Close Survey"
        message="Are you sure you want to close this survey? Respondents will no longer be able to submit responses."
        confirmText="Close Survey"
        variant="danger"
        loading={closingLoading}
      />

      <ConfirmModal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        onConfirm={reopenSurvey}
        title="Reopen Survey"
        message="Are you sure you want to reopen this survey? New responses will be accepted."
        confirmText="Reopen Survey"
        variant="info"
        loading={closingLoading}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteSurvey}
        title="Delete Survey"
        message={
          <>
            Are you sure you want to permanently delete this survey? This will also delete:
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>All {sessions.length} response sessions</li>
              <li>All question and answer data</li>
              <li>AI summaries and insights</li>
            </ul>
            <p className="mt-3 font-semibold">This action cannot be undone.</p>
          </>
        }
        confirmText="Delete Permanently"
        variant="danger"
        loading={deleteLoading}
      />
    </ManagerLayout>
  );
}
