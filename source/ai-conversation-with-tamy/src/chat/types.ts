// What a conversation is made of. Flows and the chat engine speak in these types;
// components only render them.

export type ReplyBlock =
  | { type: 'p'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'ol'; items: string[] }

export type ThreadItem =
  | { id: string; kind: 'user'; text: string }
  | { id: string; kind: 'reply'; from: 'assistant' | 'agent'; sender: string; blocks: ReplyBlock[] }
  | { id: string; kind: 'options'; count: number }
  | { id: string; kind: 'note'; text: string }
  | { id: string; kind: 'status'; variant: 'divider' | 'loading'; text: string }
  | { id: string; kind: 'survey' }

/** Distributes Omit over the union so each variant keeps its own fields. */
export type NewThreadItem = ThreadItem extends infer T ? (T extends ThreadItem ? Omit<T, 'id'> : never) : never

export type ChatError = {
  message: string
  /** retry repeats what failed; continue starts a new session. */
  action: 'retry' | 'continue'
}

export type ComposerState = {
  disabled: boolean
  placeholder: string
}
