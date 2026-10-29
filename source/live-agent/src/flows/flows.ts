// Every flow of the hand-off to a live agent, from docs/design/Live agent flow*.png.
// Each one opens at #<id>.
import {
  type Flow,
  type Step,
  add,
  agentReply,
  agentSays,
  note,
  reply,
  say,
  status,
  statusItem,
  user,
} from '../chat/script'
import { brand } from '../config/brand'

const NAME = brand.assistantName
// The agent's name comes from the support platform; this one is the designs' example.
const AGENT = 'Adam'

const think = (ms = 1600): Step => ({ do: 'typing', ms })
const wait = (ms: number): Step => ({ do: 'wait', ms })
const suggest = (text: string): Step => ({ do: 'suggest', text })
const retryError = (message: string, recover: Step[]): Step => ({
  do: 'error',
  error: { message, action: 'retry' },
  recover,
})

// The conversation every flow starts from: the person's problem and Tammy's offer.
const opening = [
  user('Hey Tammy, I just logged in and it says my account is restricted. I can’t access anything.'),
  reply(
    NAME,
    'I see. Let me check that for you.',
    'Yes, it seems your account is currently flagged for review, which may temporarily restrict access to certain features. This can happen for various reasons like document verification, unusual activity, or policy checks.',
    'Would you like to speak to an agent?',
  ),
]
const ASK_FOR_AGENT = 'Yes, please connect me with an agent.'

const connectingMessage = say(
  NAME,
  'I’m connecting you with a support agent now. While you wait, feel free to share any additional details about your issue so we can help you faster.',
)

const waitForAgent: Step[] = [
  { do: 'composer', composer: { disabled: true } },
  status('loading', 'Connecting you to a support agent'),
  wait(2600),
  { do: 'clearLoading' },
]

const agentJoins: Step[] = [
  status('divider', 'You’re now connected with a support agent'),
  { do: 'composer', composer: { disabled: false, placeholder: brand.placeholders.conversation } },
  think(1800),
  agentSays(
    AGENT,
    `Hi there, this is ${AGENT} from the support team — I’m jumping in to help you with your restricted account.`,
    `I’ve reviewed the details ${NAME} shared, so no need to repeat anything.`,
    'Let’s get this resolved as quickly as possible. I’m just checking your account status now — one moment.',
  ),
  suggest('Thanks, I appreciate the help. Let me know if you need anything from me.'),
]

const sessionEnds: Step[] = [
  wait(1400),
  status('divider', 'The live chat session has ended'),
  { do: 'composer', composer: { disabled: true } },
  add({ kind: 'survey' }),
]

const afterSurvey: Step[] = [
  note(`A new conversation with ${NAME} has started`),
  { do: 'composer', composer: { disabled: false, placeholder: brand.placeholders.welcome } },
]

/** The agent's side of the chat, by how many messages the person has sent to the agent. */
function agentConversation(turn: number): Step[] {
  switch (turn) {
    case 1:
      return [
        think(2200),
        agentSays(
          AGENT,
          'At this point, I’ll need to escalate this for a manual review.',
          'You don’t need to take any action right now — we’ll contact you once the review is complete.',
        ),
        suggest('Got it. How long does that usually take?'),
      ]
    case 2:
      return [
        think(1800),
        agentSays(AGENT, 'It typically takes 1–2 business days.', 'We’ll keep you updated by email if we need anything else from you.'),
        suggest('Perfect, thank you for explaining everything.'),
      ]
    case 3:
      return [
        think(1600),
        agentSays(AGENT, 'You’re welcome. I’ll stay on top of this and follow up as soon as there’s an update.'),
        ...sessionEnds,
      ]
    default:
      // After the session: Tammy is back. Not in the designs.
      return [think(), say(NAME, 'Hi again! How can I help you today?')]
  }
}

/** Happy path: ask for an agent, connect, talk, end, survey. */
function handoff({ count }: { count: number }): Step[] {
  if (count === 1) return [think(1200), connectingMessage, wait(700), ...waitForAgent, ...agentJoins]
  return agentConversation(count - 1)
}

const BUSY_DETAILS =
  'The restriction message doesn’t provide any details and I haven’t received any email. We have pending transactions today. Could you confirm the reason for the restriction?'

/** Agents busy: a ticket is created, the person adds details, then an agent joins. */
function agentsBusy({ count }: { count: number }): Step[] {
  if (count === 1)
    return [
      think(1200),
      connectingMessage,
      wait(700),
      ...waitForAgent,
      note('All agents are currently busy. We’ve created a support ticket and someone will get back to you shortly.'),
      { do: 'composer', composer: { disabled: false, placeholder: brand.placeholders.waitingForAgent } },
      suggest(BUSY_DETAILS),
    ]
  if (count === 2)
    return [
      wait(900),
      note(`Thanks for the details. Your support ticket has been updated. You may continue chatting with ${NAME} while you wait.`),
      wait(1600),
      ...waitForAgent,
      ...agentJoins,
    ]
  return agentConversation(count - 2)
}

/** Where the survey flows start: the agent's last message and the end of the session. */
const sessionEnded = [
  user('Perfect, thank you for explaining everything.'),
  agentReply(AGENT, 'You’re welcome. I’ll stay on top of this and follow up as soon as there’s an update.'),
  statusItem('divider', 'The live chat session has ended'),
  { kind: 'survey' as const },
]

const fromOpening = { items: opening, suggestion: ASK_FOR_AGENT }

export const flows: Flow[] = [
  {
    id: 'handoff',
    title: 'Handoff to an agent',
    summary:
      'Ask for an agent, connecting, the conversation with Adam, end of session and the survey.',
    start: fromOpening,
    respond: handoff,
    afterSurvey,
  },
  {
    id: 'agents-busy',
    title: 'All agents busy',
    summary: 'A ticket is created, the person adds details, and then an agent connects.',
    start: fromOpening,
    respond: agentsBusy,
    afterSurvey,
  },
  {
    id: 'survey',
    title: 'Satisfaction survey',
    summary: 'Rating, comment, sending and thank you; then a new conversation starts.',
    start: { items: sessionEnded, composer: { disabled: true } },
    respond: ({ count }) => agentConversation(count + 3),
    afterSurvey,
  },
  {
    id: 'survey-error',
    title: 'Survey that fails to send',
    summary: 'The first send fails; Try again returns to the comment and the second one goes through.',
    start: { items: sessionEnded, composer: { disabled: true } },
    respond: ({ count }) => agentConversation(count + 3),
    saveFeedback: (attempt) => attempt > 1,
    afterSurvey,
  },
  {
    id: 'error-availability',
    title: 'Availability couldn’t be confirmed',
    summary: 'It fails while looking for agents; Try again retries and connects.',
    start: fromOpening,
    respond: ({ count }) =>
      count === 1
        ? [
            think(1200),
            connectingMessage,
            wait(1200),
            retryError('We couldn’t confirm support agent availability right now. Please try again.', [
              ...waitForAgent,
              ...agentJoins,
            ]),
          ]
        : agentConversation(count - 1),
    afterSurvey,
  },
  {
    id: 'error-connect',
    title: 'Couldn’t connect to the agent',
    summary: 'It fails while connecting; Try again retries.',
    start: fromOpening,
    respond: ({ count }) =>
      count === 1
        ? [
            think(1200),
            connectingMessage,
            wait(700),
            ...waitForAgent,
            retryError('We couldn’t connect you to a support agent at the moment. Please try again.', [
              ...waitForAgent,
              ...agentJoins,
            ]),
          ]
        : agentConversation(count - 1),
    afterSurvey,
  },
  {
    id: 'error-request',
    title: 'Request couldn’t be completed',
    summary: 'The agent request fails before starting; Try again repeats it.',
    start: fromOpening,
    respond: ({ count }) =>
      count === 1
        ? [think(1000), retryError('We couldn’t complete this request at the moment. Please try again.', [connectingMessage, wait(700), ...waitForAgent, ...agentJoins])]
        : agentConversation(count - 1),
    afterSurvey,
  },
  {
    id: 'session-expired',
    title: 'Session expired',
    summary: 'Too long without activity; Continue starts a new session.',
    start: {
      items: [...opening, user(ASK_FOR_AGENT)],
      onOpen: [
        wait(400),
        {
          do: 'error',
          error: { message: 'Your session has expired due to inactivity. Please continue to chat again.', action: 'continue' },
          recover: [{ do: 'reset' }],
        },
      ],
    },
    respond: () => [think(), say(NAME, 'Hi again! How can I help you today?')],
  },
  {
    id: 'history-error',
    title: 'History couldn’t load',
    summary: 'On opening, previous messages don’t load; Try again brings them back.',
    start: {
      onOpen: [wait(500), retryError('We couldn’t load your previous messages. Please try again.', [...opening.map(add), suggest(ASK_FOR_AGENT)])],
    },
    respond: handoff,
    afterSurvey,
  },
]
