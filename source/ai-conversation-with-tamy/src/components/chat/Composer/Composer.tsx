import { useId, useLayoutEffect, useRef, useState } from 'react'
import { brand } from '../../../config/brand'
import { SendIcon, WarningIcon } from '../../ui/icons'
import styles from './Composer.module.css'

type ComposerProps = {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  placeholder: string
  disabled?: boolean
}

const SINGLE_LINE_HEIGHT = 28

const graphemes = new Intl.Segmenter(undefined, { granularity: 'grapheme' })

/** Characters as the person sees them: an emoji or an accented letter counts once. */
function countCharacters(text: string) {
  let count = 0
  for (const _ of graphemes.segment(text)) count++
  return count
}

// Where the person writes. Grows with the text, counts characters once the text
// wraps, and blocks sending past brand.maxMessageLength.
function Composer({ value, onChange, onSend, placeholder, disabled = false }: ComposerProps) {
  const max = brand.maxMessageLength
  const fieldRef = useRef<HTMLTextAreaElement>(null)
  const wrapLength = useRef(0)
  const [multiline, setMultiline] = useState(false)
  const helperId = useId()

  const length = countCharacters(value)
  const tooLong = length > max
  const canSend = !disabled && !tooLong && value.trim().length > 0

  useLayoutEffect(() => {
    const field = fieldRef.current
    if (!field) return
    field.style.height = 'auto'
    const wraps = field.scrollHeight > SINGLE_LINE_HEIGHT
    // The multi-line layout is wider, so stay in it until the text is clearly
    // shorter than where it first wrapped; otherwise the field flickers. A line
    // break keeps it multi-line on its own, and removing it goes back to measuring.
    const breaks = value.includes('\n')
    if (!multiline && wraps) wrapLength.current = breaks ? Infinity : value.length
    const next = multiline ? breaks || (value.length > 0 && value.length >= wrapLength.current - 4) : wraps
    if (next !== multiline) setMultiline(next)
    field.style.height = `${Math.min(field.scrollHeight, 120)}px`
  }, [value, multiline])

  const send = () => {
    if (!canSend) return
    onSend(value.trim())
  }

  const classNames = [
    styles.composer,
    multiline && styles.multiline,
    tooLong && styles.error,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ')

  const sendButton = (
    <button
      type="button"
      className={[styles.send, canSend && styles.ready, tooLong && styles.sendError].filter(Boolean).join(' ')}
      aria-label="Send message"
      disabled={!canSend}
      onClick={send}
    >
      <SendIcon />
    </button>
  )

  const counter = (multiline || tooLong) && (
    <span className={styles.counter}>
      {length}/{max}
    </span>
  )

  return (
    <div className={styles.wrap}>
      <div className={classNames}>
        <textarea
          ref={fieldRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          aria-invalid={tooLong || undefined}
          aria-describedby={tooLong ? helperId : undefined}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
        />
        {multiline ? (
          <div className={styles.foot}>
            {counter}
            {sendButton}
          </div>
        ) : (
          <>
            {counter}
            {sendButton}
          </>
        )}
      </div>
      {tooLong && (
        <p id={helperId} className={styles.helper}>
          <WarningIcon />
          Your input exceeds the maximum allowed length!
        </p>
      )}
    </div>
  )
}

export default Composer
