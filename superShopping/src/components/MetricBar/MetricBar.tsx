import { Badge } from '../Badge/Badge';
import type { MetricBarItem } from '../../types/dashboard';
import styles from './MetricBar.module.css';

interface MetricBarProps {
  metric: MetricBarItem;
}

export function MetricBar({ metric }: MetricBarProps) {
  const {
    label,
    displayValue,
    barPercent,
    barColor,
    rangeMin,
    rangeMax,
    rangeLabel,
    badgeVariant,
    badgeText,
  } = metric;

  return (
    <div className={styles.mcard}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{displayValue}</div>
      <div className={styles.barWrap}>
        <div
          className={styles.barFill}
          style={{ width: `${barPercent}%`, background: barColor }}
        />
      </div>
      <div className={styles.rangeRow}>
        <span className={styles.rangeEdge}>{rangeMin}</span>
        <span>{rangeLabel}</span>
        <span className={styles.rangeEdge}>{rangeMax}</span>
      </div>
      <div className={styles.badgeRow}>
        <Badge variant={badgeVariant}>{badgeText}</Badge>
      </div>
    </div>
  );
}
