import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../components/Layout/MainLayout';
import { SignInPage, SignUpPage } from '../features/auth';

export const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />

            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}