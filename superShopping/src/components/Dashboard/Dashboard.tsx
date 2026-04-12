import { MetricBar } from '../MetricBar/MetricBar';
import { DemandCard } from '../DemandCard/DemandCard';
import { EquipmentList } from '../EquipmentList/EquipmentList';
import { HistoryChart } from '../HistoryChart/HistoryChart';
import { useDashboard } from '../../hooks/useDashboard';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { state, isLoading, refresh } = useDashboard();

  if (isLoading || !state) {
    return <LoadingSpinner message="Carregando dados do dashboard..." />;
  }

  const { temperature, occupancy, powerFactor, demand, history, equipments, lastUpdate } = state;

  const formattedTime = lastUpdate.toLocaleTimeString('pt-BR');

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsRow}>
        <MetricBar metric={temperature} />
        <MetricBar metric={occupancy} />
        <MetricBar metric={powerFactor} />
      </div>

      <div className={styles.chartsRow}>
        <DemandCard demand={demand} />
        <EquipmentList equipments={equipments} />
      </div>

      <HistoryChart data={history} />

      <div className={styles.footer}>
        <span className={styles.clock}>Última atualização: {formattedTime}</span>
        <button className={styles.refreshBtn} onClick={refresh}>
          ↻ Simular atualização
        </button>
      </div>
    </div>
  );
}
