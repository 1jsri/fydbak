import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OwnerRoute } from './components/auth/OwnerRoute';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Dashboard } from './pages/manager/Dashboard';
import { CreateSurvey } from './pages/manager/CreateSurvey';
import { CreateSurveyWizard } from './pages/manager/CreateSurveyWizard';
import { SurveyDetail } from './pages/manager/SurveyDetail';
import { ResponseDetail } from './pages/manager/ResponseDetail';
import { Billing } from './pages/manager/Billing';
import { Settings } from './pages/manager/Settings';
import { SurveyChat } from './pages/rep/SurveyChat';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { UserManagement } from './pages/owner/UserManagement';
import { TrialLinks } from './pages/owner/TrialLinks';
import { TrialRedemption } from './pages/TrialRedemption';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/surveys/new"
            element={
              <ProtectedRoute>
                <CreateSurveyWizard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/surveys/create-classic"
            element={
              <ProtectedRoute>
                <CreateSurvey />
              </ProtectedRoute>
            }
          />

          <Route
            path="/surveys/:id"
            element={
              <ProtectedRoute>
                <SurveyDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/surveys/:surveyId/responses/:sessionId"
            element={
              <ProtectedRoute>
                <ResponseDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="/s/:shortCode" element={<SurveyChat />} />

          <Route path="/trial/:code" element={<TrialRedemption />} />

          <Route
            path="/owner"
            element={
              <OwnerRoute>
                <OwnerDashboard />
              </OwnerRoute>
            }
          />

          <Route
            path="/owner/users"
            element={
              <OwnerRoute>
                <UserManagement />
              </OwnerRoute>
            }
          />

          <Route
            path="/owner/trial-links"
            element={
              <OwnerRoute>
                <TrialLinks />
              </OwnerRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
