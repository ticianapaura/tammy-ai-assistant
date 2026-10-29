import { useEffect, useRef, useState } from 'react'
import { brand } from '../../../config/brand'
import Button from '../../ui/Button/Button'
import { CheckCircleIcon, CloseIcon, XCircleIcon } from '../../ui/icons'
import RatingScale from '../RatingScale/RatingScale'
import styles from './SatisfactionSurvey.module.css'

type Step = 'rating' | 'comment' | 'sending' | 'sent' | 'failed'

type SatisfactionSurveyProps = {
  /** Resolves true when the feedback was saved. */
  onSubmit: (feedback: { rating: number; comment: string }) => Promise<boolean>
  onClose: () => void
}

const QUESTION = 'How satisfied are you with your recent support experience?'

// Shown after a live chat session ends: rating → comment → sending → result.
function SatisfactionSurvey({ onSubmit, onClose }: SatisfactionSurveyProps) {
  const [step, setStep] = useState<Step>('rating')
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const advance = useRef<number | undefined>(undefined)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => () => window.clearTimeout(advance.current), [])

  // Each step replaces the control that had focus; move it to the new step's title so
  // keyboard and screen reader users stay in the survey instead of starting over.
  const shownStep = useRef(step)
  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    const section = sectionRef.current
    if (!section) return
    const focused = document.activeElement
    if (focused && focused !== document.body && !section.contains(focused)) return
    section.querySelector<HTMLElement>('h2')?.focus()
  }, [step])

  const choose = (value: number) => {
    setRating(value)
    // A short pause lets the person see their choice before the comment step.
    window.clearTimeout(advance.current)
    advance.current = window.setTimeout(() => setStep('comment'), 350)
  }

  const submit = async () => {
    if (rating === null) return
    setStep('sending')
    const saved = await onSubmit({ rating, comment: comment.trim() })
    setStep(saved ? 'sent' : 'failed')
  }

  return (
    <section ref={sectionRef} className={styles.survey} aria-label="Satisfaction survey">
      <button type="button" className={styles.close} aria-label="Close survey" onClick={onClose}>
        <CloseIcon size={14} />
      </button>

      {step === 'rating' && (
        <>
          <h2 className={styles.title} tabIndex={-1}>{QUESTION}</h2>
          <RatingScale value={rating} onChange={setRating} onConfirm={choose} />
        </>
      )}

      {(step === 'comment' || step === 'sending') && (
        <>
          <h2 className={styles.title} tabIndex={-1}>{QUESTION}</h2>
          <textarea
            className={styles.textarea}
            placeholder={brand.placeholders.feedback}
            aria-label="Share your thoughts"
            value={comment}
            disabled={step === 'sending'}
            onChange={(event) => setComment(event.target.value)}
          />
          <div className={styles.actions}>
            <Button state={step === 'sending' ? 'loading' : 'idle'} onClick={submit}>
              Send feedback
            </Button>
          </div>
        </>
      )}

      {step === 'sent' && (
        <>
          <h2 className={`${styles.title} ${styles.result}`} tabIndex={-1} role="status">
            Thank you for your feedback
          </h2>
          <div className={`${styles.icon} ${styles.success}`}>
            <CheckCircleIcon />
          </div>
        </>
      )}

      {step === 'failed' && (
        <>
          <h2 className={`${styles.title} ${styles.result}`} tabIndex={-1} role="alert">
            Your feedback hasn’t been sent
          </h2>
          <div className={`${styles.icon} ${styles.failure}`}>
            <XCircleIcon />
          </div>
          <div className={styles.actions}>
            <Button onClick={() => setStep('comment')}>Try again</Button>
          </div>
        </>
      )}
    </section>
  )
}

export default SatisfactionSurvey
