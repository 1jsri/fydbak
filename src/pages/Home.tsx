import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Landing } from './Landing';
import { Loader2 } from 'lucide-react';

export function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Landing />;
}
