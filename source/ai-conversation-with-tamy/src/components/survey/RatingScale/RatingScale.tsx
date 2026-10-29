import { useRef, type KeyboardEvent } from 'react'
import styles from './RatingScale.module.css'

type RatingScaleProps = {
  value: number | null
  /** Arrow keys move the choice; they never confirm it on their own. */
  onChange: (value: number) => void
  /** A click, Enter or Space confirms the choice. */
  onConfirm: (value: number) => void
}

const scale = [1, 2, 3, 4, 5]

// 1–5 satisfaction scale, a radio group: arrow keys move the choice, a click, Enter
// or Space confirms it.
function RatingScale({ value, onChange, onConfirm }: RatingScaleProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (event: KeyboardEvent, current: number) => {
    const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = Math.min(5, Math.max(1, current + step))
    onChange(next)
    groupRef.current?.querySelectorAll('button')[next - 1]?.focus()
  }

  return (
    <div className={styles.rating}>
      <span className={styles.label} aria-hidden="true">
        Very unsatisfied
      </span>
      <div
        ref={groupRef}
        className={styles.group}
        role="radiogroup"
        aria-label="Satisfaction from 1, very unsatisfied, to 5, very satisfied"
      >
        {scale.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            tabIndex={value === n || (value === null && n === 1) ? 0 : -1}
            className={styles.item}
            onClick={() => {
              onChange(n)
              onConfirm(n)
            }}
            onKeyDown={(event) => onKeyDown(event, n)}
          >
            {n}
          </button>
        ))}
      </div>
      <span className={`${styles.label} ${styles.end}`} aria-hidden="true">
        Very satisfied
      </span>
    </div>
  )
}

export default RatingScale
