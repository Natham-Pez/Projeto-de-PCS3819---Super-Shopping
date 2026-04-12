import { useEffect, useRef } from 'react';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
} from 'chart.js';
import { Badge } from '../Badge/Badge';
import { getDemandBadge } from '../../data/dashboardData';
import type { DemandData } from '../../types/dashboard';
import styles from './DemandCard.module.css';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip);

interface DemandCardProps {
  demand: DemandData;
}

export function DemandCard({ demand }: DemandCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { value, limit, percent, labels, history } = demand;
  const badge = getDemandBadge(percent);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: history,
            borderColor: '#BA7517',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#BA7517',
            fill: true,
            backgroundColor: 'rgba(255, 151, 4, 0.3)',
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `${c.parsed.y} kW` } },
        },
        scales: {
          x: { display: false },
          y: { display: false, min: 100, max: 220 },
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
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = history;
    chartRef.current.update();
  }, [labels, history]);

  return (
    <div className={styles.card}>
      <div className={styles.infoContainer}>
        <div className={styles.cardTitle}>Demanda instantânea vs. limite contratual</div>

        <div className={styles.headerRow}>
          <div>
            <div className={styles.metricLabel}>Demanda atual</div>
            <div className={styles.metricValue}>{value} kW</div>
          </div>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>

        <div className={styles.barWrap}>
          <div
            className={styles.barFill}
            style={{ width: `${percent}%`, background: badge.color }}
          />
        </div>
        <div className={styles.rangeRow}>
          <span>0 kW</span>
          <span>Limite: {limit} kW</span>
        </div>

        <div className={styles.chartSection}>
          <div className={styles.chartLabel}>Últimos 30 min</div>
          <div className={styles.chartWrap}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
