import { useEffect, useRef } from 'react';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Badge } from '../Badge/Badge';
import type { InvoicePrediction } from '../../types/strategic';
import styles from './InvoicePredictionCard.module.css';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip);

const GRID_COLOR = '#736ce9ff';
const TICK_COLOR = '#040135ff';

const BR = (n: number) => n.toLocaleString('pt-BR');

interface InvoicePredictionCardProps {
  data: InvoicePrediction;
}

export function InvoicePredictionCard({ data }: InvoicePredictionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { realized, projected, estimated, deltaVsPrev, confidence,
    realizedData, projectedData, dayLabels } = data;

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: dayLabels,
        datasets: [
          {
            label: 'Realizado',
            data: realizedData,
            borderColor: '#378ADD',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.3,
            spanGaps: false,
          },
          {
            label: 'Projetado',
            data: projectedData,
            borderColor: '#85B7EB',
            borderWidth: 1.5,
            borderDash: [5, 4],
            pointRadius: 0,
            fill: false,
            tension: 0.3,
            spanGaps: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            filter: (item) => item.parsed.y != null,
            callbacks: {
              label: (c) =>
                c.parsed.y != null ? `${c.dataset.label}: ${c.parsed.y} kWh` : '',
            },
          },
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 }, maxTicksLimit: 10 },
          },
          y: {
            grid: { color: GRID_COLOR },
            ticks: {
              color: TICK_COLOR,
              font: { size: 11 },
              callback: (v) => `${v}kWh`,
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data.datasets[0].data = realizedData;
    chartRef.current.data.datasets[1].data = projectedData;
    chartRef.current.update();
  }, [realizedData, projectedData]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.cardTitle}>
          Predição de consumo e fechamento de fatura
        </span>
        <Badge variant="info">confiança {confidence}%</Badge>
      </div>

      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Consumo realizado</div>
          <div className={styles.statValue}>{BR(realized)} kWh</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Consumo projetado</div>
          <div className={styles.statValue} style={{ color: 'var(--color-text-info)' }}>
            {BR(projected)} kWh
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Fatura estimada</div>
          <div className={styles.statValue}>R$ {BR(estimated)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Vs. mês anterior</div>
          <div className={styles.statValue} style={{ color: 'var(--color-text-success)' }}>
            ▼ R$ {BR(deltaVsPrev)}
          </div>
        </div>
      </div>
    </div>
  );
}
