import { BotIcon } from '../../ui/icons'
import styles from './TypingIndicator.module.css'

function TypingIndicator() {
  return (
    <div className={styles.typing} role="status">
      <span className={styles.icon}>
        <BotIcon size={24} />
      </span>
      <span className={styles.text}>Writing...</span>
    </div>
  )
}

export default TypingIndicator
