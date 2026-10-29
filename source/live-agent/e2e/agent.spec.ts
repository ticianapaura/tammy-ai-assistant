import { ADAM_HELLO, CONNECTED, CONNECTING_MESSAGE, NEW_CONVERSATION, OPENING, expect, test, type Chat } from './fixtures'

// Edge cases of the hand-off to a live agent and the satisfaction survey.

test('while connecting, the input is disabled and nothing can be sent', async ({ chat, page }) => {
  await chat.open('handoff')
  await chat.input.press('Enter')
  await expect(chat.connecting).toBeVisible({ timeout: 10_000 })
  await expect(chat.input).toBeDisabled()
  await expect(chat.send).toBeDisabled()
  await chat.input.click({ force: true })
  await page.keyboard.type('hello?')
  await page.keyboard.press('Enter')
  await expect(chat.userMessages).toHaveCount(2)
  await expect(chat.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
  await expect(chat.userMessages).toHaveCount(2)
  await expect(chat.input).toBeEnabled()
})

test('agents busy: the placeholder asks for details, and the ticket update comes before connecting', async ({ chat }) => {
  await chat.open('agents-busy')
  await chat.input.press('Enter')
  await expect(chat.log.getByText(/^All agents are currently busy/)).toBeVisible({ timeout: 10_000 })
  await expect(chat.input).toBeEnabled()
  await expect(chat.input).toHaveAttribute('placeholder', 'Share more details about your issue...')
  await chat.say('We have pending transactions today.')
  const updated = chat.log.getByText(/^Thanks for the details. Your support ticket has been updated/)
  await expect(updated).toBeVisible()
  await expect(chat.connecting).toBeVisible()
  await expect(chat.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
  const order = await chat.log.innerText()
  expect(order.indexOf('Your support ticket has been updated')).toBeLessThan(order.indexOf(CONNECTED))
  expect(order.indexOf(CONNECTED)).toBeLessThan(order.indexOf('Hi there, this is Adam'))
})

for (const flow of ['error-availability', 'error-connect', 'error-request']) {
  test(`${flow}: after Try again Adam joins, with one Connecting pill at a time`, async ({ chat, page }) => {
    await chat.open(flow)
    await chat.input.press('Enter')
    await expect(chat.retry).toBeVisible({ timeout: 10_000 })
    await expect(chat.input).toBeDisabled()
    await chat.retry.dblclick()

    // Sample the pills until Adam arrives.
    let most = 0
    while (!(await chat.reply(ADAM_HELLO).isVisible())) {
      most = Math.max(most, await chat.connecting.count())
      await page.waitForTimeout(100)
    }
    expect(most).toBe(1)
    await expect(chat.connecting).toHaveCount(0)
    await expect(chat.reply(CONNECTING_MESSAGE)).toHaveCount(1)
    await expect(chat.log.getByRole('separator', { name: CONNECTED })).toHaveCount(1)
    await expect(chat.reply(ADAM_HELLO)).toHaveCount(1)
    await chat.input.press('Enter')
    await expect(chat.reply(/^At this point, I’ll need to escalate this/)).toBeVisible()
  })
}

test('history-error: Try again brings the conversation and the flow goes on', async ({ chat }) => {
  await chat.open('history-error')
  await expect(chat.userMessages).toHaveCount(0)
  await expect(chat.input).toBeDisabled()
  await chat.retry.click()
  await expect(chat.reply(OPENING)).toBeVisible()
  await expect(chat.reply(OPENING)).toHaveCount(1)
  await chat.reachAdam()
  await chat.input.press('Enter')
  await expect(chat.reply(/^At this point, I’ll need to escalate this/)).toBeVisible()
})

/** After the survey: exactly one new-conversation note, survey gone, input back. */
async function expectNewConversation(chat: Chat) {
  await expect(chat.newConversation).toBeVisible({ timeout: 6_000 })
  await expect(chat.survey).toBeHidden()
  await expect(chat.input).toBeEnabled()
  await expect(chat.input).toHaveAttribute('placeholder', 'What would you like to ask to Tammy?')
  // Outlive any pending send, so a late one can't start the conversation twice.
  await chat.page.waitForTimeout(3500)
  await expect(chat.log.getByText(NEW_CONVERSATION)).toHaveCount(1)
}

test.describe('closing the survey with ×', () => {
  test.beforeEach(async ({ chat }) => {
    await chat.open('survey')
    await expect(chat.survey).toBeVisible()
  })

  test('on the scale', async ({ chat }) => {
    await chat.closeSurvey.click()
    await expectNewConversation(chat)
  })

  test('on the comment', async ({ chat }) => {
    await chat.rating(3).click()
    await expect(chat.comment).toBeVisible()
    await chat.comment.fill('half written')
    await chat.closeSurvey.click()
    await expectNewConversation(chat)
  })

  test('while sending', async ({ chat }) => {
    await chat.rating(3).click()
    await chat.sendFeedback.click()
    await expect(chat.survey.getByRole('button', { name: 'Sending' })).toBeVisible()
    await chat.closeSurvey.click()
    await expectNewConversation(chat)
  })

  test('on the thank-you result', async ({ chat }) => {
    await chat.rating(3).click()
    await chat.sendFeedback.click()
    await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
    await chat.closeSurvey.click()
    await expectNewConversation(chat)
  })
})

test('closing the survey on the failed result', async ({ chat }) => {
  await chat.open('survey-error')
  await chat.rating(1).click()
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Your feedback hasn’t been sent')).toBeVisible()
  await chat.closeSurvey.click()
  await expectNewConversation(chat)
})

test('the survey can be sent without a comment', async ({ chat }) => {
  await chat.open('survey')
  await chat.rating(5).click()
  await expect(chat.comment).toHaveValue('')
  await expect(chat.sendFeedback).toBeEnabled()
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
  await expectNewConversation(chat)
})

test('survey-error: a failed send, then Try again keeps the comment and succeeds', async ({ chat }) => {
  await chat.open('survey-error')
  await chat.rating(2).click()
  await chat.comment.fill('Took a while')
  await chat.sendFeedback.click()
  await expect(chat.survey.getByRole('alert')).toHaveText('Your feedback hasn’t been sent')
  await chat.survey.getByRole('button', { name: 'Try again' }).click()
  await expect(chat.comment).toHaveValue('Took a while')
  await expect(chat.comment).toBeEnabled()
  await chat.sendFeedback.click()
  await expect(chat.survey.getByRole('status')).toHaveText('Thank you for your feedback')
  await expectNewConversation(chat)
})

test('the scale works with the keyboard alone', async ({ chat, page }) => {
  await chat.open('survey')
  await chat.closeSurvey.focus()
  await page.keyboard.press('Tab')
  await expect(chat.rating(1)).toBeFocused()
  // Arrows move the choice at a person's pace without jumping to the next step.
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(500)
  }
  await expect(chat.rating(4)).toBeFocused()
  await expect(chat.rating(4)).toHaveAttribute('aria-checked', 'true')
  await expect(chat.comment).toBeHidden()
  await page.keyboard.press('ArrowLeft')
  await expect(chat.rating(3)).toHaveAttribute('aria-checked', 'true')
  await page.keyboard.press('ArrowRight')
  // Enter confirms; focus stays in the survey so Tab reaches the comment.
  await page.keyboard.press('Enter')
  await expect(chat.comment).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(chat.comment).toBeFocused()
  await page.keyboard.type('All by keyboard')
  await page.keyboard.press('Tab')
  await expect(chat.sendFeedback).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
  await expectNewConversation(chat)
})
