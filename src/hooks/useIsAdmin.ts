import { useAuth } from '../contexts/AuthContext';

export function useIsAdmin(): boolean | null {
  const { profile, loading } = useAuth();

  // Wait for loading to finish before deciding
  if (loading) return null;

  const isAdmin = profile?.role === 'admin';
  return isAdmin;
}
