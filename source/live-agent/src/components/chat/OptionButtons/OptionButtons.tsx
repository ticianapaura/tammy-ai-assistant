import { useState } from 'react'
import styles from './OptionButtons.module.css'

type OptionButtonsProps = {
  count: number
  /** False once the conversation has moved on, so old options can't be picked. */
  active: boolean
  onSelect: (option: number) => void
}

// Numbered quick replies under an answer that lists options.
function OptionButtons({ count, active, onSelect }: OptionButtonsProps) {
  const [picked, setPicked] = useState<number | null>(null)
  const options = Array.from({ length: count }, (_, index) => index + 1)

  return (
    <div className={styles.options} role="group" aria-label="Choose an option">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.option}
          aria-pressed={picked === option}
          disabled={!active || picked !== null}
          onClick={() => {
            setPicked(option)
            onSelect(option)
          }}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default OptionButtons
