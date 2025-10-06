import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useIsOwner } from '../../hooks/useIsOwner';

interface OwnerRouteProps {
  children: ReactNode;
}

export function OwnerRoute({ children }: OwnerRouteProps) {
  const { user, loading, profile } = useAuth();
  const isOwner = useIsOwner();

  console.log('[OwnerRoute] State:', {
    loading,
    hasUser: !!user,
    hasProfile: !!profile,
    isOwner,
    profileRole: profile?.role,
    profileIsOwner: profile?.is_site_owner
  });

  if (loading) {
    console.log('[OwnerRoute] Still loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('[OwnerRoute] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isOwner) {
    console.log('[OwnerRoute] Not owner, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('[OwnerRoute] Access granted!');
  return <>{children}</>;
}
