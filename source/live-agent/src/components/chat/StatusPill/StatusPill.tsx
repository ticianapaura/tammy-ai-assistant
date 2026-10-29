import { SpinnerIcon } from '../../ui/icons'
import styles from './StatusPill.module.css'

type StatusPillProps = {
  variant: 'divider' | 'loading'
  text: string
}

// Marks a change in who the person is talking to.
function StatusPill({ variant, text }: StatusPillProps) {
  if (variant === 'loading') {
    return (
      <div className={styles.center} role="status">
        <span className={`${styles.pill} ${styles.loading}`}>
          <SpinnerIcon className={styles.spin} />
          {text}
        </span>
      </div>
    )
  }
  return (
    <div className={styles.divider} role="separator" aria-label={text}>
      <span className={styles.pill}>{text}</span>
    </div>
  )
}

export default StatusPill
