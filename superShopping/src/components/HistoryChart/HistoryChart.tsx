import { useEffect, useRef } from 'react';
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Title,
} from 'chart.js';
import type { HistoryData } from '../../types/dashboard';
import styles from './HistoryChart.module.css';

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Title);

const GRID_COLOR = '#736ce9ff';
const TICK_COLOR = '#040135ff';

interface HistoryChartProps {
  data: HistoryData;
}

export function HistoryChart({ data }: HistoryChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { labels, temperature, occupancy } = data;

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Temperatura',
            data: temperature,
            borderColor: '#378ADD',
            borderWidth: 1.5,
            pointRadius: 2,
            pointBackgroundColor: '#378ADD',
            fill: false,
            tension: 0.35,
            yAxisID: 'y',
          },
          {
            label: 'Ocupação',
            data: occupancy,
            borderColor: '#1D9E75',
            borderWidth: 1.5,
            pointRadius: 2,
            pointBackgroundColor: '#1D9E75',
            fill: false,
            tension: 0.35,
            yAxisID: 'y2',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 11 }, maxTicksLimit: 7, autoSkip: true },
          },
          y: {
            position: 'left',
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 11 }, callback: (v) => `${v}°` },
            title: { display: true, text: '°C', color: TICK_COLOR, font: { size: 11 } },
            min: 18,
            max: 30,
          },
          y2: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: TICK_COLOR, font: { size: 11 }, callback: (v) => `${v}p` },
            title: { display: true, text: 'pessoas', color: TICK_COLOR, font: { size: 11 } },
            min: 0,
            max: 100,
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
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = temperature;
    chartRef.current.data.datasets[1].data = occupancy;
    chartRef.current.update();
  }, [labels, temperature, occupancy]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        Histórico — temperatura e ocupação (última hora)
      </div>
      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} />
      </div>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#378ADD' }} />
          Temperatura (°C)
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#1D9E75' }} />
          Ocupação (pessoas)
        </span>
      </div>
    </div>
  );
}
