import { useEffect, useRef, type ReactNode } from 'react'
import styles from './ChatWindow.module.css'

type ChatWindowProps = {
  header: ReactNode
  /** Changes whenever the thread grows, so the log can follow the newest message. */
  scrollKey: unknown
  /** Changes when the person sends a message, which always brings the log to the bottom. */
  sentKey: unknown
  children: ReactNode
  footer: ReactNode
}

/** Within this distance of the bottom, the log keeps following new content. */
const STICK_DISTANCE = 80

// The mobile chat panel: fixed header, scrolling conversation, fixed footer.
function ChatWindow({ header, scrollKey, sentKey, children, footer }: ChatWindowProps) {
  const logRef = useRef<HTMLDivElement>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)
  // Smooth scrolling fires scroll events on the way down; ignore them until it lands.
  const autoScrollUntil = useRef(0)
  const lastSentKey = useRef(sentKey)

  // A new message brings the log to the bottom, unless the person has scrolled up to
  // read; their own message always does.
  useEffect(() => {
    const log = logRef.current
    if (!log) return
    const sent = sentKey !== lastSentKey.current
    lastSentKey.current = sentKey
    if (!sent && !atBottom.current) return
    atBottom.current = true
    autoScrollUntil.current = performance.now() + 600
    log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' })
  }, [scrollKey, sentKey])

  // Content that grows in place (the survey's next step, a taller composer) keeps the
  // bottom in view, unless the person has scrolled up to read.
  useEffect(() => {
    const log = logRef.current
    const thread = threadRef.current
    if (!log || !thread) return
    const onScroll = () => {
      if (performance.now() < autoScrollUntil.current) return
      atBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < STICK_DISTANCE
    }
    const observer = new ResizeObserver(() => {
      if (atBottom.current) log.scrollTop = log.scrollHeight
    })
    log.addEventListener('scroll', onScroll, { passive: true })
    observer.observe(log)
    observer.observe(thread)
    return () => {
      log.removeEventListener('scroll', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className={styles.window}>
      {header}
      <div ref={logRef} className={styles.log} role="log" aria-live="polite" aria-relevant="additions">
        <div ref={threadRef} className={styles.thread}>
          {children}
        </div>
      </div>
      <div className={styles.footer}>{footer}</div>
    </div>
  )
}

export default ChatWindow
