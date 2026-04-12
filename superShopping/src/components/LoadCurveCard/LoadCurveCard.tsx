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
import type { LoadCurvePoint, LoadCurveStats } from '../../types/strategic';
import styles from './LoadCurveCard.module.css';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Filler, Tooltip);

const GRID_COLOR = '#736ce9ff';
const TICK_COLOR = '#040135ff';
const DEMAND_LIMIT = 200;

const BR = (n: number) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface LoadCurveCardProps {
  curve: LoadCurvePoint[];
  stats: LoadCurveStats;
}

export function LoadCurveCard({ curve, stats }: LoadCurveCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const labels = curve.map((p) => p.hour);
  const data = curve.map((p) => p.value);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: '#378ADD',
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: '#378ADD',
            fill: true,
            backgroundColor: 'rgba(55,138,221,0.08)',
            tension: 0.4,
          },
          {
            data: Array(labels.length).fill(DEMAND_LIMIT),
            borderColor: '#E24B4A',
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (c) => (c.datasetIndex === 0 ? `${BR(c.parsed.y)} kW` : ''),
            },
            filter: (item) => item.datasetIndex === 0,
          },
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { 
              color: TICK_COLOR, 
              font: { size: 11 },
              callback: function(val, index) {
                return index % 2 === 0 ? this.getLabelForValue(val as number) : '';
              }
            },
          },
          y: {
            min: 0,
            max: 230,
            grid: { color: GRID_COLOR },
            ticks: {
              color: TICK_COLOR,
              font: { size: 11 },
              callback: (v) => `${v}kW`,
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
    chartRef.current.data.datasets[0].data = data;
    chartRef.current.update();
  }, [data]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.cardTitle}>Curva de carga — hoje</span>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendLine} style={{ background: '#378ADD' }} />
            Demanda (kW)
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDash} />
            Limite 200 kW
          </span>
        </div>
      </div>

      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Pico</div>
          <div className={styles.statValue}>{BR(stats.peak)} kW</div>
          <div className={styles.statSub}>às 12h15</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Média</div>
          <div className={styles.statValue}>{BR(stats.avg)} kW</div>
          <div className={styles.statSub}>das 06h–22h</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Mínima</div>
          <div className={styles.statValue}>{BR(stats.min)} kW</div>
          <div className={styles.statSub}>às 03h30</div>
        </div>
      </div>
    </div>
  );
}
