import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import TankDetailPage from './pages/TankDetailPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="tank/:id" element={<TankDetailPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}