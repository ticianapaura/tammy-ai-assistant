import { useState } from 'react'
import type { ReplyBlock } from '../../../chat/types'
import { BotIcon, ThumbDownIcon, ThumbUpIcon } from '../../ui/icons'
import styles from './Reply.module.css'

type ReplyProps = {
  sender: string
  blocks: ReplyBlock[]
}

type Rating = 'up' | 'down' | null

// An answer from the assistant or a live agent: mark, text, and thumbs to rate it.
function Reply({ sender, blocks }: ReplyProps) {
  const [rating, setRating] = useState<Rating>(null)
  const toggle = (next: Exclude<Rating, null>) => setRating((current) => (current === next ? null : next))

  return (
    <div className={styles.reply}>
      <span className={styles.icon}>
        <BotIcon size={24} />
      </span>
      <div className={styles.body}>
        <span className="visually-hidden">{sender} says: </span>
        {blocks.map((block, index) => {
          if (block.type === 'p') return <p key={index}>{block.text}</p>
          if (block.type === 'link')
            return (
              <p key={index}>
                <a href={block.href} target="_blank" rel="noreferrer">
                  {block.text}
                </a>
              </p>
            )
          return (
            <ol key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )
        })}
        <div className={styles.thumbs} role="group" aria-label="Rate this answer">
          <button type="button" aria-label="Helpful" aria-pressed={rating === 'up'} onClick={() => toggle('up')}>
            <ThumbUpIcon />
          </button>
          <button type="button" aria-label="Not helpful" aria-pressed={rating === 'down'} onClick={() => toggle('down')}>
            <ThumbDownIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Reply
