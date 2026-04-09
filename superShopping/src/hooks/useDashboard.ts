import { useCallback, useState } from 'react';
import { buildInitialState, simulateRefresh } from '../data/dashboardData';
import type { DashboardState } from '../types/dashboard';

export function useDashboard() {
  const [state, setState] = useState<DashboardState>(buildInitialState);

  const refresh = useCallback(() => {
    setState((prev) => simulateRefresh(prev));
  }, []);

  return { state, refresh };
}
