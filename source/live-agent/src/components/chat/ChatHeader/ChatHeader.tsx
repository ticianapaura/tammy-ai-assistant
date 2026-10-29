import { brand } from '../../../config/brand'
import { BotIcon, CloseIcon, MinusIcon } from '../../ui/icons'
import styles from './ChatHeader.module.css'

type ChatHeaderProps = {
  onMinimize: () => void
  onClose: () => void
}

function ChatHeader({ onMinimize, onClose }: ChatHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.name}>
        {brand.assistantName}
        <BotIcon size={20} />
      </h1>
      <div className={styles.actions}>
        <button type="button" className={styles.round} aria-label="Minimize chat" onClick={onMinimize}>
          <MinusIcon />
        </button>
        <button type="button" className={styles.round} aria-label="Close chat" onClick={onClose}>
          <CloseIcon />
        </button>
      </div>
    </header>
  )
}

export default ChatHeader
