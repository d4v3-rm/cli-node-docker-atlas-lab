import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboard';

export function DashboardApp() {
  return (
    <Routes>
      <Route element={<DashboardPage />} path="/" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
