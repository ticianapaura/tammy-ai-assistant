import type { Flow } from '../chat/script'
import styles from './FlowIndex.module.css'

type FlowIndexProps = {
  title: string
  flows: Flow[]
}

// Dev page listing every flow, each one reachable at #<flow id>.
function FlowIndex({ title, flows }: FlowIndexProps) {
  return (
    <main className={styles.index}>
      <h1>{title}</h1>
      <p className={styles.note}>
        Pick a flow to play it. Each one has its own link, and <a href="#tokens">#tokens</a>{' '}
        shows the design tokens.
      </p>
      <ol className={styles.list}>
        {flows.map((flow) => (
          <li key={flow.id}>
            <a href={`#${flow.id}`}>{flow.title}</a>
            <span>{flow.summary}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}

export default FlowIndex
