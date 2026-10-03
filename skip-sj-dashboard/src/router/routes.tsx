import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../components/Layout/MainLayout';
import { KanbanBoard } from '../features/dashboard/kanban-pedidos';
import { SignInPage } from '../features/auth/SignInPage';
import { SignUpPage } from '../features/auth/SignUpPage';

export const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />}/>
            
            {/* Rutas Públicas (Auth) */}
            <Route path="/auth/signin" element={<SignInPage />} />
            <Route path="/auth/signup" element={<SignUpPage />} />

            {/* Rutas Privadas (Dashboard) */}
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ordering/kanban" element={<KanbanBoard />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}