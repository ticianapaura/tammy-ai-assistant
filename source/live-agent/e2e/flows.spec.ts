import {
  ADAM_HELLO,
  ASK_FOR_AGENT,
  CONNECTED,
  CONNECTING_MESSAGE,
  OPENING,
  SESSION_ENDED,
  expect,
  test,
} from './fixtures'

// The happy path of every flow in the index, one test each.

test('index lists every flow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Live agent' })).toBeVisible()
  await expect(page.getByRole('listitem')).toHaveCount(9)
})

test('handoff: connect, talk with Adam, session ends, survey, new conversation', async ({ chat }) => {
  await chat.open('handoff')
  await expect(chat.reply(OPENING)).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply(CONNECTING_MESSAGE)).toBeVisible()
  await expect(chat.connecting).toBeVisible()
  await expect(chat.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
  await expect(chat.connecting).toBeHidden()
  await expect(chat.log.getByRole('separator', { name: CONNECTED })).toBeVisible()
  await expect(chat.input).toHaveAttribute('placeholder', 'Type...')

  await chat.input.press('Enter')
  await expect(chat.reply(/^At this point, I’ll need to escalate this/)).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply('It typically takes 1–2 business days.')).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply(/^You’re welcome. I’ll stay on top of this/)).toBeVisible()
  await expect(chat.log.getByRole('separator', { name: SESSION_ENDED })).toBeVisible()
  await expect(chat.survey).toBeVisible()
  await expect(chat.input).toBeDisabled()

  await chat.rating(5).click()
  await chat.comment.fill('Adam was great')
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
  await expect(chat.newConversation).toBeVisible()
  await expect(chat.survey).toBeHidden()
  await expect(chat.input).toBeEnabled()
  await expect(chat.input).toHaveAttribute('placeholder', 'What would you like to ask to Tammy?')
  await chat.say('hello again')
  await expect(chat.reply('Hi again! How can I help you today?')).toBeVisible()
})

test('agents-busy: a ticket is created, details update it, then Adam joins', async ({ chat }) => {
  await chat.open('agents-busy')
  await chat.input.press('Enter')
  await expect(chat.log.getByText(/^All agents are currently busy/)).toBeVisible({ timeout: 10_000 })
  await expect(chat.input).toHaveAttribute('placeholder', 'Share more details about your issue...')
  await expect(chat.input).toHaveValue(/^The restriction message doesn’t provide any details/)
  await chat.input.press('Enter')
  await expect(chat.log.getByText(/^Thanks for the details. Your support ticket has been updated/)).toBeVisible()
  await expect(chat.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
  await chat.input.press('Enter')
  await expect(chat.reply(/^At this point, I’ll need to escalate this/)).toBeVisible()
})

test('survey: scale, comment, sending and thanks, then a new conversation', async ({ chat }) => {
  await chat.open('survey')
  await expect(chat.survey.getByRole('heading', { name: 'How satisfied are you with your recent support experience?' })).toBeVisible()
  await chat.rating(4).click()
  await expect(chat.rating(4)).toHaveAttribute('aria-checked', 'true')
  await expect(chat.comment).toBeVisible()
  await chat.comment.fill('Quick and clear')
  await chat.sendFeedback.click()
  await expect(chat.survey.getByRole('button', { name: 'Sending' })).toBeDisabled()
  await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
  await expect(chat.newConversation).toBeVisible()
  await expect(chat.input).toBeEnabled()
})

test('survey-error: the first send fails, Try again sends it', async ({ chat }) => {
  await chat.open('survey-error')
  await chat.rating(2).click()
  await chat.comment.fill('Slow answer')
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Your feedback hasn’t been sent')).toBeVisible()
  await chat.survey.getByRole('button', { name: 'Try again' }).click()
  await expect(chat.comment).toHaveValue('Slow answer')
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Thank you for your feedback')).toBeVisible()
  await expect(chat.newConversation).toBeVisible()
})

for (const [flow, message] of [
  ['error-availability', 'We couldn’t confirm support agent availability right now. Please try again.'],
  ['error-connect', 'We couldn’t connect you to a support agent at the moment. Please try again.'],
  ['error-request', 'We couldn’t complete this request at the moment. Please try again.'],
] as const) {
  test(`${flow}: Try again connects with Adam`, async ({ chat }) => {
    await chat.open(flow)
    await chat.input.press('Enter')
    await expect(chat.alert).toHaveText(message, { timeout: 10_000 })
    await chat.retry.click()
    await expect(chat.reply(ADAM_HELLO)).toBeVisible({ timeout: 15_000 })
    await expect(chat.alert).toBeHidden()
    await expect(chat.input).toBeEnabled()
  })
}

test('session-expired: Continue starts a new session with Tammy', async ({ chat, page }) => {
  await chat.open('session-expired')
  await expect(chat.alert).toHaveText('Your session has expired due to inactivity. Please continue to chat again.')
  await chat.continue.click()
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible()
  await expect(chat.securityNotice).toBeVisible()
  await chat.say('My account is still restricted')
  await expect(chat.reply('Hi again! How can I help you today?')).toBeVisible()
})

test('history-error: Try again loads the previous messages', async ({ chat }) => {
  await chat.open('history-error')
  await expect(chat.alert).toHaveText('We couldn’t load your previous messages. Please try again.')
  await chat.retry.click()
  await expect(chat.reply(OPENING)).toBeVisible()
  await expect(chat.input).toHaveValue(ASK_FOR_AGENT)
  await chat.reachAdam()
})
