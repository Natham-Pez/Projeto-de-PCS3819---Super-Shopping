import { useCallback, useEffect, useState } from 'react';
import { buildStrategicInitialState, simulateStrategicRefresh } from '../data/strategicData';
import type { StrategicDashboardState } from '../types/strategic';

export function useStrategicDashboard() {
  const [state, setState] = useState<StrategicDashboardState | null>(null);

  useEffect(() => {
    buildStrategicInitialState().then(setState);
  }, []);

  const refresh = useCallback(async () => {
    if (!state) return;
    const newState = await simulateStrategicRefresh(state);
    setState(newState);
  }, [state]);

  return { state, refresh };
}
