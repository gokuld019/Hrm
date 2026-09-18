'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthorized } = useAuth(requiredRole);
  if (!isAuthorized) return null; // or a loading spinner
  return children;
}