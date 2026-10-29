import { FIRST_ANSWER, FIRST_MESSAGE, FIVE_OPTIONS, expect, test } from './fixtures'

// Input edge cases. The long-message flow starts with Tammy's first answer given,
// so anything sent here gets a scripted reply.

test.beforeEach(async ({ chat }) => {
  await chat.open('long-message')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await chat.input.fill('')
})

test('empty or spaces only: send stays off and Enter does nothing', async ({ chat }) => {
  await expect(chat.send).toBeDisabled()
  await chat.input.press('Enter')
  await chat.input.fill('    ')
  await expect(chat.send).toBeDisabled()
  await chat.input.press('Enter')
  await chat.input.fill(' \n  \n ')
  await expect(chat.send).toBeDisabled()
  await chat.input.press('Enter')
  await expect(chat.userMessages).toHaveCount(1)
  await expect(chat.typing).toBeHidden()
})

test('Enter sends and Shift+Enter adds a line', async ({ chat }) => {
  await chat.input.pressSequentially('first line')
  await chat.input.press('Shift+Enter')
  await chat.input.pressSequentially('second line')
  await expect(chat.input).toHaveValue('first line\nsecond line')
  await expect(chat.userMessages).toHaveCount(1)
  await chat.input.press('Enter')
  await expect(chat.userMessages).toHaveCount(2)
  await expect(chat.input).toHaveValue('')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
})

test('typing exactly 200 characters can be sent; 201 shows the error and blocks it', async ({ chat }) => {
  await chat.input.pressSequentially('a'.repeat(200), { delay: 0 })
  await expect(chat.counter).toHaveText('200/200')
  await expect(chat.tooLong).toBeHidden()
  await expect(chat.send).toBeEnabled()

  await chat.input.press('a')
  await expect(chat.counter).toHaveText('201/200')
  await expect(chat.tooLong).toBeVisible()
  await expect(chat.input).toHaveAttribute('aria-invalid', 'true')
  await expect(chat.send).toBeDisabled()
  await chat.input.press('Enter')
  await expect(chat.userMessages).toHaveCount(1)
  await expect(chat.input).toHaveValue('a'.repeat(201))
})

test('pasting 200 characters can be sent; pasting 201 blocks it', async ({ chat, page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const paste = async (text: string) => {
    await chat.input.fill('')
    await page.evaluate((value) => navigator.clipboard.writeText(value), text)
    await chat.input.focus()
    await page.keyboard.press('ControlOrMeta+V')
  }

  await paste('b'.repeat(201))
  await expect(chat.input).toHaveValue('b'.repeat(201))
  await expect(chat.tooLong).toBeVisible()
  await expect(chat.send).toBeDisabled()

  await paste('b'.repeat(200))
  await expect(chat.tooLong).toBeHidden()
  await expect(chat.send).toBeEnabled()
  await chat.send.click()
  await expect(chat.userMessages).toHaveCount(2)
})

test('deleting from 201 back to 200 clears the error and enables send', async ({ chat }) => {
  await chat.input.fill('c'.repeat(201))
  await expect(chat.tooLong).toBeVisible()
  await chat.input.press('End')
  await chat.input.press('Backspace')
  await expect(chat.tooLong).toBeHidden()
  await expect(chat.input).not.toHaveAttribute('aria-invalid')
  await expect(chat.counter).toHaveText('200/200')
  await expect(chat.send).toBeEnabled()
})

test('the counter shows only once the text wraps, without flickering at the edge', async ({ chat }) => {
  await chat.input.pressSequentially('short')
  await expect(chat.counter).toBeHidden()

  // Type one character at a time across the wrap point and back, counting changes.
  const shown: boolean[] = []
  for (let i = 0; i < 70; i++) {
    await chat.input.press('x')
    shown.push(await chat.counter.isVisible())
  }
  for (let i = 0; i < 70; i++) {
    await chat.input.press('Backspace')
    shown.push(await chat.counter.isVisible())
  }
  const changes = shown.filter((value, i) => i > 0 && value !== shown[i - 1]).length
  expect(shown).toContain(true)
  expect(changes).toBe(2)
  await expect(chat.counter).toBeHidden()

  // A line break shows it; removing the break hides it again.
  await chat.input.press('Shift+Enter')
  await expect(chat.counter).toBeVisible()
  await chat.input.press('Backspace')
  await expect(chat.counter).toBeHidden()
})

test('emoji and accented characters count once each', async ({ chat }) => {
  await chat.input.fill(`${'😀'.repeat(60)}\n`)
  await expect(chat.counter).toHaveText('61/200')
  await chat.input.fill('👍🏽👨‍👩‍👧\n')
  await expect(chat.counter).toHaveText('3/200')
  // é written as e + combining accent (how some keyboards and pastes produce it).
  await chat.input.fill(`${'é'.repeat(150)}`)
  await expect(chat.counter).toHaveText('150/200')
  await chat.input.fill('ñandú '.repeat(33) + 'ñá')
  await expect(chat.counter).toHaveText('200/200')
  await expect(chat.send).toBeEnabled()
  await chat.input.fill('😀'.repeat(200))
  await expect(chat.tooLong).toBeHidden()
  await chat.input.press('End')
  await chat.input.pressSequentially('é')
  await expect(chat.tooLong).toBeVisible()
})

test('a message sent while Writing... is neither lost nor duplicated', async ({ chat }) => {
  await chat.open('welcome')
  await chat.input.press('Enter')
  await expect(chat.typing).toBeVisible()
  await chat.say('second')
  await chat.input.pressSequentially('a draft in progress')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await expect(chat.sent(FIRST_MESSAGE)).toHaveCount(1)
  await expect(chat.sent('second')).toHaveCount(1)
  await expect(chat.reply(FIRST_ANSWER)).toHaveCount(1)
  await expect(chat.reply(FIVE_OPTIONS)).toHaveCount(1)
  // Tammy's scripted suggestion must not replace what the person is writing.
  await expect(chat.input).toHaveValue('a draft in progress')
})

test('the input is disabled while an error banner is visible', async ({ chat }) => {
  await chat.open('error-request')
  await expect(chat.alert).toBeVisible()
  await expect(chat.input).toBeDisabled()
  await expect(chat.send).toBeDisabled()
  await chat.retry.click()
  await expect(chat.alert).toBeHidden()
  await expect(chat.input).toBeEnabled()
})
