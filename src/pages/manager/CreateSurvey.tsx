import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Sparkles } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { TextArea } from '../../components/shared/TextArea';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { generateShortCode } from '../../utils/shortCode';
import type { SurveyGoal } from '../../types';

interface QuestionInput {
  id: string;
  text: string;
}

const SURVEY_GOALS: { value: SurveyGoal; label: string }[] = [
  { value: 'customer_insight', label: 'Customer Insight' },
  { value: 'performance', label: 'Performance Review' },
  { value: 'product_feedback', label: 'Product Feedback' },
  { value: 'team_morale', label: 'Team Morale' },
  { value: 'process_improvement', label: 'Process Improvement' },
  { value: 'other', label: 'Other' },
];

const EMOJI_OPTIONS = ['💡', '📊', '🎯', '💬', '⭐', '🚀', '📈', '👥', ''];

export function CreateSurvey() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('');
  const [goal, setGoal] = useState<SurveyGoal>('customer_insight');
  const [goalDescription, setGoalDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { id: crypto.randomUUID(), text: '' },
  ]);
  const [showBranding, setShowBranding] = useState(false);
  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: '#3b82f6',
    welcomeMessage: '',
    thankYouMessage: '',
  });

  function addQuestion() {
    setQuestions([...questions, { id: crypto.randomUUID(), text: '' }]);
  }

  function removeQuestion(id: string) {
    if (questions.length > 1) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  }

  function updateQuestion(id: string, text: string) {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  }

  async function handleSubmit(e: FormEvent, status: 'draft' | 'active') {
    e.preventDefault();

    if (!title.trim()) {
      toast.warning('Please enter a survey title');
      return;
    }

    const validQuestions = questions.filter((q) => q.text.trim());
    if (validQuestions.length === 0) {
      toast.warning('Please add at least one question');
      return;
    }

    setLoading(true);

    try {
      const shortCode = generateShortCode();

      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          manager_id: user!.id,
          title: title.trim(),
          description: description.trim() || null,
          emoji: emoji || null,
          goal,
          goal_description: goalDescription.trim() || null,
          status,
          short_code: shortCode,
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      const questionsData = validQuestions.map((q, index) => ({
        survey_id: survey.id,
        question_text: q.text.trim(),
        order_index: index,
        is_required: true,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData);

      if (questionsError) throw questionsError;

      if (showBranding && (brandingSettings.primaryColor !== '#3b82f6' || brandingSettings.welcomeMessage || brandingSettings.thankYouMessage)) {
        await supabase
          .from('survey_branding')
          .insert({
            survey_id: survey.id,
            primary_color: brandingSettings.primaryColor,
            welcome_message: brandingSettings.welcomeMessage || null,
            thank_you_message: brandingSettings.thankYouMessage || null,
          });
      }

      navigate(`/surveys/${survey.id}`);
      toast.success(`Survey ${status === 'draft' ? 'saved as draft' : 'created and published'}!`);
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error('Failed to create survey. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagerLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create New Survey</h1>
          <p className="text-slate-600 mt-2">
            Build a conversational survey to gather deep insights from your team
          </p>
        </div>

        <form className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Survey Details</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Choose an emoji (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e || 'none'}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`
                        w-12 h-12 rounded-lg border-2 transition-all text-2xl
                        ${emoji === e
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      {e || '—'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Survey Title"
                placeholder="e.g., Weekly Team Feedback"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <TextArea
                label="Description (optional)"
                placeholder="Brief instructions or context for your team members"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Survey Goal
                  <span className="text-slate-500 text-xs ml-2">(AI will use this to stay on-topic)</span>
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as SurveyGoal)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                >
                  {SURVEY_GOALS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <TextArea
                  label="Describe your goal (optional)"
                  placeholder="e.g., Identify specific blockers preventing reps from closing deals this quarter..."
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  rows={2}
                />
                <p className="text-xs text-slate-500 mt-2">
                  The AI will use this context to ask better follow-up questions and keep responses focused.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Branding (Optional)</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Customize the survey appearance with your brand colors and messages
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBranding(!showBranding)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {showBranding ? 'Hide' : 'Show'} Branding Options
              </button>
            </div>

            {showBranding && (
              <div className="space-y-6 mt-6 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                        className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brandingSettings.primaryColor}
                        onChange={(e) => setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <div
                      className="w-full h-10 rounded-lg border border-slate-200 flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: brandingSettings.primaryColor }}
                    >
                      Preview
                    </div>
                  </div>
                </div>

                <TextArea
                  label="Custom Welcome Message (Optional)"
                  placeholder="Welcome! We value your feedback..."
                  value={brandingSettings.welcomeMessage}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, welcomeMessage: e.target.value })}
                  rows={2}
                />

                <TextArea
                  label="Custom Thank You Message (Optional)"
                  placeholder="Thank you for taking the time to share your thoughts!"
                  value={brandingSettings.thankYouMessage}
                  onChange={(e) => setBrandingSettings({ ...brandingSettings, thankYouMessage: e.target.value })}
                  rows={2}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> Your custom branding will be applied to the survey chat interface, including button colors and messages.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Questions</h2>
                <p className="text-sm text-slate-600 mt-1">
                  <Sparkles className="w-4 h-4 inline text-blue-600" /> AI will
                  automatically ask follow-ups for deeper insights
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-start space-x-3">
                  <div className="mt-3 text-slate-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <TextArea
                      placeholder={`Question ${index + 1}`}
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, e.target.value)}
                      rows={2}
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="mt-2 p-2 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, 'draft')}
                loading={loading}
              >
                Save as Draft
              </Button>
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'active')}
                loading={loading}
              >
                Publish Survey
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}
