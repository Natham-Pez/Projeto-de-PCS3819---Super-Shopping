import { useState } from 'react';
import { Badge } from '../Badge/Badge';
import { Modal } from '../Modal/Modal';
import type { MetricBarItem } from '../../types/dashboard';
import styles from './MetricBar.module.css';

interface MetricBarProps {
  metric: MetricBarItem;
}

export function MetricBar({ metric }: MetricBarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
      <div className={styles.mcard} onClick={() => setIsModalOpen(true)} role="button" tabIndex={0}>
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
        <div>
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalPanorama}>
          <div className={styles.modalLabel}>{label}</div>
          <div className={styles.modalValue}>{displayValue}</div>

          <div className={styles.modalMeterSection}>
            <div className={styles.modalRange}>
              <span>{rangeMin}</span>
              <span>{rangeLabel}</span>
              <span>{rangeMax}</span>
            </div>
            <div className={styles.modalBarWrap}>
              <div
                className={styles.modalBarFill}
                style={{ width: `${barPercent}%`, background: barColor }}
              />
            </div>
          </div>

          <div className={styles.modalBadgeWrap}>
            <Badge variant={badgeVariant}>{badgeText}</Badge>
          </div>
        </div>
      </Modal>
    </>
  );
}
