export type BadgeVariant = 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

export type EquipmentStatus = 'on' | 'off' | 'alert';

export interface MetricBarItem {
  label: string;
  value: number;
  displayValue: string;
  barPercent: number;
  barColor: string;
  rangeMin: string;
  rangeMax: string;
  rangeLabel: string;
  badgeVariant: BadgeVariant;
  badgeText: string;
}

export interface Equipment {
  id: string;
  name: string;
  status: EquipmentStatus;
  statusLabel: string;
  timeLabel: string;
}

export interface DemandData {
  value: number;
  limit: number;
  percent: number;
  labels: string[];
  history: number[];
}

export interface HistoryData {
  labels: string[];
  temperature: number[];
  occupancy: number[];
}

export interface DashboardState {
  temperature: MetricBarItem;
  occupancy: MetricBarItem;
  powerFactor: MetricBarItem;
  demand: DemandData;
  history: HistoryData;
  equipments: Equipment[];
  lastUpdate: Date;
}
