import { useCallback, useEffect, useRef, useState } from 'react'
import { brand } from '../config/brand'
import type { Flow, Step } from './script'
import type { ChatError, ComposerState, NewThreadItem, ThreadItem } from './types'

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

/** How long a banner action spins before the recovery runs. */
const RECOVER_MS = 900
/** How long the fake feedback request takes. */
const SAVE_FEEDBACK_MS = 1400
/** How long "Thank you for your feedback" stays before the new conversation starts. */
const THANKS_MS = 1600

const welcomeComposer: ComposerState = { disabled: false, placeholder: brand.placeholders.welcome }
const conversationComposer: ComposerState = { disabled: false, placeholder: brand.placeholders.conversation }

type ActiveError = ChatError & { recover: Step[]; busy: boolean }

let lastId = 0
const withId = (item: NewThreadItem): ThreadItem => ({ ...item, id: `item-${++lastId}` }) as ThreadItem

export function useConversation(flow: Flow) {
  const { start } = flow
  const [items, setItems] = useState<ThreadItem[]>(() => (start.items ?? []).map(withId))
  const [welcome, setWelcome] = useState(Boolean(start.welcome))
  const [typing, setTyping] = useState(false)
  const [composer, setComposer] = useState<ComposerState>({
    ...(start.welcome ? welcomeComposer : conversationComposer),
    ...start.composer,
  })
  const [draft, setDraft] = useState(start.suggestion ?? '')
  const [error, setError] = useState<ActiveError | null>(null)

  const sentCount = useRef(0)
  const feedbackAttempts = useRef(0)
  // Closing the survey while its feedback is still sending (or while it says thanks)
  // must not start the new conversation a second time when the send lands.
  const surveyFinished = useRef(false)
  const queue = useRef<Step[]>([])
  const running = useRef(false)
  // Bumped on unmount (and by StrictMode's double mount) so a running script stops.
  const generation = useRef(0)

  const apply = useCallback(async (step: Step, gen: number) => {
    switch (step.do) {
      case 'wait':
        await sleep(step.ms)
        return true
      case 'typing':
        setTyping(true)
        await sleep(step.ms)
        if (gen === generation.current) setTyping(false)
        return true
      case 'add':
        if (step.item.kind === 'survey') surveyFinished.current = false
        setItems((current) => [...current, withId(step.item)])
        return true
      case 'clearLoading':
        setItems((current) => current.filter((item) => !(item.kind === 'status' && item.variant === 'loading')))
        return true
      case 'composer':
        setComposer((current) => ({ ...current, ...step.composer }))
        return true
      case 'suggest':
        // Never overwrite something the person is already writing.
        setDraft((current) => (current.trim() ? current : step.text))
        return true
      case 'error':
        // Everything after an error waits for the person to press its action.
        setError({ ...step.error, recover: step.recover, busy: false })
        return false
      case 'reset':
        sentCount.current = 0
        setItems([])
        setWelcome(true)
        setTyping(false)
        setError(null)
        setDraft('')
        setComposer(welcomeComposer)
        return true
    }
  }, [])

  const play = useCallback(
    async (steps: Step[]) => {
      queue.current.push(...steps)
      if (running.current) return
      running.current = true
      const gen = generation.current
      while (queue.current.length > 0 && gen === generation.current) {
        const step = queue.current.shift()!
        const keepGoing = await apply(step, gen)
        if (!keepGoing) queue.current = []
      }
      if (gen === generation.current) running.current = false
    },
    [apply],
  )

  useEffect(() => {
    const gen = ++generation.current
    running.current = false
    queue.current = []
    // Deferred so StrictMode's throwaway first mount never adds anything.
    const timer = window.setTimeout(() => {
      if (start.onOpen) play(start.onOpen)
    }, 0)
    return () => {
      window.clearTimeout(timer)
      if (generation.current === gen) generation.current++
    }
  }, [start, play])

  const send = useCallback(
    (text: string, option?: number) => {
      sentCount.current += 1
      setItems((current) => [...current, withId({ kind: 'user', text })])
      setDraft('')
      if (welcome) {
        setWelcome(false)
        setComposer((current) =>
          current.placeholder === brand.placeholders.welcome ? conversationComposer : current,
        )
      }
      play(flow.respond({ text, option, count: sentCount.current }))
    },
    [flow, play, welcome],
  )

  const recover = useCallback(async () => {
    if (!error || error.busy) return
    const gen = generation.current
    setError({ ...error, busy: true })
    await sleep(RECOVER_MS)
    if (gen !== generation.current) return
    setError(null)
    play(error.recover)
  }, [error, play])

  const finishSurvey = useCallback(() => {
    if (surveyFinished.current) return
    surveyFinished.current = true
    setItems((current) => current.filter((item) => item.kind !== 'survey'))
    play(flow.afterSurvey ?? [])
  }, [flow, play])

  const saveFeedback = useCallback(async () => {
    feedbackAttempts.current += 1
    const attempt = feedbackAttempts.current
    await sleep(SAVE_FEEDBACK_MS)
    const saved = flow.saveFeedback ? flow.saveFeedback(attempt) : true
    if (saved) {
      const gen = generation.current
      window.setTimeout(() => {
        if (gen !== generation.current) return
        finishSurvey()
      }, THANKS_MS)
    }
    return saved
  }, [flow, finishSurvey])

  return {
    items,
    welcome,
    typing,
    error,
    draft,
    setDraft,
    composer: { ...composer, disabled: composer.disabled || error !== null },
    send,
    recover,
    saveFeedback,
    dismissSurvey: finishSurvey,
  }
}
