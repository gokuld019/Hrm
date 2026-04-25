import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth(requiredRole = null) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (!stored) {
      router.replace('/login');
      return;
    }
    const parsedUser = JSON.parse(stored);
    setUser(parsedUser);
    const role = parsedUser?.role;

    if (requiredRole && role !== requiredRole) {
      const redirectTo = role === 'admin' ? '/Admin/Dashboard' : '/Employee/Dashboard';
      router.replace(redirectTo);
    } else {
      setIsAuthorized(true);
    }
  }, [requiredRole, router]);

  return { isAuthorized, user };
}