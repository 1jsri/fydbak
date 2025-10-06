import { useAuth } from '../contexts/AuthContext';

export function useIsAdmin(): boolean {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return isAdmin;
}
