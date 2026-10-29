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
  get options() {
    return this.page.getByRole('group', { name: 'Choose an option' })
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

  option(n: number) {
    return this.options.last().getByRole('button', { name: String(n), exact: true })
  }
}

export const FIRST_MESSAGE = 'Hey Tammy, I need to update my processing units'
export const FIRST_ANSWER = /^Hi there! I can help you with that/
export const FIVE_OPTIONS = /^Sure! I can help you with this, remember/
