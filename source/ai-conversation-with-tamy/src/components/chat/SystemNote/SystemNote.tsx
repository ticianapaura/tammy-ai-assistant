import styles from './SystemNote.module.css'

function SystemNote({ text }: { text: string }) {
  return <p className={styles.note}>{text}</p>
}

export default SystemNote
