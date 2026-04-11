import { useStrategicDashboard } from '../../hooks/useStrategicDashboard';
import {
  EnergyIntensityCard,
  InvoiceForecastCard,
  PowerFactorImpactCard,
} from '../StrategicMetricCard/StrategicMetricCard';
import { LoadCurveCard } from '../LoadCurveCard/LoadCurveCard';
import { HourlyConsumptionCard } from '../HourlyConsumptionCard/HourlyConsumptionCard';
import { PowerFactorImpactCard as PowerFactorImpactChartCard } from '../PowerFactorImpactCard/PowerFactorImpactCard';
import { InvoicePredictionCard } from '../InvoicePredictionCard/InvoicePredictionCard';
import styles from './StrategicDashboard.module.css';

export function StrategicDashboard() {
  const { state, refresh } = useStrategicDashboard();

  if (!state) {
    return <div className={styles.loading}>Carregando indicadores estratégicos...</div>;
  }

  const {
    energyIntensity,
    invoiceForecast,
    powerFactorImpact,
    loadCurve,
    loadStats,
    hourlyConsumption,
    powerFactorFinancial,
    invoicePrediction,
    lastUpdate,
  } = state;

  return (
    <div className={styles.dashboard}>
      <div className={styles.metricsRow}>
        <EnergyIntensityCard metric={energyIntensity} />
        <InvoiceForecastCard metric={invoiceForecast} />
        <PowerFactorImpactCard metric={powerFactorImpact} />
      </div>

      <LoadCurveCard curve={loadCurve} stats={loadStats} />

      <div className={styles.bottomRow}>
        <HourlyConsumptionCard data={hourlyConsumption} />
        <PowerFactorImpactChartCard data={powerFactorFinancial} />
      </div>

      <InvoicePredictionCard data={invoicePrediction} />

      <div className={styles.footer}>
        <span className={styles.clock}>
          Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
        </span>
        <button className={styles.refreshBtn} onClick={refresh}>
          ↻ Simular novo ciclo
        </button>
      </div>
    </div>
  );
}
