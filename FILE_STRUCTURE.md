# Motiiv - File Structure

## Project Overview

```
motiiv/
├── 📄 Configuration Files
├── 📁 src/ (Application Source)
├── 📁 supabase/ (Database)
└── 📚 Documentation
```

## Complete File Tree

```
motiiv/
│
├── 📄 package.json                    # Dependencies and scripts
├── 📄 package-lock.json               # Locked dependency versions
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 tsconfig.app.json               # App-specific TypeScript config
├── 📄 tsconfig.node.json              # Node-specific TypeScript config
├── 📄 vite.config.ts                  # Vite build configuration
├── 📄 tailwind.config.js              # Tailwind CSS configuration
├── 📄 postcss.config.js               # PostCSS configuration
├── 📄 eslint.config.js                # ESLint rules
├── 📄 .gitignore                      # Git ignore rules
├── 📄 .env                            # Environment variables (Supabase)
├── 📄 index.html                      # HTML entry point
│
├── 📚 README.md                       # Main documentation
├── 📚 QUICK_START.md                  # 5-minute setup guide
├── 📚 PROJECT_SUMMARY.md              # Complete project overview
├── 📚 IMPLEMENTATION_GUIDE.md         # What's done & what's next
├── 📚 AI_INTEGRATION_EXAMPLE.md       # AI implementation code
├── 📚 FEATURES_CHECKLIST.md           # Feature status tracking
├── 📚 FILE_STRUCTURE.md               # This file
│
├── 📁 supabase/
│   └── 📁 migrations/
│       └── 📄 20250930175352_create_initial_schema.sql
│           └── Complete database schema with RLS
│
└── 📁 src/
    ├── 📄 main.tsx                    # React entry point
    ├── 📄 App.tsx                     # Main router component
    ├── 📄 index.css                   # Tailwind imports
    ├── 📄 vite-env.d.ts               # Vite type definitions
    │
    ├── 📁 lib/
    │   └── 📄 supabase.ts             # Supabase client singleton
    │
    ├── 📁 types/
    │   ├── 📄 database.ts             # Generated database types
    │   └── 📄 index.ts                # Extended application types
    │
    ├── 📁 utils/
    │   ├── 📄 shortCode.ts            # Survey code generation
    │   └── 📄 format.ts               # Date/time formatting helpers
    │
    ├── 📁 contexts/
    │   └── 📄 AuthContext.tsx         # Authentication context & hooks
    │
    ├── 📁 hooks/                      # (Empty - ready for custom hooks)
    │
    ├── 📁 components/
    │   ├── 📁 shared/
    │   │   ├── 📄 Button.tsx          # Reusable button component
    │   │   ├── 📄 Input.tsx           # Reusable input component
    │   │   └── 📄 TextArea.tsx        # Reusable textarea component
    │   │
    │   ├── 📁 auth/
    │   │   └── 📄 ProtectedRoute.tsx  # Route protection wrapper
    │   │
    │   ├── 📁 manager/
    │   │   └── 📄 ManagerLayout.tsx   # Manager dashboard layout
    │   │
    │   └── 📁 rep/                    # (Rep components in pages/)
    │
    └── 📁 pages/
        ├── 📄 Home.tsx                # Landing/redirect page
        ├── 📄 Landing.tsx             # Marketing landing page
        │
        ├── 📁 auth/
        │   ├── 📄 Login.tsx           # Manager login page
        │   ├── 📄 Register.tsx        # Manager registration page
        │   └── 📄 ForgotPassword.tsx  # Password reset page
        │
        ├── 📁 manager/
        │   ├── 📄 Dashboard.tsx       # Manager dashboard (survey list)
        │   ├── 📄 CreateSurvey.tsx    # Survey creation form
        │   ├── 📄 SurveyDetail.tsx    # Survey overview & responses
        │   └── 📄 ResponseDetail.tsx  # Individual response view
        │
        └── 📁 rep/
            └── 📄 SurveyChat.tsx      # Conversational survey interface
```

## Key Directories Explained

### 📁 `src/lib/`
Third-party library integrations and singletons
- **supabase.ts**: Configured Supabase client

### 📁 `src/types/`
TypeScript type definitions
- **database.ts**: Auto-generated from Supabase schema
- **index.ts**: Extended types for the application

### 📁 `src/utils/`
Pure utility functions
- **shortCode.ts**: Generate/format survey codes
- **format.ts**: Date formatting and text helpers

### 📁 `src/contexts/`
React Context providers
- **AuthContext.tsx**: Authentication state and functions

### 📁 `src/components/shared/`
Reusable UI components used across the app
- **Button.tsx**: Styled button with variants
- **Input.tsx**: Form input with labels and errors
- **TextArea.tsx**: Multi-line input component

### 📁 `src/components/auth/`
Authentication-related components
- **ProtectedRoute.tsx**: Requires authentication

### 📁 `src/components/manager/`
Manager-specific components
- **ManagerLayout.tsx**: Dashboard navigation and layout

### 📁 `src/pages/`
Page-level components (route targets)

### 📁 `src/pages/auth/`
Authentication pages
- Login, Register, Forgot Password flows

### 📁 `src/pages/manager/`
Manager dashboard pages
- Survey CRUD and response viewing

### 📁 `src/pages/rep/`
Team member (rep) pages
- Survey taking interface

## Component Hierarchy

```
App (Router)
├── Home
│   └── Landing (public)
│
├── Auth Pages
│   ├── Login
│   ├── Register
│   └── ForgotPassword
│
└── Protected Routes
    └── ManagerLayout
        ├── Dashboard
        │   └── Survey Cards
        │
        ├── CreateSurvey
        │   └── Question Builder
        │
        ├── SurveyDetail
        │   └── Response List
        │
        └── ResponseDetail
            └── Q&A Display

Public Routes
└── SurveyChat
    ├── Name Entry
    ├── Chat Interface
    └── Completion Screen
```

## Data Flow

```
User Action
    ↓
Component
    ↓
Supabase Client (lib/supabase.ts)
    ↓
Database (with RLS)
    ↓
Response
    ↓
Component Update
    ↓
UI Re-render
```

## Import Patterns

### Absolute Imports (from src root)
```typescript
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/shared/Button';
import type { Survey } from '../types';
```

### Relative Imports
Used for adjacent files or same-level modules

## File Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `SurveyChat.tsx`)
- **Utilities**: camelCase (e.g., `shortCode.ts`, `format.ts`)
- **Types**: camelCase (e.g., `database.ts`, `index.ts`)
- **Pages**: PascalCase (e.g., `Dashboard.tsx`, `Login.tsx`)

## Code Organization Principles

1. **Single Responsibility**: Each file has one clear purpose
2. **Colocation**: Related files are grouped together
3. **Reusability**: Shared components in `/shared/`
4. **Type Safety**: Types defined and imported
5. **Clean Imports**: Organized by external → internal

## Future Directories

As the app grows, consider adding:

```
src/
├── 📁 services/          # API service layers
├── 📁 hooks/             # Custom React hooks
├── 📁 constants/         # App-wide constants
├── 📁 config/            # Configuration objects
└── 📁 assets/            # Images, fonts, etc.
```

## Build Output

```
dist/
├── index.html            # Production HTML
├── assets/
│   ├── index-[hash].css  # Compiled styles (~20KB)
│   └── index-[hash].js   # Compiled JavaScript (~350KB)
```

## Total Statistics

- **Total Files**: 24 TypeScript/React files
- **Components**: 10 components
- **Pages**: 9 pages
- **Utilities**: 2 utility files
- **Types**: 2 type files
- **Contexts**: 1 context
- **Database Tables**: 7 tables
- **Lines of Code**: ~3,500
- **Bundle Size**: 356KB (103KB gzipped)

## Quick Navigation

### To modify authentication:
→ `src/contexts/AuthContext.tsx`

### To change database queries:
→ `src/pages/manager/Dashboard.tsx` (or relevant page)

### To update UI components:
→ `src/components/shared/`

### To modify survey flow:
→ `src/pages/rep/SurveyChat.tsx`

### To add new routes:
→ `src/App.tsx`

### To change types:
→ `src/types/index.ts`

### To update database schema:
→ Create new migration in `supabase/migrations/`

## Best Practices Followed

✅ Component composition over inheritance
✅ TypeScript strict mode
✅ Consistent file structure
✅ Clear separation of concerns
✅ Reusable utilities
✅ Type-safe database queries
✅ Protected routes
✅ Context for global state
✅ Responsive design patterns
✅ Error boundaries ready

This structure supports growth while maintaining clarity and maintainability.
