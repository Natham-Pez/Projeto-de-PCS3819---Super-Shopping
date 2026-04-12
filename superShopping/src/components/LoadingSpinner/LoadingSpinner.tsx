import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message = 'Carregando dados...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.spinner}></div>
      <div className={styles.text}>{message}</div>
    </div>
  );
}
