// A flow is a script: what the assistant (or agent) does in reply to the person.
// The engine in useConversation plays these steps in order, with real delays,
// so every flow behaves like the designs without a backend.
import type { ChatError, ComposerState, NewThreadItem } from './types'

export type Step =
  /** Pause without showing anything. */
  | { do: 'wait'; ms: number }
  /** Show "Writing..." for a while. */
  | { do: 'typing'; ms: number }
  | { do: 'add'; item: NewThreadItem }
  /** Remove the "Connecting you to a support agent" pill once the wait is over. */
  | { do: 'clearLoading' }
  | { do: 'composer'; composer: Partial<ComposerState> }
  /** Prefill the composer with the person's next scripted line, so a reviewer can just press send. */
  | { do: 'suggest'; text: string }
  /** Show an error banner. Its action plays `recover`; nothing else runs until then. */
  | { do: 'error'; error: ChatError; recover: Step[] }
  /** Start a new session: empty thread, welcome screen. */
  | { do: 'reset' }

export type Turn = {
  /** What the person sent: their text, or the number of the option they picked. */
  text: string
  option?: number
  /** How many messages the person has sent in this session, counting this one (1-based). */
  count: number
}

export type FlowStart = {
  /** Show the welcome screen and security notice until the first message. */
  welcome?: boolean
  items?: NewThreadItem[]
  composer?: Partial<ComposerState>
  suggestion?: string
  /** Steps that run as soon as the flow opens (an error on load, for example). */
  onOpen?: Step[]
}

export type Flow = {
  id: string
  title: string
  /** One line for the flows index: what this flow shows and which designs it covers. */
  summary: string
  start: FlowStart
  respond: (turn: Turn) => Step[]
  /** Live agent only: how the satisfaction survey's send ends, per attempt (1-based). */
  saveFeedback?: (attempt: number) => boolean
  /** What happens once the survey is done or dismissed. */
  afterSurvey?: Step[]
}

// Small helpers so flows read like the conversation they describe.
// Item builders (for a flow's starting thread) and the matching steps.
const paragraphs = (texts: string[]) => texts.map((text) => ({ type: 'p' as const, text }))

export const reply = (sender: string, ...texts: string[]): NewThreadItem => ({
  kind: 'reply',
  from: 'assistant',
  sender,
  blocks: paragraphs(texts),
})

export const agentReply = (sender: string, ...texts: string[]): NewThreadItem => ({
  kind: 'reply',
  from: 'agent',
  sender,
  blocks: paragraphs(texts),
})

export const user = (text: string): NewThreadItem => ({ kind: 'user', text })
export const noteItem = (text: string): NewThreadItem => ({ kind: 'note', text })
export const statusItem = (variant: 'divider' | 'loading', text: string): NewThreadItem => ({
  kind: 'status',
  variant,
  text,
})

export const add = (item: NewThreadItem): Step => ({ do: 'add', item })
export const say = (sender: string, ...texts: string[]): Step => add(reply(sender, ...texts))
export const agentSays = (sender: string, ...texts: string[]): Step => add(agentReply(sender, ...texts))
export const note = (text: string): Step => add(noteItem(text))
export const status = (variant: 'divider' | 'loading', text: string): Step => add(statusItem(variant, text))
