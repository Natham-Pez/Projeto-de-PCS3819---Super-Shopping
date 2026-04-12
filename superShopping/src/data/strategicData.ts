import type {
  HourlyConsumption,
  InvoicePrediction,
  LoadCurvePoint,
  LoadCurveStats,
  PowerFactorFinancial,
  PowerFactorMetric,
  EnergyIntensityMetric,
  InvoiceForecastMetric,
  StrategicDashboardState,
} from '../types/strategic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BR = (n: number) => n.toLocaleString('pt-BR');

// const BASE_LOAD = [38, 35, 42, 55, 90, 140, 192, 185, 170, 196, 188, 160];
const LOAD_HOURS = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
const FP_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
const FP_AVOIDED = [820, 960, 1040, 880, 1120, 1000];
const FP_FINES = [0, 120, 0, 220, 0, 0];

// ─── Builders ─────────────────────────────────────────────────────────────────

async function fetchDailyConsumption(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const offset = startOfDay.getTimezoneOffset() * 60000;
  const from_time = new Date(startOfDay.getTime() - offset).toISOString().split('.')[0];

  const channel = 'lab';
  const url = `/analytics/${channel}/consumption?from_time=${from_time}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const results = data.results || [];
    if (results.length > 0) {
      return results.reduce((sum: number, res: any) => sum + (res.total_kwh || 0), 0);
    }
  } catch (error) {
    console.error("Erro ao buscar consumo diário:", error);
  }
  return 0;
}

async function fetchPontaConsumption(): Promise<number> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Ponta é de 17:00 às 22:00
  const pontaStart = new Date(startOfDay.getTime() + 17 * 60 * 60 * 1000);
  const pontaEnd = new Date(startOfDay.getTime() + 22 * 60 * 60 * 1000);

  if (now < pontaStart) {
    return 0; // Se o horário de ponta ainda não começou, é 0.
  }

  const offset = startOfDay.getTimezoneOffset() * 60000;
  const from_time = new Date(pontaStart.getTime() - offset).toISOString().split('.')[0];
  const to_time = new Date(pontaEnd.getTime() - offset).toISOString().split('.')[0];

  const channel = 'lab';
  const url = `/analytics/${channel}/consumption?from_time=${from_time}&to_time=${to_time}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const results = data.results || [];
    if (results.length > 0) {
      return results.reduce((sum: number, res: any) => sum + (res.total_kwh || 0), 0);
    }
  } catch (error) {
    console.error("Erro ao buscar consumo ponta:", error);
  }
  return 0;
}

function buildEnergyIntensity(occ: number, kwh: number): EnergyIntensityMetric {
  const ie = kwh / occ;
  const iePrev = (kwh * 1.06) / occ;
  const delta = Math.round((1 - ie / iePrev) * 100);
  return {
    label: 'Intensidade energética',
    value: ie.toFixed(2).replace('.', ',') + ' kWh/pessoa',
    sub: `hoje · ${occ} pessoas · ${kwh.toFixed(1).replace('.', ',')} kWh`,
    badgeVariant: 'ok',
    badgeText: `▼ ${delta}% vs. semana passada`,
    occupancy: occ,
    kwh,
  };
}

function buildInvoiceForecast(fatura: number): InvoiceForecastMetric {
  return {
    label: 'Previsão de fatura',
    value: 'R$ ' + BR(fatura),
    sub: 'estimativa para fechamento em 12 dias',
    badgeVariant: 'ok',
    badgeText: '',
    realizedPct: 62,
    projectedPct: 24,
    marginPct: 14,
  };
}

async function fetchCurrentFP(): Promise<number> {
  const now = new Date();
  const tenSecondsAgo = new Date(now.getTime() - (10 * 1000));
  const offset = now.getTimezoneOffset() * 60000;
  const to_time = new Date(now.getTime() - offset).toISOString().split('.')[0];
  const from_time = new Date(tenSecondsAgo.getTime() - offset).toISOString().split('.')[0];
  const channel = 'lab';
  const url = `/analytics/${channel}/electrical_health?&from_time=${from_time}&to_time=${to_time}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const results = data.results || [];
    if (results.length > 0) {
      const fpRaw = results.reduce((sum: number, res: any) => sum + (res.avg_power_factor || 0), 0) / results.length;
      return parseFloat(fpRaw.toFixed(2));
    }
  } catch (error) {
    console.error("Erro ao buscar FP da API:", error);
  }
  return 0.94; // Fallback
}

async function buildPowerFactor(fp: number, evit: number, multa: number): Promise<PowerFactorMetric> {
  const fpOk = fp >= 0.92;
  return {
    label: 'Impacto FP — mês atual',
    value: fpOk
      ? `+R$ ${BR(evit)} evitados`
      : `−R$ ${BR(multa)} em multas`,
    sub: `FP médio: ${fp.toFixed(2).replace('.', ',')} · meta ≥ 0,92`,
    badgeVariant: fpOk ? 'ok' : 'danger',
    badgeText: fpOk ? '✓ sem multas no mês' : '✗ multa acumulada',
    avgFp: fp,
    fpOk,
  };
}

async function buildLoadCurve(): Promise<{ curve: LoadCurvePoint[]; stats: LoadCurveStats }> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const offset = now.getTimezoneOffset() * 60000;
  const to_time = new Date(now.getTime() - offset).toISOString().split('.')[0];
  const from_time = new Date(startOfDay.getTime() - offset).toISOString().split('.')[0];

  const channel = 'lab';
  const url = `/${channel}?&from_time=${from_time}&to_time=${to_time}`;
  console.log('http://143.107.102.8:8090' + url);

  try {
    const response = await fetch(url);
    const data = await response.json();
    const measurements = data.measurements || [];

    // Agrupa medições por timestamp e soma a potência ativa das fases
    const momentSums: Record<string, number> = {};
    measurements.forEach((m: any) => {
      const t = m.timestamp;
      momentSums[t] = (momentSums[t] || 0) + (m.active_power || 0);
    });

    const values = Object.values(momentSums);
    const peak = values.length > 0 ? Math.max(...values) : 0;
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const min = values.length > 0 ? Math.min(...values) : 0;

    // Mapeia os dados para os 12 buckets de 2 horas (00h, 02h... 22h)
    const buckets: number[] = Array(12).fill(0);
    const counts: number[] = Array(12).fill(0);

    Object.entries(momentSums).forEach(([ts, val]) => {
      const hour = new Date(ts).getHours();
      const bucketIdx = Math.floor(hour / 2);
      if (bucketIdx >= 0 && bucketIdx < 12) {
        buckets[bucketIdx] += val;
        counts[bucketIdx]++;
      }
    });

    const curve: LoadCurvePoint[] = LOAD_HOURS.map((hour, i) => ({
      hour,
      value: counts[i] > 0 ? parseFloat((buckets[i] / counts[i]).toFixed(1)) : 0,
    }));

    return {
      curve,
      stats: {
        peak: Math.round(peak),
        avg: Math.round(avg),
        min: Math.round(min),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar curva de carga:", error);
    return {
      curve: LOAD_HOURS.map(hour => ({ hour, value: 0 })),
      stats: { peak: 0, avg: 0, min: 0 },
    };
  }
}

function buildHourlyConsumption(totalKwh: number, pontaKwh: number): HourlyConsumption {
  const ponta = Math.round(pontaKwh);
  const fora = Math.max(0, Math.round(totalKwh - ponta));

  const peakPct = totalKwh > 0 ? Math.round((ponta / totalKwh) * 100) : 0;
  const offPeakPct = totalKwh > 0 ? 100 - peakPct : 0;

  return {
    peak: ponta,
    offPeak: fora,
    peakPct,
    offPeakPct,
    activePeak: Math.round(ponta * 0.96),
    reactivePeak: Math.round(ponta * 0.04 * 10),
    activeOffPeak: Math.round(fora * 0.97),
    reactiveOffPeak: Math.round(fora * 0.03 * 10),
  };
}

function buildPowerFactorFinancial(
  avoidedHistory: number[],
  finesHistory: number[],
): PowerFactorFinancial {
  const avoided = avoidedHistory.reduce((a, b) => a + b, 0);
  const fines = finesHistory.reduce((a, b) => a + b, 0);
  return {
    fines,
    avoided,
    balance: avoided - fines,
    months: FP_MONTHS,
    avoidedHistory,
    finesHistory,
  };
}

function buildInvoicePrediction(realKwh: number, projKwh: number): InvoicePrediction {
  const days = Array.from({ length: 30 }, (_, i) => String(i + 1));
  const realPoints = Array.from({ length: 18 }, (_, i) =>
    Math.round(520 + i * 42 + Math.random() * 40),
  );
  const projPoints = Array.from({ length: 12 }, (_, i) =>
    Math.round(realPoints[17] + (i + 1) * 38),
  );

  const realData: (number | null)[] = [...realPoints, ...Array(12).fill(null)];
  const projData: (number | null)[] = [
    ...Array(17).fill(null),
    realPoints[17],
    ...projPoints,
  ];

  return {
    realized: realKwh,
    projected: projKwh,
    estimated: Math.round(projKwh * 1.01),
    deltaVsPrev: Math.round(400 + Math.random() * 600),
    confidence: 87,
    realizedData: realData,
    projectedData: projData,
    dayLabels: days,
  };
}

// ─── Initial State ────────────────────────────────────────────────────────────

export async function buildStrategicInitialState(): Promise<StrategicDashboardState> {
  const occ = 312;
  const realKwh = 11240;
  const projKwh = 18100;

  const [kwh, pontaKwh, fp, loadCurveData] = await Promise.all([
    fetchDailyConsumption(),
    fetchPontaConsumption(),
    fetchCurrentFP(),
    buildLoadCurve()
  ]);

  const fpOk = fp >= 0.92;
  const evit = fpOk ? 1120 : 0;
  const multa = fpOk ? 0 : 450;

  return {
    energyIntensity: buildEnergyIntensity(occ, kwh),
    invoiceForecast: buildInvoiceForecast(18240),
    powerFactorImpact: await buildPowerFactor(fp, evit, multa),
    loadCurve: loadCurveData.curve,
    loadStats: loadCurveData.stats,
    hourlyConsumption: buildHourlyConsumption(kwh, pontaKwh),
    powerFactorFinancial: buildPowerFactorFinancial(FP_AVOIDED, FP_FINES),
    invoicePrediction: buildInvoicePrediction(realKwh, projKwh),
    lastUpdate: new Date(),
  };
}

// ─── Simulate Refresh ─────────────────────────────────────────────────────────

export async function simulateStrategicRefresh(
  prev: StrategicDashboardState,
): Promise<StrategicDashboardState> {
  const occ = Math.round(280 + Math.random() * 80);
  const realKwh = Math.round(10000 + Math.random() * 2500);
  const projKwh = Math.round(realKwh * 1.6 + Math.random() * 1000);
  const fatura = Math.round(projKwh * 1.01);

  const [kwh, pontaKwh, fp, loadCurveData] = await Promise.all([
    fetchDailyConsumption(),
    fetchPontaConsumption(),
    fetchCurrentFP(),
    buildLoadCurve()
  ]);

  const fpOk = fp >= 0.92;
  const evit = fpOk ? Math.round(900 + Math.random() * 400) : 0;
  const multa = fpOk ? 0 : Math.round(200 + Math.random() * 600);

  const newAvoided = [...prev.powerFactorFinancial.avoidedHistory.slice(1), evit];
  const newFines = [...prev.powerFactorFinancial.finesHistory.slice(1), multa];

  return {
    energyIntensity: buildEnergyIntensity(occ, kwh),
    invoiceForecast: buildInvoiceForecast(fatura),
    powerFactorImpact: await buildPowerFactor(fp, evit, multa),
    loadCurve: loadCurveData.curve,
    loadStats: loadCurveData.stats,
    hourlyConsumption: buildHourlyConsumption(kwh, pontaKwh),
    powerFactorFinancial: buildPowerFactorFinancial(newAvoided, newFines),
    invoicePrediction: buildInvoicePrediction(realKwh, projKwh),
    lastUpdate: new Date(),
  };
}
