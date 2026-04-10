import { useCallback, useState } from 'react';
import { buildStrategicInitialState, simulateStrategicRefresh } from '../data/strategicData';
import type { StrategicDashboardState } from '../types/strategic';

export function useStrategicDashboard() {
  const [state, setState] = useState<StrategicDashboardState>(buildStrategicInitialState);

  const refresh = useCallback(() => {
    setState((prev) => simulateStrategicRefresh(prev));
  }, []);

  return { state, refresh };
}
