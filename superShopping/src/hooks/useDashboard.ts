import { useCallback, useEffect, useState } from 'react';
import { buildInitialState, simulateRefresh } from '../data/dashboardData';
import type { DashboardState } from '../types/dashboard';

export function useDashboard() {
  const [state, setState] = useState<DashboardState | null>(null);

  useEffect(() => {
    buildInitialState().then(setState);
  }, []);

  const refresh = useCallback(async () => {
    if (!state) return;
    const newState = await simulateRefresh(state);
    setState(newState);
  }, [state]);

  return { state, refresh };
}
