import { useEffect, useState, useRef, FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Send, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/shared/Button';
import { SurveyClosedThankYou } from '../../components/survey/SurveyClosedThankYou';
import { isSurveyClosed } from '../../utils/surveyDuration';
import type { Survey, Question, ChatSession, Response } from '../../types';

interface Message {
  id: string;
  type: 'question' | 'answer' | 'clarification' | 'system';
  content: string;
  timestamp: Date;
}

interface SurveyBranding {
  primary_color: string;
  welcome_message: string | null;
  thank_you_message: string | null;
}

export function SurveyChat() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [repName, setRepName] = useState('');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  const [clarificationAttempts, setClarificationAttempts] = useState(0);
  const [awaitingClarification, setAwaitingClarification] = useState(false);
  const [branding, setBranding] = useState<SurveyBranding | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shortCode) {
      loadSurvey();
    }
  }, [shortCode]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadSurvey() {
    try {
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('short_code', shortCode?.toUpperCase())
        .eq('status', 'active')
        .maybeSingle();

      if (surveyError) throw surveyError;

      if (!surveyData) {
        setLoading(false);
        return;
      }

      if (surveyData.status === 'closed' || isSurveyClosed(surveyData)) {
        setSurvey(surveyData);
        setIsClosed(true);
        setLoading(false);
        return;
      }

      setSurvey(surveyData);

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', surveyData.id)
        .order('order_index');

      if (questionsError) throw questionsError;

      setQuestions(questionsData || []);

      const { data: brandingData } = await supabase
        .from('survey_branding')
        .select('primary_color, welcome_message, thank_you_message')
        .eq('survey_id', surveyData.id)
        .maybeSingle();

      if (brandingData) {
        setBranding(brandingData);
      }

      setLoading(false);

      const welcomeMsg = brandingData?.welcome_message ||
        `Welcome! ${surveyData.description || 'Please answer the following questions honestly.'}`;

      addMessage({
        type: 'system',
        content: welcomeMsg,
      });
    } catch (error) {
      console.error('Error loading survey:', error);
      setLoading(false);
    }
  }

  async function startSession() {
    if (!survey) return;

    setNameSubmitted(true);

    try {
      const { data: sessionData, error } = await supabase
        .from('chat_sessions')
        .insert({
          survey_id: survey.id,
          rep_name: repName.trim() || null,
          status: 'in_progress',
          current_question_id: questions[0]?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      setSession(sessionData);

      addMessage({
        type: 'question',
        content: questions[0]?.question_text || '',
      });
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }

  function addMessage(msg: Omit<Message, 'id' | 'timestamp'>) {
    setMessages((prev) => [
      ...prev,
      {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    ]);
  }

  async function checkForClarification(questionText: string, answer: string, responseId: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            question: questionText,
            answer,
            attemptNumber: clarificationAttempts,
          }),
        }
      );

      const analysis = await response.json();
      return analysis;
    } catch (error) {
      console.error('Error checking clarification:', error);
      return { needsClarification: false, clarificationPrompt: null };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!inputValue.trim() || !session) return;

    const answer = inputValue.trim();
    addMessage({
      type: 'answer',
      content: answer,
    });

    setInputValue('');
    setSending(true);

    try {
      const currentQuestion = questions[currentQuestionIndex];

      if (awaitingClarification && currentResponseId) {
        const { data: clarificationData, error: clarificationError } = await supabase
          .from('clarifications')
          .insert({
            response_id: currentResponseId,
            clarification_prompt: messages[messages.length - 2]?.content || '',
            clarification_answer: answer,
            attempt_number: clarificationAttempts,
          })
          .select()
          .single();

        if (clarificationError) throw clarificationError;

        await supabase
          .from('responses')
          .update({ clarification_count: clarificationAttempts })
          .eq('id', currentResponseId);

        setAwaitingClarification(false);
        moveToNextQuestion();
        return;
      }

      const { data: responseData, error: responseError } = await supabase
        .from('responses')
        .insert({
          session_id: session.id,
          question_id: currentQuestion.id,
          answer_text: answer,
          is_skipped: false,
          clarification_count: 0,
        })
        .select()
        .single();

      if (responseError) throw responseError;

      setCurrentResponseId(responseData.id);

      await supabase
        .from('chat_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id);

      const analysis = await checkForClarification(
        currentQuestion.question_text,
        answer,
        responseData.id
      );

      if (analysis.needsClarification && clarificationAttempts < 2) {
        setTimeout(() => {
          addMessage({
            type: 'clarification',
            content: analysis.clarificationPrompt,
          });
          setClarificationAttempts(clarificationAttempts + 1);
          setAwaitingClarification(true);
          setSending(false);
        }, 1000);
      } else {
        moveToNextQuestion();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setSending(false);
    }
  }

  function moveToNextQuestion() {
    setClarificationAttempts(0);
    setCurrentResponseId(null);
    setAwaitingClarification(false);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        addMessage({
          type: 'question',
          content: questions[currentQuestionIndex + 1].question_text,
        });
        setSending(false);
      }, 1000);
    } else {
      completeSession();
    }
  }

  async function completeSession() {
    if (!session || !survey) return;

    try {
      await supabase
        .from('chat_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      const { data: surveyData } = await supabase
        .from('surveys')
        .select('manager_id')
        .eq('id', survey.id)
        .single();

      if (surveyData?.manager_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('responses_used_this_month')
          .eq('id', surveyData.manager_id)
          .single();

        if (profileData) {
          await supabase
            .from('profiles')
            .update({
              responses_used_this_month: (profileData.responses_used_this_month || 0) + 1,
            })
            .eq('id', surveyData.manager_id);
        }
      }

      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ sessionId: session.id }),
        }
      ).catch(err => console.error('Error generating summary:', err));

      setCompleted(true);
      const thankYouMsg = branding?.thank_you_message ||
        'Thank you for your feedback! Your responses have been recorded.';
      addMessage({
        type: 'system',
        content: thankYouMsg,
      });
      setSending(false);
    } catch (error) {
      console.error('Error completing session:', error);
      setSending(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Survey Not Found
          </h1>
          <p className="text-slate-600">
            This survey link is invalid or has been closed.
          </p>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return <SurveyClosedThankYou survey={survey} branding={branding} />;
  }

  if (!nameSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            {survey.emoji && (
              <div className="text-6xl mb-4">{survey.emoji}</div>
            )}
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="text-slate-600">{survey.description}</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={(e) => { e.preventDefault(); startSession(); }}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What should we call you? (optional)
                </label>
                <input
                  type="text"
                  placeholder="Your name or nickname"
                  value={repName}
                  onChange={(e) => setRepName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Your responses will be anonymous if you skip this
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: branding?.primary_color || '#3b82f6' }}
              >
                Start Survey
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="max-w-3xl mx-auto h-screen flex flex-col">
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {survey.emoji && <span className="text-2xl">{survey.emoji}</span>}
              <div>
                <h1 className="text-lg font-semibold text-slate-900">
                  {survey.title}
                </h1>
                {!completed && (
                  <p className="text-sm text-slate-500">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                )}
              </div>
            </div>
            {!completed && (
              <div className="w-16 h-16">
                <svg className="transform -rotate-90 w-16 h-16">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="#3b82f6"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={
                      2 * Math.PI * 28 * (1 - (currentQuestionIndex + 1) / questions.length)
                    }
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'answer' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xl px-5 py-3 rounded-2xl ${
                  message.type === 'answer'
                    ? 'text-white'
                    : message.type === 'system'
                    ? 'bg-slate-100 text-slate-700 text-center w-full'
                    : 'bg-white text-slate-900 border border-slate-200'
                }`}
                style={message.type === 'answer' ? { backgroundColor: branding?.primary_color || '#3b82f6' } : {}}
              >
                {message.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {!completed && (
          <div className="bg-white border-t border-slate-200 px-6 py-4">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={sending}
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || sending}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: branding?.primary_color || '#3b82f6' }}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {completed && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-t border-green-200 px-6 py-8">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Survey Completed!
              </h2>
              <p className="text-slate-600">
                Your feedback helps us improve. Thank you for your time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
