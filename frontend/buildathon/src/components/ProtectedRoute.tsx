import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type Role } from '../contexts/AuthContext';

interface Props {
  children: ReactNode;
  role?: Role;
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, ready } = useAuth();
  const location = useLocation();

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
