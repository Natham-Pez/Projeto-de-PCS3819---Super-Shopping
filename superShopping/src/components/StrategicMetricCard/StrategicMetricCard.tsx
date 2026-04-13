import { useState } from 'react';
import { Badge } from '../Badge/Badge';
import { Modal } from '../Modal/Modal';
import type { EnergyIntensityMetric, InvoiceForecastMetric, PowerFactorMetric } from '../../types/strategic';
import styles from './StrategicMetricCard.module.css';

// ─── Energy Intensity ─────────────────────────────────────────────────────────

interface EnergyIntensityCardProps {
  metric: EnergyIntensityMetric;
}

export function EnergyIntensityCard({ metric }: EnergyIntensityCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.mcard} onClick={() => setIsModalOpen(true)} role="button" tabIndex={0}>
        <div className={styles.infoContainer}>
          <div className={styles.label}>{metric.label}</div>
          <div className={styles.value}>{metric.value}</div>
          <div className={styles.sub}>{metric.sub}</div>
          <div className={styles.badgeRow}>
            <Badge variant={metric.badgeVariant}>{metric.badgeText}</Badge>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalPanorama}>
          <div className={styles.modalLabel}>{metric.label}</div>
          <div className={styles.modalValue}>{metric.value}</div>
          <div className={styles.modalSub}>{metric.sub}</div>
          <div className={styles.modalBadgeWrap}>
            <Badge variant={metric.badgeVariant}>{metric.badgeText}</Badge>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Invoice Forecast ─────────────────────────────────────────────────────────

interface InvoiceForecastCardProps {
  metric: InvoiceForecastMetric;
}

export function InvoiceForecastCard({ metric }: InvoiceForecastCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.mcard} onClick={() => setIsModalOpen(true)} role="button" tabIndex={0}>
        <div className={styles.infoContainer}>
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
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalPanorama}>
          <div className={styles.modalLabel}>{metric.label}</div>
          <div className={styles.modalValue}>{metric.value}</div>
          <div className={styles.modalSub}>{metric.sub}</div>
          <div className={styles.modalMeterSection}>
            <div className={styles.modalProjBar}>
              <div style={{ width: `${metric.realizedPct}%`, background: '#378ADD' }} />
              <div style={{ width: `${metric.projectedPct}%`, background: '#85B7EB' }} />
              <div style={{ width: `${metric.marginPct}%`, background: '#B5D4F4' }} />
            </div>
            <div className={styles.modalProjLabels}>
              <span>Realizado {metric.realizedPct}%</span>
              <span>Projetado {metric.projectedPct}%</span>
              <span>Margem {metric.marginPct}%</span>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ─── Power Factor Impact ──────────────────────────────────────────────────────

interface PowerFactorImpactCardProps {
  metric: PowerFactorMetric;
}

export function PowerFactorImpactCard({ metric }: PowerFactorImpactCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={styles.mcard} onClick={() => setIsModalOpen(true)} role="button" tabIndex={0}>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.modalPanorama}>
          <div className={styles.modalLabel}>{metric.label}</div>
          <div
            className={styles.modalValue}
            style={{ color: metric.fpOk ? 'var(--color-text-success)' : 'var(--color-text-danger)' }}
          >
            {metric.value}
          </div>
          <div className={styles.modalSub}>
            FP médio: <strong>{metric.avgFp.toFixed(2).replace('.', ',')}</strong> · meta ≥ 0,92
          </div>
          <div className={styles.modalBadgeWrap}>
            <Badge variant={metric.badgeVariant}>{metric.badgeText}</Badge>
          </div>
        </div>
      </Modal>
    </>
  );
}
