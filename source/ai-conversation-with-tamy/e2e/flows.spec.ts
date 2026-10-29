import { FIRST_ANSWER, FIRST_MESSAGE, FIVE_OPTIONS, expect, test } from './fixtures'

// The happy path of every flow in the index, one test each.

test('index lists every flow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'AI conversation with Tammy' })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(9)
})

test('welcome: first message, Writing..., answer, long message and options', async ({ chat, page }) => {
  await chat.open('welcome')
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible()
  await expect(chat.securityNotice).toBeVisible()
  await expect(chat.input).toHaveAttribute('placeholder', 'What would you like to ask to Tammy?')
  await expect(chat.input).toHaveValue(FIRST_MESSAGE)

  await chat.input.press('Enter')
  await expect(chat.typing).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeHidden()
  await expect(chat.securityNotice).toBeHidden()
  await expect(chat.input).toHaveAttribute('placeholder', 'Type...')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await expect(chat.typing).toBeHidden()

  await expect(chat.input).toHaveValue(/^I’d like to request additional processing units/)
  await chat.send.click()
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await expect(chat.options.getByRole('button')).toHaveCount(5)

  await chat.option(2).click()
  await expect(chat.reply('Got it, let’s update your Average Ticket. What would you like the new value to be?')).toBeVisible()
  await chat.say('20 dollars')
  await expect(chat.reply('Thanks! I’ve noted that. Is there anything else I can help you with?')).toBeVisible()
})

test('link: the guide opens in a new tab', async ({ chat }) => {
  await chat.open('link')
  const link = chat.log.getByRole('link', { name: 'How to Update Your Settlement Bank Account in the Merchant' })
  await expect(link).toBeVisible()
  await expect(chat.reply('This link will open in a new tab.')).toBeVisible()
  await expect(chat.input).toHaveValue('Yes, please guide me here.')
  await chat.input.press('Enter')
  await expect(chat.reply(/^Thanks! I’ve noted that/)).toBeVisible()
})

test('long-message: the long draft shows the counter and sends', async ({ chat }) => {
  await chat.open('long-message')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await expect(chat.counter).toHaveText('186/200')
  await expect(chat.send).toBeEnabled()
  await chat.input.press('Enter')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await expect(chat.counter).toBeHidden()
})

test('options: picking one sends it and disables the rest', async ({ chat }) => {
  await chat.open('options')
  await expect(chat.options.getByRole('button')).toHaveCount(5)
  await chat.option(3).click()
  await expect(chat.option(3)).toHaveAttribute('aria-pressed', 'true')
  for (const n of [1, 2, 3, 4, 5]) await expect(chat.option(n)).toBeDisabled()
  await expect(chat.reply('Got it, let’s update your Max Ticket. What would you like the new value to be?')).toBeVisible()
})

test('options-10: all ten options in two rows', async ({ chat }) => {
  await chat.open('options-10')
  await expect(chat.options.getByRole('button')).toHaveCount(10)
  const first = await chat.option(1).boundingBox()
  const sixth = await chat.option(6).boundingBox()
  expect(sixth!.y).toBeGreaterThan(first!.y)
  expect(sixth!.x).toBeCloseTo(first!.x, 0)
  await chat.option(10).click()
  await expect(chat.reply(/update your Website or Checkout Experience Details/)).toBeVisible()
})

for (const [flow, message] of [
  ['error-generating', 'Something went wrong while generating the response.'],
  ['error-request', 'We couldn’t complete this request at the moment. Please try again.'],
  ['not-delivered', 'Message wasn’t delivered.'],
] as const) {
  test(`${flow}: Try again recovers the answer`, async ({ chat }) => {
    await chat.open(flow)
    await expect(chat.alert).toHaveText(message)
    await chat.retry.click()
    await expect(chat.alert).toBeHidden()
    await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
    await chat.input.press('Enter')
    await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  })
}

test('session-expired: Continue starts a new session', async ({ chat, page }) => {
  await chat.open('session-expired')
  await expect(chat.alert).toHaveText('Your session has expired due to inactivity. Please continue to chat again.')
  await chat.continue.click()
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible()
  await expect(chat.input).toHaveValue(FIRST_MESSAGE)
  await chat.input.press('Enter')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
})
