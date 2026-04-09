import type {
  BadgeVariant,
  DashboardState,
  DemandData,
  Equipment,
  HistoryData,
  MetricBarItem,
} from '../types/dashboard';

// ─── Time Helpers ─────────────────────────────────────────────────────────────

export function formatTime(date: Date): string {
  return (
    date.getHours().toString().padStart(2, '0') +
    ':' +
    date.getMinutes().toString().padStart(2, '0')
  );
}

export function generateTimeLabels(count: number, intervalMs: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(Date.now() - (count - 1 - i) * intervalMs);
    return formatTime(t);
  });
}

// ─── Metric Builders ──────────────────────────────────────────────────────────

function buildTemperature(temp: number): MetricBarItem {
  const isOk = temp >= 20 && temp <= 26;
  const barPercent = Math.round(((temp - 18) / 12) * 100);
  return {
    label: 'Temperatura ambiente',
    value: temp,
    displayValue: temp.toFixed(1).replace('.', ',') + ' °C',
    barPercent,
    barColor: isOk ? '#378ADD' : '#BA7517',
    rangeMin: '18°C',
    rangeMax: '30°C',
    rangeLabel: 'Conforto: 20–26°C',
    badgeVariant: isOk ? 'ok' : 'warn',
    badgeText: isOk ? '✓ dentro do limite' : '⚠ fora do conforto',
  };
}

function buildOccupancy(occ: number): MetricBarItem {
  const isOk = occ < 80;
  return {
    label: 'Fluxo de ocupação',
    value: occ,
    displayValue: `${occ} pessoas`,
    barPercent: occ,
    barColor: '#1D9E75',
    rangeMin: '0',
    rangeMax: '100',
    rangeLabel: 'Capacidade: 100',
    badgeVariant: isOk ? 'ok' : 'warn',
    badgeText: isOk ? '✓ abaixo da capacidade' : '⚠ alta ocupação',
  };
}

function buildPowerFactor(fp: number): MetricBarItem {
  const isOk = fp >= 0.92;
  return {
    label: 'Fator de potência',
    value: fp,
    displayValue: fp.toFixed(2).replace('.', ','),
    barPercent: Math.round(fp * 100),
    barColor: isOk ? '#1D9E75' : '#E24B4A',
    rangeMin: '0,0',
    rangeMax: '1,0',
    rangeLabel: 'Mínimo: 0,92',
    badgeVariant: isOk ? 'ok' : 'danger',
    badgeText: isOk ? '✓ acima de 0,92' : '✗ abaixo do mínimo — risco de multa',
  };
}

function buildDemand(dem: number, prev: DemandData): DemandData {
  const limit = 200;
  const percent = Math.round((dem / limit) * 100);
  const labels = [...prev.labels.slice(1), formatTime(new Date())];
  const history = [...prev.history.slice(1), dem];
  return { value: dem, limit, percent, labels, history };
}

function buildHistory(temp: number, occ: number, prev: HistoryData): HistoryData {
  return {
    labels: [...prev.labels.slice(1), formatTime(new Date())],
    temperature: [...prev.temperature.slice(1), parseFloat(temp.toFixed(1))],
    occupancy: [...prev.occupancy.slice(1), occ],
  };
}

// ─── Demand Badge ─────────────────────────────────────────────────────────────

export function getDemandBadge(pct: number): { variant: BadgeVariant; text: string; color: string } {
  if (pct >= 95)
    return { variant: 'danger', text: `✗ ${pct}% do limite`, color: '#E24B4A' };
  if (pct >= 85)
    return { variant: 'warn', text: `⚠ ${pct}% do limite`, color: '#BA7517' };
  return { variant: 'ok', text: `✓ ${pct}% do limite`, color: '#1D9E75' };
}

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_EQUIPMENTS: Equipment[] = [
  { id: 'il1', name: 'Iluminação — Piso 1', status: 'on', statusLabel: 'ligado', timeLabel: 'há 3h 12min' },
  { id: 'il2', name: 'Iluminação — Piso 2', status: 'on', statusLabel: 'ligado', timeLabel: 'há 3h 10min' },
  { id: 'il3', name: 'Iluminação — Sala B', status: 'off', statusLabel: 'desligado', timeLabel: 'há 47min' },
  { id: 'pc1', name: 'Computadores — TI', status: 'on', statusLabel: 'ligado', timeLabel: 'há 6h 05min' },
  { id: 'pc2', name: 'Computadores — RH', status: 'on', statusLabel: 'ligado', timeLabel: 'há 5h 48min' },
  { id: 'ac1', name: 'Ar-condicionado — Sala A', status: 'alert', statusLabel: 'alerta', timeLabel: 'ciclos anômalos' },
];

export function buildInitialState(): DashboardState {
  const demLabels = generateTimeLabels(12, 150_000);
  const histLabels = generateTimeLabels(13, 300_000);

  return {
    temperature: buildTemperature(23.4),
    occupancy: buildOccupancy(47),
    powerFactor: buildPowerFactor(0.94),
    demand: {
      value: 182,
      limit: 200,
      percent: 91,
      labels: demLabels,
      history: [155, 162, 170, 168, 174, 178, 180, 183, 185, 181, 184, 182],
    },
    history: {
      labels: histLabels,
      temperature: [21.8, 22.1, 22.4, 22.9, 23.1, 23.3, 23.5, 23.8, 23.6, 23.4, 23.2, 23.4, 23.4],
      occupancy: [12, 18, 24, 31, 38, 42, 45, 50, 48, 47, 44, 47, 47],
    },
    equipments: INITIAL_EQUIPMENTS,
    lastUpdate: new Date(),
  };
}

// ─── Simulate Update ──────────────────────────────────────────────────────────

export function simulateRefresh(prev: DashboardState): DashboardState {
  const temp = 22 + Math.random() * 4;
  const occ = Math.round(30 + Math.random() * 40);
  const fp = 0.88 + Math.random() * 0.12;
  const dem = Math.round(140 + Math.random() * 70);

  return {
    temperature: buildTemperature(temp),
    occupancy: buildOccupancy(occ),
    powerFactor: buildPowerFactor(fp),
    demand: buildDemand(dem, prev.demand),
    history: buildHistory(temp, occ, prev.history),
    equipments: prev.equipments,
    lastUpdate: new Date(),
  };
}
