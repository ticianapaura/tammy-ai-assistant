import type { ReactNode } from 'react'
import styles from './FlowShell.module.css'

type FlowShellProps = {
  title: string
  children: ReactNode
}

// Demo frame around a flow: a way back to the list of flows, then the chat panel.
// Embedded previews (?embed) show the panel alone.
function FlowShell({ title, children }: FlowShellProps) {
  if (new URLSearchParams(window.location.search).has('embed')) return <>{children}</>

  return (
    <div className={styles.shell}>
      <nav className={styles.bar} aria-label="Flow navigation">
        <a className={styles.back} href="#">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          All flows
        </a>
        <span className={styles.title}>{title}</span>
      </nav>
      <div className={styles.panel}>{children}</div>
    </div>
  )
}

export default FlowShell
