import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../components/Layout/MainLayout';

export const AppRoutes=() => {
    return(
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />}/>

            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}