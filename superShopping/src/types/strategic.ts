import type { BadgeVariant } from './dashboard';

export interface StrategicMetric {
  label: string;
  value: string;
  sub: string;
  badgeVariant: BadgeVariant;
  badgeText: string;
}

export interface EnergyIntensityMetric extends StrategicMetric {
  occupancy: number;
  kwh: number;
}

export interface InvoiceForecastMetric extends StrategicMetric {
  realizedPct: number;
  projectedPct: number;
  marginPct: number;
}

export interface PowerFactorMetric extends StrategicMetric {
  avgFp: number;
  fpOk: boolean;
}

export interface LoadCurvePoint {
  hour: string;
  value: number;
}

export interface LoadCurveStats {
  peak: number;
  avg: number;
  min: number;
}

export interface HourlyConsumption {
  peak: number;         // kWh — ponta (17h–22h)
  offPeak: number;      // kWh — fora de ponta
  peakPct: number;
  offPeakPct: number;
  activePeak: number;
  reactivePeak: number;
  activeOffPeak: number;
  reactiveOffPeak: number;
}

export interface PowerFactorFinancial {
  fines: number;
  avoided: number;
  balance: number;
  months: string[];
  avoidedHistory: number[];
  finesHistory: number[];
}

export interface InvoicePrediction {
  realized: number;     // kWh
  projected: number;    // kWh
  estimated: number;    // R$
  deltaVsPrev: number;  // R$
  confidence: number;   // %
  realizedData: (number | null)[];
  projectedData: (number | null)[];
  dayLabels: string[];
}

export interface StrategicDashboardState {
  energyIntensity: EnergyIntensityMetric;
  invoiceForecast: InvoiceForecastMetric;
  powerFactorImpact: PowerFactorMetric;
  loadCurve: LoadCurvePoint[];
  loadStats: LoadCurveStats;
  hourlyConsumption: HourlyConsumption;
  powerFactorFinancial: PowerFactorFinancial;
  invoicePrediction: InvoicePrediction;
  lastUpdate: Date;
}
