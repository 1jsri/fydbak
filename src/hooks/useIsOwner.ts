import { useAuth } from '../contexts/AuthContext';

export function useIsOwner(): boolean {
  const { profile } = useAuth();
  const isOwner = profile?.role === 'admin' || profile?.is_site_owner === true;

  console.log('[useIsOwner] Check:', {
    profileExists: !!profile,
    role: profile?.role,
    is_site_owner: profile?.is_site_owner,
    isOwner
  });

  return isOwner;
}
