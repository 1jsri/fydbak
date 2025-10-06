import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { supabase } from '../../lib/supabase';
import type { ChatSession, Response, Question, SessionSummary, Clarification } from '../../types';
import { formatDate } from '../../utils/format';

interface ResponseWithDetails extends Response {
  question: Question;
  clarifications: Clarification[];
}

interface SessionData extends ChatSession {
  responses: ResponseWithDetails[];
  summary?: SessionSummary;
}

export function ResponseDetail() {
  const { surveyId, sessionId } = useParams<{ surveyId: string; sessionId: string }>();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (surveyId && sessionId) {
      loadResponseData();
    }
  }, [surveyId, sessionId]);

  async function loadResponseData() {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId!)
        .single();

      if (sessionError) throw sessionError;

      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*, questions(*), clarifications(*)')
        .eq('session_id', sessionId!)
        .order('created_at');

      if (responsesError) throw responsesError;

      const { data: summaryData } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('session_id', sessionId!)
        .maybeSingle();

      const responses = responsesData.map((r: any) => ({
        ...r,
        question: r.questions,
        clarifications: r.clarifications || [],
      }));

      setSession({
        ...sessionData,
        responses,
        summary: summaryData || undefined,
      });
    } catch (error) {
      console.error('Error loading response data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading response...</div>
        </div>
      </ManagerLayout>
    );
  }

  if (!session) {
    return (
      <ManagerLayout>
        <div className="text-center py-12">
          <p className="text-slate-600 mb-4">Response not found</p>
          <Link to={`/surveys/${surveyId}`} className="text-blue-600 hover:text-blue-700">
            Back to Survey
          </Link>
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <div className="max-w-4xl mx-auto">
        <Link
          to={`/surveys/${surveyId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Survey
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center text-slate-600 mb-2">
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {session.rep_name || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center text-sm text-slate-500">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(session.completed_at || session.started_at)}
              </div>
            </div>
          </div>

          {session.summary && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                AI Summary
              </h3>
              <p className="text-slate-700 mb-4">{session.summary.ai_summary}</p>

              {session.summary.action_points && Array.isArray(session.summary.action_points) && (session.summary.action_points as any[]).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    Suggested Actions
                  </h4>
                  <ul className="space-y-2">
                    {(session.summary.action_points as any[]).map((action: any, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-slate-700">
                          {typeof action === 'string' ? action : action.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="space-y-8">
            <h3 className="text-lg font-semibold text-slate-900">Full Responses</h3>
            {session.responses.map((response, index) => (
              <div key={response.id} className="border-l-4 border-blue-500 pl-6">
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium mb-2">
                    Question {index + 1}
                  </span>
                  <p className="text-lg font-medium text-slate-900">
                    {response.question.question_text}
                  </p>
                </div>

                {response.is_skipped ? (
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-600 italic">
                    Skipped
                    {response.skip_reason && ` - ${response.skip_reason}`}
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 rounded-lg p-4 mb-3">
                      <p className="text-slate-800 whitespace-pre-wrap">
                        {response.answer_text}
                      </p>
                    </div>

                    {response.clarifications.length > 0 && (
                      <div className="ml-6 space-y-3">
                        {response.clarifications.map((clarification) => (
                          <div key={clarification.id}>
                            <p className="text-sm text-blue-700 mb-2">
                              Follow-up: {clarification.clarification_prompt}
                            </p>
                            {clarification.clarification_answer && (
                              <div className="bg-blue-50 rounded-lg p-3">
                                <p className="text-sm text-slate-800">
                                  {clarification.clarification_answer}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ManagerLayout>
  );
}
