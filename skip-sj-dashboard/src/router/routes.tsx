import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard';
import { MainLayout } from '../components/Layout/MainLayout';
import { KanbanBoard } from '../features/dashboard/kanban-pedidos';


export const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />}/>

            {/* Todo lo que esté dentro de este Route compartirá el MainLayout (Sidebar, Header, etc.) */}
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                
              {/* 2. RUTA DEL NAVEGADOR: Coincide con lo que hace el Sidebar */}
                <Route path="/ordering/kanban" element={<KanbanBoard />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}