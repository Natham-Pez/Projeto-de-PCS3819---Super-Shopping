import { useEffect, useRef } from 'react';
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';
import type { PowerFactorFinancial } from '../../types/strategic';
import styles from './PowerFactorImpactCard.module.css';

Chart.register(BarElement, BarController, CategoryScale, LinearScale, Tooltip);

const GRID_COLOR = '#736ce9ff';
const TICK_COLOR = '#040135ff';

const BR = (n: number) => n.toLocaleString('pt-BR');

interface PowerFactorImpactCardProps {
  data: PowerFactorFinancial;
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

export function PowerFactorImpactCard({ data }: PowerFactorImpactCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { months, avoidedHistory, finesHistory, fines, avoided, balance } = data;

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          {
            label: 'Custos evitados',
            data: avoidedHistory,
            backgroundColor: 'rgba(29,158,117,0.7)',
            borderRadius: 4,
          },
          {
            label: 'Multas pagas',
            data: finesHistory,
            backgroundColor: 'rgba(226,75,74,0.7)',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => `R$ ${c.parsed.y}` } },
        },
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 11 } },
          },
          y: {
            grid: { color: GRID_COLOR },
            ticks: {
              color: TICK_COLOR,
              font: { size: 11 },
              callback: (v) => `R$${v}`,
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
    chartRef.current.data.datasets[0].data = avoidedHistory;
    chartRef.current.data.datasets[1].data = finesHistory;
    chartRef.current.update();
  }, [avoidedHistory, finesHistory]);

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        Impacto financeiro do fator de potência — últimos 6 meses
      </div>

      <div className={styles.chartWrap}>
        <canvas ref={canvasRef} />
      </div>

      <div className={styles.summary}>
        <DivRow
          label="Multas pagas"
          value={`R$ ${BR(fines)}`}
          valueStyle={{ color: 'var(--color-text-danger)' }}
        />
        <DivRow
          label="Custos evitados"
          value={`R$ ${BR(avoided)}`}
          valueStyle={{ color: 'var(--color-text-success)' }}
        />
        <DivRow
          label="Saldo líquido"
          value={`+R$ ${BR(balance)}`}
          valueStyle={{ color: 'var(--color-text-success)' }}
        />
      </div>
    </div>
  );
}
