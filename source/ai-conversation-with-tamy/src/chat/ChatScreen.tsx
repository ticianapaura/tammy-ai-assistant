import Banner from '../components/chat/Banner/Banner'
import ChatHeader from '../components/chat/ChatHeader/ChatHeader'
import ChatWindow from '../components/chat/ChatWindow/ChatWindow'
import Composer from '../components/chat/Composer/Composer'
import OptionButtons from '../components/chat/OptionButtons/OptionButtons'
import Reply from '../components/chat/Reply/Reply'
import StatusPill from '../components/chat/StatusPill/StatusPill'
import SystemNote from '../components/chat/SystemNote/SystemNote'
import TypingIndicator from '../components/chat/TypingIndicator/TypingIndicator'
import UserMessage from '../components/chat/UserMessage/UserMessage'
import Welcome, { SecurityNotice } from '../components/chat/Welcome/Welcome'
import SatisfactionSurvey from '../components/survey/SatisfactionSurvey/SatisfactionSurvey'
import type { Flow } from './script'
import { useConversation } from './useConversation'

// TODO: minimize and close are not designed yet (collapsed bubble, close confirmation).
function handleMinimize() {}
function handleClose() {}

function ChatScreen({ flow }: { flow: Flow }) {
  const chat = useConversation(flow)
  const lastIndex = chat.items.length - 1

  return (
    <ChatWindow
      header={<ChatHeader onMinimize={handleMinimize} onClose={handleClose} />}
      scrollKey={`${chat.items.length}-${chat.typing}-${chat.error?.message}`}
      sentKey={chat.items.filter((item) => item.kind === 'user').length}
      footer={
        <>
          {chat.welcome && <SecurityNotice />}
          {chat.error && (
            <Banner action={chat.error.action} busy={chat.error.busy} onAction={chat.recover}>
              {chat.error.message}
            </Banner>
          )}
          <Composer
            value={chat.draft}
            onChange={chat.setDraft}
            onSend={(text) => chat.send(text)}
            placeholder={chat.composer.placeholder}
            disabled={chat.composer.disabled}
          />
        </>
      }
    >
      {chat.welcome && <Welcome />}
      {chat.items.map((item, index) => {
        switch (item.kind) {
          case 'user':
            return <UserMessage key={item.id} text={item.text} />
          case 'reply':
            return <Reply key={item.id} sender={item.sender} blocks={item.blocks} />
          case 'options':
            return (
              <OptionButtons
                key={item.id}
                count={item.count}
                active={index === lastIndex && !chat.typing}
                onSelect={(option) => chat.send(String(option), option)}
              />
            )
          case 'note':
            return <SystemNote key={item.id} text={item.text} />
          case 'status':
            return <StatusPill key={item.id} variant={item.variant} text={item.text} />
          case 'survey':
            return (
              <SatisfactionSurvey key={item.id} onSubmit={chat.saveFeedback} onClose={chat.dismissSurvey} />
            )
        }
      })}
      {chat.typing && <TypingIndicator />}
    </ChatWindow>
  )
}

export default ChatScreen
