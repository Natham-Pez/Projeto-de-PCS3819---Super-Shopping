import type { HourlyConsumption } from '../../types/strategic';
import styles from './HourlyConsumptionCard.module.css';

const BR = (n: number) => n.toLocaleString('pt-BR');

interface HourlyConsumptionCardProps {
  data: HourlyConsumption;
}

interface DivRowProps {
  label: string;
  value: string;
  valueStyle?: React.CSSProperties;
}

function DivRow({ label, value, valueStyle }: DivRowProps) {
  return (
    <div className={styles.divRow}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue} style={valueStyle}>{value}</span>
    </div>
  );
}

export function HourlyConsumptionCard({ data }: HourlyConsumptionCardProps) {
  const {
    peak, offPeak, peakPct, offPeakPct,
    activePeak, reactivePeak, activeOffPeak, reactiveOffPeak,
  } = data;

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Consumo por posto horário</div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Ponta (17h–22h)</div>
          <div className={styles.summaryValue} style={{ color: 'var(--color-text-warning)' }}>
            {BR(peak)} kWh
          </div>
          <div className={styles.summaryPct}>{peakPct}% do total</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Fora de ponta</div>
          <div className={styles.summaryValue} style={{ color: 'var(--color-text-success)' }}>
            {BR(offPeak)} kWh
          </div>
          <div className={styles.summaryPct}>{offPeakPct}% do total</div>
        </div>
      </div>

      <div className={styles.sectionTitle}>Distribuição ativo vs. reativo</div>

      <DivRow label="Ativo — ponta" value={`${BR(activePeak)} kWh`} />
      <DivRow
        label="Reativo — ponta"
        value={`${BR(reactivePeak)} kvarh`}
        valueStyle={{ color: 'var(--color-text-warning)' }}
      />
      <DivRow label="Ativo — fora de ponta" value={`${BR(activeOffPeak)} kWh`} />
      <DivRow label="Reativo — fora de ponta" value={`${BR(reactiveOffPeak)} kvarh`} />

      <div className={styles.proportionSection}>
        <div className={styles.proportionLabel}>Proporção ponta / fora de ponta</div>
        <div className={styles.segWrap}>
          <div className={styles.seg} style={{ width: `${peakPct}%`, background: '#BA7517' }} />
          <div className={styles.seg} style={{ width: `${offPeakPct}%`, background: '#1D9E75' }} />
        </div>
        <div className={styles.segLabels}>
          <span style={{ color: '#BA7517' }}>■ Ponta {peakPct}%</span>
          <span style={{ color: '#1D9E75' }}>■ Fora de ponta {offPeakPct}%</span>
        </div>
      </div>
    </div>
  );
}
