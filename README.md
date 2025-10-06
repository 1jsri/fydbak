# Motiiv - AI-Powered Conversational Feedback Platform

A modern B2B SaaS platform for gathering honest, high-quality feedback from frontline employees through conversational AI-driven surveys.

## Features

### For Managers
- **Survey Creation**: Build engaging surveys with multiple questions and custom goals
- **Dashboard**: Track all surveys, responses, and completion rates
- **Response Analysis**: View detailed responses with AI-generated summaries
- **Easy Distribution**: Share surveys via unique links or short codes
- **Real-time Stats**: Monitor response counts and completion rates

### For Team Members (Reps)
- **Conversational Interface**: Chat-based survey experience that feels natural
- **Anonymous Option**: Choose to provide feedback anonymously or with a name
- **Mobile Friendly**: Complete surveys on any device
- **Auto-save**: Never lose progress - sessions are automatically saved
- **Privacy First**: Minimal data collection with optional identification

### Technical Features
- **Secure Authentication**: Email/password authentication via Supabase
- **Database**: PostgreSQL with Row Level Security policies
- **Real-time**: Live updates using Supabase real-time capabilities
- **Type-safe**: Full TypeScript implementation
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 compliant with keyboard navigation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. The Supabase connection is already configured in `.env`

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage

### Creating a Survey

1. Register/Login as a manager
2. Click "Create Survey" or "New Survey"
3. Add survey details:
   - Title and description
   - Optional emoji
   - Survey goal (customer insight, performance, etc.)
4. Add questions (minimum 1 required)
5. Save as draft or publish immediately

### Distributing a Survey

1. Open the survey from your dashboard
2. Copy the shareable link or short code
3. Share with your team via email, Slack, or other channels
4. Team members can access via the link or enter the short code

### Taking a Survey (Rep Experience)

1. Visit the survey link (e.g., `/s/ABC123`)
2. Optionally provide your name (anonymous by default)
3. Answer questions one at a time in the chat interface
4. AI may ask follow-up questions for clarity
5. Submit and receive confirmation

### Viewing Responses

1. Navigate to your survey from the dashboard
2. View summary statistics
3. Click on individual responses to see:
   - Full answers to all questions
   - AI-generated summary
   - Suggested action points
   - Response timestamps

## Architecture

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Real-time subscriptions
  - Row Level Security

### Database Schema

#### Key Tables
- `profiles` - User accounts and roles
- `surveys` - Survey metadata and configuration
- `questions` - Survey questions with ordering
- `chat_sessions` - Individual survey sessions
- `responses` - Answers to questions
- `clarifications` - AI follow-up questions and answers
- `session_summaries` - AI-generated summaries

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code
- `npm run typecheck` - Type check without emitting

### Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── manager/       # Manager dashboard components
│   ├── rep/           # Rep survey components
│   └── shared/        # Reusable UI components
├── contexts/          # React contexts
├── hooks/             # Custom React hooks
├── lib/               # Third-party integrations
├── pages/             # Route pages
│   ├── auth/          # Login, register, forgot password
│   ├── manager/       # Manager views
│   └── rep/           # Rep survey interface
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Roadmap

### MVP (Current)
- [x] Manager authentication
- [x] Survey creation and management
- [x] Conversational rep interface
- [x] Response viewing and basic analytics
- [x] Anonymous or named responses
- [x] Mobile responsive design

### Future Enhancements
- [ ] AI clarification engine using OpenAI/Anthropic
- [ ] AI-generated summaries and action points
- [ ] Email/SMS notifications for incomplete surveys
- [ ] Scheduled and recurring surveys
- [ ] Advanced analytics and insights
- [ ] Multi-manager/team support
- [ ] Export to CSV/PDF
- [ ] Slack/Teams integration
- [ ] Custom branding
- [ ] Voice/audio responses

## Security

- All data encrypted in transit (TLS)
- Row Level Security policies on all tables
- Secure password hashing via Supabase Auth
- Anonymous survey responses supported
- CORS policies implemented
- Input validation and sanitization

## Contributing

This is a private project. For questions or feature requests, please contact the project maintainer.

## License

Proprietary - All rights reserved

## Support

For support, please reach out to the development team.

---

Built with React, TypeScript, Supabase, and Tailwind CSS
