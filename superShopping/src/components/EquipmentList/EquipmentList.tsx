import { Badge } from '../Badge/Badge';
import type { BadgeVariant, Equipment } from '../../types/dashboard';
import styles from './EquipmentList.module.css';

const STATUS_DOT_COLOR: Record<Equipment['status'], string> = {
  on: 'var(--color-text-success)',
  off: 'var(--color-background-badge)',
  alert: 'var(--color-text-danger)',
};

const STATUS_BADGE_VARIANT: Record<Equipment['status'], BadgeVariant> = {
  on: 'ok',
  off: 'neutral',
  alert: 'danger',
};

interface EquipmentListProps {
  equipments: Equipment[];
}

export function EquipmentList({ equipments }: EquipmentListProps) {
  return (
    <div className={styles.card}>
      <div className={styles.infoContainer}>
        <div className={styles.cardTitle}>Status de cargas e equipamentos</div>
        <ul className={styles.list}>
          {equipments.map((eq) => (
            <li key={eq.id} className={styles.row}>
              <span
                className={styles.dot}
                style={{ background: STATUS_DOT_COLOR[eq.status] }}
              />
              <span className={styles.name}>{eq.name}</span>
              <Badge variant={STATUS_BADGE_VARIANT[eq.status]}>
                {eq.statusLabel}
              </Badge>
              <span className={styles.time}>{eq.timeLabel}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
