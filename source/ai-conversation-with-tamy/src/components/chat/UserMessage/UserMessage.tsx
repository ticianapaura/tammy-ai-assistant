import styles from './UserMessage.module.css'

function UserMessage({ text }: { text: string }) {
  return (
    <div className={styles.bubble}>
      <span className="visually-hidden">You said: </span>
      {text}
    </div>
  )
}

export default UserMessage
