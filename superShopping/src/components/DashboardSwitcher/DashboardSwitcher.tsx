import styles from './DashboardSwitcher.module.css';

export type DashboardView = 'iot' | 'strategic';

interface DashboardSwitcherProps {
  active: DashboardView;
  onChange: (view: DashboardView) => void;
}

interface Tab {
  id: DashboardView;
  icon: string;
  label: string;
  sub: string;
}

const TABS: Tab[] = [
  {
    id: 'iot',
    icon: '⚡',
    label: 'IoT em tempo real',
    sub: 'Sensores · Equipamentos · Demanda',
  },
  {
    id: 'strategic',
    icon: '📊',
    label: 'Estratégico',
    sub: 'Fatura · Curva de carga · Indicadores',
  },
];

export function DashboardSwitcher({ active, onChange }: DashboardSwitcherProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onChange(tab.id)}
              aria-pressed={isActive}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabContent}>
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabSub}>{tab.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
