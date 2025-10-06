interface ResponseData {
  rep_name: string | null;
  created_at: string;
  questions: {
    question_text: string;
  };
  answer_text: string | null;
}

interface SessionData {
  id: string;
  rep_name: string | null;
  created_at: string;
  completed_at: string | null;
  responses: ResponseData[];
  session_summaries?: {
    ai_summary: string;
    action_points: { text: string; priority: string }[];
    key_themes: string[];
  }[];
}

export function exportSurveyToCSV(
  surveyTitle: string,
  sessions: SessionData[]
): void {
  const headers = [
    'Response ID',
    'Rep Name',
    'Started At',
    'Completed At',
    'Question',
    'Answer',
    'AI Summary',
    'Action Points',
    'Key Themes'
  ];

  const rows: string[][] = [];

  sessions.forEach(session => {
    const summary = session.session_summaries?.[0];
    const aiSummary = summary?.ai_summary || 'N/A';
    const actionPoints = summary?.action_points
      ?.map(ap => `[${ap.priority.toUpperCase()}] ${ap.text}`)
      .join(' | ') || 'N/A';
    const keyThemes = summary?.key_themes?.join(', ') || 'N/A';

    if (session.responses && session.responses.length > 0) {
      session.responses.forEach((response, index) => {
        rows.push([
          session.id,
          session.rep_name || 'Anonymous',
          formatDate(session.created_at),
          session.completed_at ? formatDate(session.completed_at) : 'In Progress',
          response.questions.question_text,
          response.answer_text || '(skipped)',
          index === 0 ? aiSummary : '',
          index === 0 ? actionPoints : '',
          index === 0 ? keyThemes : ''
        ]);
      });
    } else {
      rows.push([
        session.id,
        session.rep_name || 'Anonymous',
        formatDate(session.created_at),
        session.completed_at ? formatDate(session.completed_at) : 'In Progress',
        'No responses',
        '',
        aiSummary,
        actionPoints,
        keyThemes
      ]);
    }
  });

  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizeFilename(surveyTitle)}_responses_${formatDateForFilename(new Date())}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSVValue(value: string): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value);

  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0];
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

export function exportAllSurveysToCSV(surveys: any[]): void {
  const headers = [
    'Survey ID',
    'Survey Title',
    'Survey Goal',
    'Status',
    'Created At',
    'Total Responses',
    'Completion Rate',
    'Short Code'
  ];

  const rows = surveys.map(survey => [
    survey.id,
    survey.title,
    survey.goal || 'N/A',
    survey.status,
    formatDate(survey.created_at),
    survey.response_count?.toString() || '0',
    survey.completion_rate ? `${survey.completion_rate}%` : '0%',
    survey.short_code || 'N/A'
  ]);

  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map(row => row.map(escapeCSVValue).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `all_surveys_${formatDateForFilename(new Date())}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
