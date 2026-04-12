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
async function buildPowerFactor(): Promise<MetricBarItem> {
  const now = new Date();
  const fiveSecondsAgo = new Date(now.getTime() - (10 * 1000));

  const offset = now.getTimezoneOffset() * 60000;
  const to_time = new Date(now.getTime() - offset).toISOString().split('.')[0];
  const from_time = new Date(fiveSecondsAgo.getTime() - offset).toISOString().split('.')[0];
  const channel = 'lab'

  const url = `/analytics/${channel}/electrical_health?&from_time=${from_time}&to_time=${to_time}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const results = data.results || [];
    const fpRaw = results.length > 0
      ? Math.min(...results.map((res: any) => res.avg_power_factor || 0))
      : 0;
    const fp = parseFloat(fpRaw.toFixed(2));

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
  } catch (error) {
    console.error("Erro ao buscar fator de potência:", error);
    return {
      label: 'Fator de potência',
      value: 0,
      displayValue: '0',
      barPercent: 0,
      barColor: '#E24B4A',
      rangeMin: '0,0',
      rangeMax: '1,0',
      rangeLabel: 'Mínimo: 0,92',
      badgeVariant: 'danger',
      badgeText: '✗ abaixo do mínimo — risco de multa',
    };
  }
}

async function buildDemand(prev: DemandData): Promise<DemandData> {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - (30 * 60 * 1000));

  const offset = now.getTimezoneOffset() * 60000;
  const from_time = new Date(thirtyMinutesAgo.getTime() - offset).toISOString().split('.')[0];
  const channel = 'lab';

  const url = `/${channel}?&from_time=${from_time}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const measurements = data.measurements || [];

    const demRaw = measurements.length > 0 ? (measurements[measurements.length - 1].active_power || 0) : 0;
    const dem = parseFloat(demRaw.toFixed(2));

    // Agrupa por HH:mm para bater com as labels existentes
    const groups: Record<string, number> = {};
    measurements.forEach((m: any) => {
      const d = new Date(m.timestamp);
      const t = formatTime(d);
      groups[t] = m.active_power || 0;
    });

    const history = prev.labels.map(label => parseFloat((groups[label] || 0).toFixed(2)));

    const limit = 200;
    const percent = Math.round((dem / limit) * 100);

    return { value: dem, limit, percent, labels: prev.labels, history };
  } catch (error) {
    console.error("Erro ao buscar demanda:", error);
    return {
      ...prev,
      history: [...prev.history.slice(1), prev.value]
    };
  }
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

async function buildEquipments(): Promise<Equipment[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = startOfDay.getTimezoneOffset() * 60000;
  const from_time = new Date(startOfDay.getTime() - offset).toISOString().split('.')[0];
  const channel = 'lab';

  const url = `/analytics/${channel}/electrical_health?from_time=${from_time}`;
  let labEquipments: Equipment[] = [];

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results) {
      labEquipments = data.results.map((res: any) => {
        const v = res.avg_voltage || 0;
        let status: 'on' | 'off' | 'alert' = 'on';
        let statusLabel = v ? 'ligado' : 'desligado';
        let timeLabel = `${v.toFixed(1)}V (FP ${res.avg_power_factor ? res.avg_power_factor.toFixed(2) : '-'})`;

        if (v < 10) {
          status = 'off';
          statusLabel = 'sem tensão';
        } else if (v < 110 || v > 140) {
          status = 'alert';
          statusLabel = 'alerta tensão';
        }

        const name = res.sensor === 'fase1' ? 'Laboratório — Fase 1' :
          res.sensor === 'fase2' ? 'Laboratório — Fase 2' :
            res.sensor === 'fase3' ? 'Laboratório — Fase 3' : `Laboratório — ${res.sensor}`;

        return { id: res.sensor, name, status, statusLabel, timeLabel };
      });
    }
  } catch (error) {
    console.error("Erro ao buscar equipamentos do laboratório:", error);
  }

  return [...INITIAL_EQUIPMENTS, ...labEquipments];
}

export async function buildInitialState(): Promise<DashboardState> {
  const demLabels = generateTimeLabels(12, 150_000);
  const histLabels = generateTimeLabels(13, 300_000);

  const initialDemand: DemandData = {
    value: 0,
    limit: 200,
    percent: 0,
    labels: demLabels,
    history: Array(12).fill(0),
  };

  return {
    temperature: buildTemperature(23.4),
    occupancy: buildOccupancy(47),
    powerFactor: await buildPowerFactor(),
    demand: await buildDemand(initialDemand),
    history: {
      labels: histLabels,
      temperature: [21.8, 22.1, 22.4, 22.9, 23.1, 23.3, 23.5, 23.8, 23.6, 23.4, 23.2, 23.4, 23.4],
      occupancy: [12, 18, 24, 31, 38, 42, 45, 50, 48, 47, 44, 47, 47],
    },
    equipments: await buildEquipments(),
    lastUpdate: new Date(),
  };
}

// ─── Simulate Update ──────────────────────────────────────────────────────────

export async function simulateRefresh(prev: DashboardState): Promise<DashboardState> {
  const temp = 22 + Math.random() * 4;
  const occ = Math.round(30 + Math.random() * 40);

  return {
    temperature: buildTemperature(temp),
    occupancy: buildOccupancy(occ),
    powerFactor: await buildPowerFactor(),
    demand: await buildDemand(prev.demand),
    history: buildHistory(temp, occ, prev.history),
    equipments: await buildEquipments(),
    lastUpdate: new Date(),
  };
}
