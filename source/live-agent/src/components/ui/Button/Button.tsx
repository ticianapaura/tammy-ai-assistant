import type { ButtonHTMLAttributes } from 'react'
import { CheckIcon, SpinnerIcon } from '../icons'
import styles from './Button.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  state?: 'idle' | 'loading' | 'done'
  doneLabel?: string
}

// The survey's accent button. Loading shows only a spinner; done confirms with a check.
function Button({ state = 'idle', doneLabel, children, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      className={[styles.button, className].filter(Boolean).join(' ')}
      disabled={state !== 'idle' || rest.disabled}
      aria-busy={state === 'loading' || undefined}
    >
      {state === 'loading' && (
        <>
          <SpinnerIcon className={styles.spin} />
          <span className="visually-hidden">Sending</span>
        </>
      )}
      {state === 'done' && (
        <>
          {doneLabel}
          <CheckIcon />
        </>
      )}
      {state === 'idle' && children}
    </button>
  )
}

export default Button
