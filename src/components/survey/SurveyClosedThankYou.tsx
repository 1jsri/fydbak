import { CheckCircle, Home } from 'lucide-react';
import type { Survey } from '../../types';

interface SurveyBranding {
  primary_color: string;
  thank_you_message: string | null;
}

interface Props {
  survey: Survey;
  branding?: SurveyBranding | null;
}

export function SurveyClosedThankYou({ survey, branding }: Props) {
  const thankYouMessage = branding?.thank_you_message ||
    'Thanks for your time! This survey is now closed. Your feedback helps us grow.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {survey.emoji && (
            <div className="text-6xl mb-6 animate-pulse">{survey.emoji}</div>
          )}

          <div
            className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: branding?.primary_color || '#3b82f6' }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {survey.title}
          </h1>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-lg text-slate-700 leading-relaxed">
              {thankYouMessage}
            </p>
          </div>

          {survey.description && (
            <p className="text-sm text-slate-600 mb-6">
              {survey.description}
            </p>
          )}

          <div className="pt-6 border-t border-slate-200">
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: branding?.primary_color || '#3b82f6' }}
            >
              <Home className="w-5 h-5 mr-2" />
              Return to Home
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Powered by <span className="font-semibold">FydBak</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
