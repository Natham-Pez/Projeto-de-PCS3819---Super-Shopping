import { Badge } from '../Badge/Badge';
import type { EnergyIntensityMetric, InvoiceForecastMetric, PowerFactorMetric } from '../../types/strategic';
import styles from './StrategicMetricCard.module.css';

// ─── Energy Intensity ─────────────────────────────────────────────────────────

interface EnergyIntensityCardProps {
  metric: EnergyIntensityMetric;
}

export function EnergyIntensityCard({ metric }: EnergyIntensityCardProps) {
  return (
    <div className={styles.mcard}>
      <div className={styles.label}>{metric.label}</div>
      <div className={styles.value}>{metric.value}</div>
      <div className={styles.sub}>{metric.sub}</div>
      <div className={styles.badgeRow}>
        <Badge variant={metric.badgeVariant}>{metric.badgeText}</Badge>
      </div>
    </div>
  );
}

// ─── Invoice Forecast ─────────────────────────────────────────────────────────

interface InvoiceForecastCardProps {
  metric: InvoiceForecastMetric;
}

export function InvoiceForecastCard({ metric }: InvoiceForecastCardProps) {
  return (
    <div className={styles.mcard}>
      <div className={styles.label}>{metric.label}</div>
      <div className={styles.value}>{metric.value}</div>
      <div className={styles.sub}>{metric.sub}</div>
      <div className={styles.projBar}>
        <div style={{ width: `${metric.realizedPct}%`, background: '#378ADD' }} />
        <div style={{ width: `${metric.projectedPct}%`, background: '#85B7EB' }} />
        <div style={{ width: `${metric.marginPct}%`, background: '#B5D4F4' }} />
      </div>
      <div className={styles.projLabels}>
        <span>Realizado {metric.realizedPct}%</span>
        <span>Projetado {metric.projectedPct}%</span>
        <span>Margem {metric.marginPct}%</span>
      </div>
    </div>
  );
}

// ─── Power Factor Impact ──────────────────────────────────────────────────────

interface PowerFactorImpactCardProps {
  metric: PowerFactorMetric;
}

export function PowerFactorImpactCard({ metric }: PowerFactorImpactCardProps) {
  return (
    <div className={styles.mcard}>
      <div className={styles.label}>{metric.label}</div>
      <div
        className={styles.value}
        style={{ color: metric.fpOk ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}
      >
        {metric.value}
      </div>
      <div className={styles.sub}>
        FP médio: <strong>{metric.avgFp.toFixed(2).replace('.', ',')}</strong> · meta ≥ 0,92
      </div>
      <div className={styles.badgeRow}>
        <Badge variant={metric.badgeVariant}>{metric.badgeText}</Badge>
      </div>
    </div>
  );
}
