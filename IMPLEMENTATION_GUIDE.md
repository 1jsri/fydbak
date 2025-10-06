# Motiiv Implementation Guide

## What's Been Built

This is a fully functional MVP of the Motiiv AI Survey Platform. Here's what's implemented:

### ✅ Completed Features

#### Database & Backend
- Complete PostgreSQL schema with 7 tables
- Row Level Security policies for all tables
- Supabase authentication integration
- Auto-save and session management
- Indexes for optimal query performance

#### Manager Features
- User registration and authentication
- Survey creation with questions
- Survey dashboard with filtering
- Response viewing and management
- Survey link/code sharing
- Survey status management (draft, active, archived)

#### Rep (Team Member) Features
- Conversational chat interface
- Anonymous or named responses
- Auto-save session state
- Progress tracking
- Mobile-responsive design
- Survey completion confirmation

#### UI/UX
- Modern, clean design using Tailwind CSS
- Fully responsive (mobile, tablet, desktop)
- Loading states and error handling
- Smooth animations and transitions
- Accessible keyboard navigation
- Marketing landing page

## What Still Needs Implementation

### High Priority

#### 1. AI Clarification Engine
**Status**: Placeholder only - needs implementation

The conversational AI that asks follow-up questions is not yet implemented. You'll need to:

1. Choose an AI provider (OpenAI, Anthropic Claude, etc.)
2. Create a Supabase Edge Function to handle AI requests
3. Implement logic to:
   - Analyze answer quality
   - Generate follow-up questions
   - Limit to 2 clarifications per question
   - Flag responses needing manager follow-up

**Recommended Implementation**:
```typescript
// Create: supabase/functions/analyze-response/index.ts
// This function should:
// 1. Receive the question and answer
// 2. Call AI API to analyze quality
// 3. Generate clarification if needed
// 4. Return clarification prompt or approval
```

#### 2. AI Summary Generation
**Status**: Not implemented

After survey completion, AI should generate:
- 1 paragraph summary
- 2-3 action points
- Optional: honesty score (internal only)
- Optional: key themes

**Implementation needed**:
```typescript
// Create: supabase/functions/generate-summary/index.ts
// Call this when session status changes to "completed"
```

#### 3. Data Export (CSV)
**Status**: Button exists but not functional

Implement CSV export for survey responses:
```typescript
// Add to: src/pages/manager/SurveyDetail.tsx
// Function to convert responses to CSV format
// Include all questions, answers, and summaries
```

### Medium Priority

#### 4. Email Notifications
**Status**: Not in MVP

Future enhancement for:
- Incomplete survey reminders
- New response notifications for managers
- Survey distribution emails

#### 5. Skip Question Flow
**Status**: Basic structure in place, needs refinement

Current flow allows skipping but could be improved:
- Add confirmation prompt
- Track skip reasons
- Show skipped questions to managers

#### 6. Survey Editing
**Status**: Not implemented

Currently, surveys cannot be edited after creation. Add:
- Edit survey details
- Add/remove/reorder questions
- Version tracking

### Low Priority (Post-MVP)

- Multi-organization support
- Team management
- Recurring/scheduled surveys
- Advanced analytics and charts
- Slack/Teams integration
- Custom branding
- Multi-language support

## Integration Steps

### Step 1: Set Up AI Service

1. Choose your AI provider (recommended: OpenAI GPT-4 or Anthropic Claude)
2. Get API credentials
3. Add to Supabase Edge Function secrets

### Step 2: Create Edge Functions

Create two edge functions:

**Function 1: analyze-response**
- Endpoint: `/functions/v1/analyze-response`
- Purpose: Check if answer needs clarification
- Input: `{ question, answer, attemptNumber }`
- Output: `{ needsClarification, clarificationPrompt }`

**Function 2: generate-summary**
- Endpoint: `/functions/v1/generate-summary`
- Purpose: Generate summary after completion
- Input: `{ sessionId }`
- Output: `{ summary, actionPoints, honestyScore }`

### Step 3: Update Rep Chat Interface

Modify `src/pages/rep/SurveyChat.tsx`:

```typescript
// After user submits answer:
const { needsClarification, clarificationPrompt } =
  await callEdgeFunction('analyze-response', {
    question: currentQuestion.question_text,
    answer: inputValue,
    attemptNumber: clarificationCount
  });

if (needsClarification && clarificationCount < 2) {
  // Show clarification prompt
  // Increment clarificationCount
} else {
  // Move to next question
}
```

### Step 4: Trigger Summary Generation

Add trigger when session completes:

```typescript
// In completeSession() function:
await callEdgeFunction('generate-summary', {
  sessionId: session.id
});
```

### Step 5: Implement CSV Export

Add export functionality:

```typescript
function exportToCSV(sessions: SessionWithSummary[]) {
  // Convert to CSV format
  // Download file
}
```

## Testing Checklist

- [ ] Manager can register and log in
- [ ] Manager can create survey with questions
- [ ] Survey link is generated correctly
- [ ] Rep can access survey via link
- [ ] Rep can complete survey
- [ ] Responses are saved to database
- [ ] Manager can view responses
- [ ] Session auto-saves on page refresh
- [ ] Mobile responsive on all pages
- [ ] All routes are protected appropriately

## Environment Variables

Current variables (already configured):
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Additional variables needed for AI:
```
# Add to Supabase Edge Function secrets:
OPENAI_API_KEY=your-openai-key
# or
ANTHROPIC_API_KEY=your-anthropic-key
```

## Database Migrations

All migrations are in: `/tmp/cc-agent/57791936/project/supabase/migrations/`

To apply to a new Supabase project:
1. The migration has already been applied to the current database
2. For new instances, use Supabase CLI or the migration tool

## Support & Next Steps

This MVP provides a solid foundation. The core user flows work end-to-end. The main enhancement needed is the AI integration for clarifications and summaries.

Recommended next steps:
1. Set up AI provider account
2. Create the two edge functions
3. Test clarification flow
4. Test summary generation
5. Add CSV export
6. Beta test with real users

Good luck! The hard part (architecture, auth, database, UI) is done.
