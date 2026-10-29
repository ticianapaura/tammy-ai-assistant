import { FIRST_ANSWER, FIRST_MESSAGE, FIVE_OPTIONS, expect, test } from './fixtures'

// Edge cases of the conversation with Tammy.

test.describe('options', () => {
  test.beforeEach(async ({ chat }) => {
    await chat.open('options')
    await expect(chat.options).toBeVisible()
  })

  test('a quick double tap on the same option sends it once', async ({ chat }) => {
    await chat.option(4).dblclick()
    await expect(chat.reply(/update your Max Number of Days/)).toBeVisible()
    await expect(chat.sent('4')).toHaveCount(1)
    await expect(chat.reply(/^Got it/)).toHaveCount(1)
  })

  test('another option can’t be picked after choosing one', async ({ chat }) => {
    await chat.option(1).click()
    await expect(chat.option(2)).toBeDisabled()
    await chat.option(2).click({ force: true })
    await expect(chat.reply(/update your Monthly Processing Volume/)).toBeVisible()
    await expect(chat.userMessages).toHaveCount(2)
    await expect(chat.option(1)).toHaveAttribute('aria-pressed', 'true')
    await expect(chat.option(2)).toHaveAttribute('aria-pressed', 'false')
  })

  test('typing the option’s number works like tapping it', async ({ chat }) => {
    await chat.say('3')
    await expect(chat.reply('Got it, let’s update your Max Ticket. What would you like the new value to be?')).toBeVisible()
  })

  test('typing the option’s name works like tapping it', async ({ chat }) => {
    await chat.say('refund policy')
    await expect(chat.reply('Got it, let’s update your Refund Policy. What would you like the new value to be?')).toBeVisible()
  })

  test('old options are disabled once the conversation moves on', async ({ chat }) => {
    await chat.say('something else')
    await expect(chat.reply(/^Got it/)).toBeVisible()
    for (const n of [1, 2, 3, 4, 5]) await expect(chat.option(n)).toBeDisabled()
  })
})

test('the options stay disabled while Tammy is still writing them', async ({ chat }) => {
  await chat.open('welcome')
  await chat.input.press('Enter')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await chat.say('one more thing')
  // Options left behind by a newer message can't be used.
  await expect(chat.option(1)).toBeDisabled()
})

test('the answer’s link opens in a new tab safely', async ({ chat }) => {
  await chat.open('link')
  const link = chat.log.getByRole('link', { name: /Settlement Bank Account/ })
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveAttribute('rel', /noreferrer/)
})

for (const flow of ['error-generating', 'error-request', 'not-delivered']) {
  test(`${flow}: Try again spins, can’t be pressed twice, and the answer isn’t repeated`, async ({ chat }) => {
    await chat.open(flow)
    await expect(chat.retry).toBeEnabled()
    await chat.retry.dblclick()
    await expect(chat.retry).toBeDisabled()
    await expect(chat.retry).toHaveAttribute('aria-busy', 'true')
    await expect(chat.retry.locator('svg[class*="spin"]')).toBeVisible()
    await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
    await chat.input.press('Enter')
    await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
    await chat.say('2')
    await expect(chat.reply(/update your Average Ticket/)).toBeVisible()
    await expect(chat.reply(FIRST_ANSWER)).toHaveCount(1)
    await expect(chat.reply(FIVE_OPTIONS)).toHaveCount(1)
  })
}

test('session-expired: Continue shows the welcome and notice, and the turns start over', async ({ chat, page }) => {
  await chat.open('session-expired')
  await expect(chat.input).toBeDisabled()
  await chat.continue.dblclick()
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible()
  await expect(chat.securityNotice).toBeVisible()
  await expect(chat.alert).toBeHidden()
  await expect(chat.userMessages).toHaveCount(0)
  await expect(chat.input).toBeEnabled()
  await expect(chat.input).toHaveAttribute('placeholder', 'What would you like to ask to Tammy?')
  // The first message of the new session gets the first answer, not a later turn's.
  await chat.input.press('Enter')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await expect(chat.sent(FIRST_MESSAGE)).toHaveCount(1)
})

test('thumbs: choose one, switch to the other, tap again to undo', async ({ chat }) => {
  await chat.open('options')
  const helpful = chat.log.getByRole('button', { name: 'Helpful', exact: true })
  const notHelpful = chat.log.getByRole('button', { name: 'Not helpful' })
  await helpful.click()
  await expect(helpful).toHaveAttribute('aria-pressed', 'true')
  await expect(notHelpful).toHaveAttribute('aria-pressed', 'false')
  await notHelpful.click()
  await expect(helpful).toHaveAttribute('aria-pressed', 'false')
  await expect(notHelpful).toHaveAttribute('aria-pressed', 'true')
  await notHelpful.click()
  await expect(helpful).toHaveAttribute('aria-pressed', 'false')
  await expect(notHelpful).toHaveAttribute('aria-pressed', 'false')
})
