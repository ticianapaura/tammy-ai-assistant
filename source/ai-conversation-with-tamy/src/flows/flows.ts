// Every flow of the AI conversation with Tammy, from docs/design/Common conversation*.png
// and Filled out*.png. Each one opens at #<id>.
import { type Flow, type Step, type Turn, add, reply, say, user } from '../chat/script'
import { brand } from '../config/brand'

const NAME = brand.assistantName

const FIRST_MESSAGE = `Hey ${NAME}, I need to update my processing units`

const LONG_MESSAGE =
  'I’d like to request additional processing units. We’re expecting higher transaction volume soon and I want to ensure we’re prepared in advance. Let me know what details you need from me.'

const firstAnswer = reply(
  NAME,
  'Hi there! I can help you with that. Could you please confirm whether you want to update your existing processing units or request additional ones? Once I have that information, I’ll guide you through the next steps.',
)

const PROCESSING_DETAILS = [
  'Monthly Processing Volume',
  'Average Ticket',
  'Max Ticket',
  'Max Number of Days Before Customer Receives Product/Service',
  'Refund Policy',
  'Chargeback Handling Process',
  'Shipping / Delivery Timeframes',
  'Customer Support Contact Details',
  'Business Description / Products or Services Offered',
  'Website or Checkout Experience Details',
]

const think = (ms = 1600): Step => ({ do: 'typing', ms })

/** Common conversation-5: five options with quick-reply buttons. */
const fiveOptions: Step[] = [
  add({
    kind: 'reply',
    from: 'assistant',
    sender: NAME,
    blocks: [
      { type: 'p', text: 'Sure! I can help you with this, remember you can always create a new ticket through our Support hub.' },
      {
        type: 'p',
        text: 'Which processing detail would you like to update? Please choose one of the following or click to follow and create the ticket manually:',
      },
      { type: 'ol', items: PROCESSING_DETAILS.slice(0, 5) },
      { type: 'p', text: 'Just reply with the number or the name of the option you’d like to update.' },
    ],
  }),
  add({ kind: 'options', count: 5 }),
]

/** Common conversation-6: all ten options. */
const tenOptions: Step[] = [
  add({
    kind: 'reply',
    from: 'assistant',
    sender: NAME,
    blocks: [
      {
        type: 'p',
        text: 'Sure! I can help you with this. You have 10 of 10 options remaining. Remember, you can always create a new ticket through our Support Hub.',
      },
      { type: 'p', text: 'Which processing detail would you like to update? Please choose one of the following or create a ticket manually:' },
      { type: 'ol', items: PROCESSING_DETAILS },
      { type: 'p', text: 'Just reply with the number or the name of the option you’d like to update.' },
    ],
  }),
  add({ kind: 'options', count: 10 }),
]

// Not in the designs: what Tammy says after an option is picked, so the flow can go on.
const afterOption = (option?: number): Step[] => {
  const detail = option ? PROCESSING_DETAILS[option - 1] : undefined
  return [
    think(),
    say(
      NAME,
      detail
        ? `Got it, let’s update your ${detail}. What would you like the new value to be?`
        : 'Got it. Could you tell me the new value you’d like to set?',
    ),
  ]
}

/** The option a typed reply names, by number or by name, the same as tapping its button. */
function typedOption(text: string, count: number): number | undefined {
  const answer = text.trim().replace(/\.$/, '').toLowerCase()
  const number = Number(answer)
  if (Number.isInteger(number) && number >= 1 && number <= count) return number
  const index = PROCESSING_DETAILS.slice(0, count).findIndex((detail) => detail.toLowerCase() === answer)
  return index >= 0 ? index + 1 : undefined
}

// Not in the designs: a generic answer for anything typed after the scripted part.
const fallback: Step[] = [
  think(),
  say(NAME, 'Thanks! I’ve noted that. Is there anything else I can help you with?'),
]

/** The main conversation: first answer, the long message, then the options. */
function mainConversation({ text, count, option }: Turn): Step[] {
  if (count === 1) return [think(), add(firstAnswer), { do: 'suggest', text: LONG_MESSAGE }]
  if (count === 2) return [think(2000), ...fiveOptions]
  if (count === 3) return afterOption(option ?? typedOption(text, 5))
  return fallback
}

/** For flows that open with the first answer already given. */
const afterFirstAnswer = (turn: Turn) => mainConversation({ ...turn, count: turn.count + 1 })

export const flows: Flow[] = [
  {
    id: 'welcome',
    title: 'Welcome and conversation',
    summary:
      'Welcome screen, first message, "Writing…", the answer, a long message and quick replies.',
    start: { welcome: true, suggestion: FIRST_MESSAGE },
    respond: mainConversation,
  },
  {
    id: 'link',
    title: 'Answer with a link',
    summary: 'An answer that points to a guide and says it opens in a new tab.',
    start: {
      items: [user(FIRST_MESSAGE)],
      onOpen: [
        think(),
        add({
          kind: 'reply',
          from: 'assistant',
          sender: NAME,
          blocks: [
            {
              type: 'p',
              text: 'Sure, I can help you with that. To update your settlement bank account, please follow our step-by-step instructions in the following guide:',
            },
            { type: 'link', text: 'How to Update Your Settlement Bank Account in the Merchant', href: brand.supportHubUrl },
            { type: 'p', text: 'This link will open in a new tab.' },
            { type: 'p', text: 'Would you like me to guide you through the process here as well?' },
          ],
        }),
        { do: 'suggest', text: 'Yes, please guide me here.' },
      ],
    },
    respond: () => fallback,
  },
  {
    id: 'long-message',
    title: 'Long message and character limit',
    summary:
      'The input grows, shows the counter and blocks sending past 200 characters (add text to see it).',
    start: { items: [user(FIRST_MESSAGE), firstAnswer], suggestion: LONG_MESSAGE },
    respond: afterFirstAnswer,
  },
  {
    id: 'options',
    title: 'Numbered quick replies (5)',
    summary: 'An answer with a list and buttons; picking one sends it and disables the rest.',
    start: { items: [user(FIRST_MESSAGE)], onOpen: [think(), ...fiveOptions] },
    respond: ({ text, count, option }) => (count === 1 ? afterOption(option ?? typedOption(text, 5)) : fallback),
  },
  {
    id: 'options-10',
    title: 'Numbered quick replies (10)',
    summary: 'The full list, with two rows of buttons.',
    start: { items: [user(FIRST_MESSAGE)], onOpen: [think(), ...tenOptions] },
    respond: ({ text, count, option }) => (count === 1 ? afterOption(option ?? typedOption(text, 10)) : fallback),
  },
  {
    id: 'error-generating',
    title: 'Error generating the answer',
    summary: 'It fails while writing; Try again asks for it again.',
    start: { items: [user(FIRST_MESSAGE)], onOpen: [think(2200), errorThen('Something went wrong while generating the response.', [think(), add(firstAnswer), { do: 'suggest', text: LONG_MESSAGE }])] },
    respond: afterFirstAnswer,
  },
  {
    id: 'error-request',
    title: 'Request couldn’t be completed',
    summary: 'The request fails before answering; Try again repeats it.',
    start: { items: [user(FIRST_MESSAGE)], onOpen: [think(900), errorThen('We couldn’t complete this request at the moment. Please try again.', [think(), add(firstAnswer), { do: 'suggest', text: LONG_MESSAGE }])] },
    respond: afterFirstAnswer,
  },
  {
    id: 'not-delivered',
    title: 'Message not delivered',
    summary: 'The message doesn’t arrive; Try again resends it.',
    start: { items: [user(FIRST_MESSAGE)], onOpen: [{ do: 'wait', ms: 700 }, errorThen('Message wasn’t delivered.', [think(), add(firstAnswer), { do: 'suggest', text: LONG_MESSAGE }])] },
    respond: afterFirstAnswer,
  },
  {
    id: 'session-expired',
    title: 'Session expired',
    summary: 'Continue starts a new session from the welcome screen.',
    start: {
      items: [user(FIRST_MESSAGE)],
      onOpen: [
        { do: 'wait', ms: 400 },
        {
          do: 'error',
          error: { message: 'Your session has expired due to inactivity. Please continue to chat again.', action: 'continue' },
          recover: [{ do: 'reset' }, { do: 'suggest', text: FIRST_MESSAGE }],
        },
      ],
    },
    respond: mainConversation,
  },
]

function errorThen(message: string, recover: Step[]): Step {
  return { do: 'error', error: { message, action: 'retry' }, recover }
}
