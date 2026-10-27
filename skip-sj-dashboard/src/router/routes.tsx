import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../components/Layout/MainLayout';
import { KanbanBoard } from '../features/dashboard/kanban-pedidos';
import { ProductosPage } from '../features/productos/ProductosPage';
import { HistorialPedidosPage } from '../features/pedidos/HistorialPedidosPage';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';
import { useAuth } from '../context/AuthContext';


export const AppRoutes = () => {
  const { role } = useAuth();
  const defaultHome = role === 'store_admin' ? '/ordering/kanban' : '/dashboard';

  return (
    <Routes>
      <Route path="/" element={<Navigate to={defaultHome} replace />} />
      
      {/* Rutas Públicas (Auth) */}
      <Route path="/auth/signin" element={<SignInPage />} />
      <Route path="/auth/signup" element={<SignUpPage />} />

      {/* Rutas Privadas */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ordering/kanban" element={<KanbanBoard />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/historial" element={<HistorialPedidosPage />} />
      </Route>

      <Route path="*" element={<Navigate to={defaultHome} replace />} />
    </Routes>
  );
};