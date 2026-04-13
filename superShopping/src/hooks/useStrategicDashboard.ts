import { useCallback, useEffect, useState } from 'react';
import { buildStrategicInitialState, simulateStrategicRefresh } from '../data/strategicData';
import type { StrategicDashboardState } from '../types/strategic';

export function useStrategicDashboard() {
  const [state, setState] = useState<StrategicDashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    buildStrategicInitialState().then(data => {
      setState(data);
      setIsLoading(false);
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!state) return;
    setIsLoading(true);
    const newState = await simulateStrategicRefresh(state);
    setState(newState);
    setIsLoading(false);
  }, [state]);

  return { state, isLoading, refresh };
}
