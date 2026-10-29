import { test as base, expect, type Page } from '@playwright/test'

// Every test fails on a console error or an uncaught exception, and gets the chat's
// main controls ready to use.
export const test = base.extend<{ chat: Chat; consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text())
      })
      page.on('pageerror', (error) => errors.push(error.message))
      await use(errors)
      expect(errors, 'console errors').toEqual([])
    },
    { auto: true },
  ],
  chat: async ({ page }, use) => use(new Chat(page)),
})

export { expect }

export class Chat {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get log() {
    return this.page.getByRole('log')
  }
  get input() {
    return this.page.getByRole('textbox', { name: 'Message' })
  }
  get send() {
    return this.page.getByRole('button', { name: 'Send message' })
  }
  get typing() {
    return this.page.getByRole('status').filter({ hasText: 'Writing...' })
  }
  get counter() {
    return this.page.locator('[class*="counter"]')
  }
  get tooLong() {
    return this.page.getByText('Your input exceeds the maximum allowed length!')
  }
  get retry() {
    return this.page.getByRole('button', { name: 'Try again' })
  }
  get continue() {
    return this.page.getByRole('button', { name: 'Continue' })
  }
  get alert() {
    return this.page.getByRole('alert')
  }
  get securityNotice() {
    return this.page.getByRole('note')
  }
  get connecting() {
    return this.page.getByRole('status').filter({ hasText: 'Connecting you to a support agent' })
  }
  get survey() {
    return this.page.getByRole('region', { name: 'Satisfaction survey' })
  }
  get closeSurvey() {
    return this.page.getByRole('button', { name: 'Close survey' })
  }
  get comment() {
    return this.page.getByRole('textbox', { name: 'Share your thoughts' })
  }
  get sendFeedback() {
    return this.page.getByRole('button', { name: 'Send feedback' })
  }
  get newConversation() {
    return this.log.getByText(NEW_CONVERSATION)
  }
  get userMessages() {
    return this.page.getByText('You said:')
  }

  /** Opens a flow from a clean page, so the same flow can be opened twice in a row. */
  async open(flow: string) {
    await this.page.goto('/')
    await this.page.goto(`/#${flow}`)
    await expect(this.log).toBeVisible()
  }

  /** Writes and sends a message the way a person does: typing and pressing Enter. */
  async say(text: string) {
    await this.input.fill(text)
    await this.input.press('Enter')
  }

  /** A message the person sent, matched whole. */
  sent(text: string) {
    return this.log.getByText(`You said: ${text}`, { exact: true })
  }

  reply(text: string | RegExp) {
    return this.log.getByText(text)
  }

  rating(n: number) {
    return this.survey.getByRole('radio', { name: String(n), exact: true })
  }

  /** Asks Tammy for an agent and waits until Adam has said hello. */
  async reachAdam() {
    await expect(this.input).toHaveValue(ASK_FOR_AGENT)
    await this.input.press('Enter')
    await expect(this.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
  }
}

export const ASK_FOR_AGENT = 'Yes, please connect me with an agent.'
export const OPENING = /^Would you like to speak to an agent\?$/
export const CONNECTING_MESSAGE = /^I’m connecting you with a support agent now/
export const CONNECTED = 'You’re now connected with a support agent'
export const ADAM_HELLO = /^Hi there, this is Adam from the support team/
export const SESSION_ENDED = 'The live chat session has ended'
export const NEW_CONVERSATION = 'A new conversation with Tammy has started'
