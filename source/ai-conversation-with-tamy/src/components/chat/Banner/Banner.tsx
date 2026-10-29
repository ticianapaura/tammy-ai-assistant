import type { ReactNode } from 'react'
import { AlertIcon, ArrowRightIcon, InfoIcon, RetryIcon, SpinnerIcon } from '../../ui/icons'
import styles from './Banner.module.css'

type BannerProps = {
  tone?: 'error' | 'info'
  action?: 'retry' | 'continue'
  /** While the action runs the button shows a spinner and can't be pressed again. */
  busy?: boolean
  onAction?: () => void
  children: ReactNode
}

const actionLabel = { retry: 'Try again', continue: 'Continue' } as const

// A message about the conversation itself: an error with one way out, or the security notice.
function Banner({ tone = 'error', action, busy = false, onAction, children }: BannerProps) {
  const isError = tone === 'error'

  return (
    <div className={isError ? styles.banner : `${styles.banner} ${styles.info}`} role={isError ? 'alert' : 'note'}>
      <span className={styles.icon}>{isError ? <AlertIcon /> : <InfoIcon />}</span>
      <p className={styles.text}>{children}</p>
      {isError && action && (
        <button
          type="button"
          className={styles.action}
          aria-label={actionLabel[action]}
          aria-busy={busy || undefined}
          disabled={busy}
          onClick={onAction}
        >
          {busy ? (
            <SpinnerIcon className={styles.spin} size={18} />
          ) : action === 'retry' ? (
            <RetryIcon />
          ) : (
            <ArrowRightIcon />
          )}
        </button>
      )}
    </div>
  )
}

export default Banner
