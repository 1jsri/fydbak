import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, Palette, Upload, Eye, Clock, AlertCircle } from 'lucide-react';
import { ManagerLayout } from '../../components/manager/ManagerLayout';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { TextArea } from '../../components/shared/TextArea';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import { generateShortCode } from '../../utils/shortCode';
import { calculateClosesAt, formatClosureDate } from '../../utils/surveyDuration';
import type { SurveyGoal } from '../../types';

interface QuestionInput {
  id: string;
  text: string;
}

const SURVEY_GOALS: { value: SurveyGoal; label: string; description: string }[] = [
  { value: 'customer_insight', label: 'Customer Insight', description: 'Understand customer needs and pain points' },
  { value: 'performance', label: 'Performance Review', description: 'Gather feedback on individual or team performance' },
  { value: 'product_feedback', label: 'Product Feedback', description: 'Collect opinions on product features and usability' },
  { value: 'team_morale', label: 'Team Morale', description: 'Assess team satisfaction and workplace culture' },
  { value: 'process_improvement', label: 'Process Improvement', description: 'Identify bottlenecks and optimization opportunities' },
  { value: 'other', label: 'Other', description: 'Custom survey goal' },
];

const EMOJI_OPTIONS = ['💡', '📊', '🎯', '💬', '⭐', '🚀', '📈', '👥', '✨', '🌟'];

const PRESET_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Teal', value: '#14b8a6' },
];

export function CreateSurveyWizard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const toast = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('💬');
  const [goal, setGoal] = useState<SurveyGoal>('customer_insight');
  const [goalDescription, setGoalDescription] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [durationType, setDurationType] = useState<'hours' | 'days' | 'indefinite'>('indefinite');
  const [durationValue, setDurationValue] = useState<number>(24);
  const [collectsPii, setCollectsPii] = useState(false);
  const [piiPurpose, setPiiPurpose] = useState('');

  const [questions, setQuestions] = useState<QuestionInput[]>([
    { id: crypto.randomUUID(), text: '' },
  ]);

  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [showPreview, setShowPreview] = useState(false);

  const isProPlus = profile?.current_plan === 'pro_plus';

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

  function canProceedToStep2(): boolean {
    return title.trim().length > 0;
  }

  function canProceedToStep3(): boolean {
    const validQuestions = questions.filter((q) => q.text.trim());
    return validQuestions.length > 0;
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
      const closesAt = durationType === 'indefinite' ? null : calculateClosesAt(durationType, durationValue);

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
          duration_type: durationType,
          duration_value: durationType === 'indefinite' ? null : durationValue,
          closes_at: closesAt?.toISOString() || null,
          collects_pii: collectsPii,
          pii_purpose: piiPurpose.trim() || null,
        })
        .select()
        .single();

      if (surveyError) throw surveyError;

      const questionsData = validQuestions.map((q, index) => ({
        survey_id: survey.id,
        question_text: q.text.trim(),
        order_index: index,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsData);

      if (questionsError) throw questionsError;

      if (isProPlus && (primaryColor !== '#3b82f6' || welcomeMessage || thankYouMessage)) {
        const { error: brandingError } = await supabase
          .from('survey_branding')
          .insert({
            survey_id: survey.id,
            primary_color: primaryColor,
            welcome_message: welcomeMessage.trim() || null,
            thank_you_message: thankYouMessage.trim() || null,
          });

        if (brandingError) console.error('Error saving branding:', brandingError);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Survey</h1>
        <p className="text-slate-600 mb-8">Follow the steps to create your conversational survey</p>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold
                    ${currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                    }
                  `}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <span className="text-sm font-medium text-slate-700">Survey Details</span>
            <span className="text-sm font-medium text-slate-700">Questions</span>
            <span className="text-sm font-medium text-slate-700">Branding</span>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'active')}>
          {currentStep === 1 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Survey Icon
                </label>
                <div className="flex gap-2">
                  {EMOJI_OPTIONS.map((e) => (
                    <button
                      key={e || 'none'}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`
                        w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl
                        ${emoji === e
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      {e || '∅'}
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Survey Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Team Check-in"
                required
              />

              <TextArea
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the purpose of this survey"
                rows={3}
              />

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Survey Goal
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {SURVEY_GOALS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGoal(g.value)}
                      className={`
                        text-left p-4 rounded-lg border-2 transition-all
                        ${goal === g.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="font-semibold text-slate-900 mb-1">{g.label}</div>
                      <div className="text-xs text-slate-600">{g.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {goal === 'other' && (
                <TextArea
                  label="Custom Goal Description"
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe your survey goal..."
                  rows={2}
                />
              )}

              <TextArea
                label="Welcome Message (Optional)"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="A friendly greeting shown before the survey starts..."
                rows={2}
              />

              <TextArea
                label="Thank You Message (Optional)"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                placeholder="A message shown after completing the survey..."
                rows={2}
              />

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Survey Duration
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="hours"
                        checked={durationType === 'hours'}
                        onChange={(e) => setDurationType(e.target.value as 'hours')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">Hours</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="days"
                        checked={durationType === 'days'}
                        onChange={(e) => setDurationType(e.target.value as 'days')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">Days</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        value="indefinite"
                        checked={durationType === 'indefinite'}
                        onChange={(e) => setDurationType(e.target.value as 'indefinite')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">Keep open until manually closed</span>
                    </label>
                  </div>

                  {durationType !== 'indefinite' && (
                    <div>
                      <input
                        type="number"
                        min={durationType === 'hours' ? 1 : 1}
                        max={durationType === 'hours' ? 72 : 30}
                        value={durationValue}
                        onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                        className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        {durationType === 'hours' ? '(1-72 hours)' : '(1-30 days)'}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">
                        Survey will close on: {formatClosureDate(calculateClosesAt(durationType, durationValue)?.toISOString() || null)}
                      </p>
                    </div>
                  )}

                  {durationType === 'indefinite' && (
                    <p className="text-xs text-slate-500">
                      Survey will remain open until you manually close it
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Enable Name Collection for Giveaways?</h4>
                    <p className="text-xs text-slate-700 mb-2">
                      If you plan to use respondent names for drawings, contests, or follow-up contact, enable this option.
                    </p>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={collectsPii}
                        onChange={(e) => setCollectsPii(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-slate-700">Collect names for giveaways or follow-up</span>
                    </label>
                    {collectsPii && (
                      <input
                        type="text"
                        value={piiPurpose}
                        onChange={(e) => setPiiPurpose(e.target.value)}
                        placeholder="e.g., Monthly prize drawing"
                        className="mt-2 w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Survey Questions</h2>
                  <p className="text-sm text-slate-600 mt-1">Add open-ended questions for your team</p>
                </div>
                <Button type="button" onClick={addQuestion} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Question {index + 1}
                      </label>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, e.target.value)}
                        placeholder="e.g., What's been your biggest challenge this week?"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        maxLength={280}
                      />
                      <div className="text-xs text-slate-500 mt-1">
                        {question.text.length}/280 characters
                      </div>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.id)}
                        className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {questions.length < 10 && (
                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Another Question
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Branding Options</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {isProPlus
                      ? 'Customize the look and feel of your survey'
                      : 'Upgrade to Pro Plus to customize survey branding'
                    }
                  </p>
                </div>
              </div>

              {!isProPlus && (
                <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-lg p-6">
                  <div className="flex items-start">
                    <Palette className="w-6 h-6 text-violet-600 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Pro Plus Feature</h3>
                      <p className="text-sm text-slate-700 mb-4">
                        Unlock custom branding with logo upload, color customization, and white-label options.
                      </p>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => navigate('/billing')}
                      >
                        Upgrade to Pro Plus
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {isProPlus && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-3">
                      Primary Color
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => setPrimaryColor(color.value)}
                          className={`
                            h-12 rounded-lg border-2 transition-all
                            ${primaryColor === color.value
                              ? 'border-slate-900 scale-110'
                              : 'border-slate-200 hover:scale-105'
                            }
                          `}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-12 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Preview</h3>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </button>
                    </div>

                    {showPreview && (
                      <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div
                          className="h-2 w-full rounded-full mb-4"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div className="space-y-4">
                          <div className="flex items-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full" style={{ backgroundColor: primaryColor }} />
                            <div className="ml-3 bg-slate-100 rounded-lg p-3 flex-1">
                              <p className="text-sm text-slate-700">
                                {welcomeMessage || 'Welcome! Please answer the questions honestly.'}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <div className="bg-blue-100 rounded-lg p-3 max-w-xs">
                              <p className="text-sm text-slate-700">Sample response text</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Ready to Launch</h3>
                <p className="text-sm text-slate-700">
                  You're all set! Review your survey details and click "Create Survey" to generate your shareable link.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (currentStep === 1) {
                  navigate('/dashboard');
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2()) ||
                  (currentStep === 2 && !canProceedToStep3())
                }
              >
                Next Step
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button
                  type="submit"
                  variant="outline"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Survey'}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}
