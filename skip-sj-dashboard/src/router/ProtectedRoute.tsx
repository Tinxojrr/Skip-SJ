import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Bloquea las rutas privadas hasta que haya una sesión activa.
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Esperar a que Supabase restaure la sesión antes de decidir
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-zinc-100 dark:bg-[#070709]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace state={{ from: location }} />;
  }

  return <Outlet />;
};