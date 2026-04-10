import { useState } from 'react';
import './global.css';
import styles from './App.module.css';
import { DashboardSwitcher } from './components/DashboardSwitcher/DashboardSwitcher';
import { Dashboard } from './components/Dashboard/Dashboard';
import { StrategicDashboard } from './components/StrategicDashboard/StrategicDashboard';
import type { DashboardView } from './components/DashboardSwitcher/DashboardSwitcher';

export default function App() {
  const [view, setView] = useState<DashboardView>('iot');

  return (
    <div className={styles.app}>
      <DashboardSwitcher active={view} onChange={setView} />
      <div className={styles.content}>
        {view === 'iot' ? <Dashboard /> : <StrategicDashboard />}
      </div>
    </div>
  );
}
