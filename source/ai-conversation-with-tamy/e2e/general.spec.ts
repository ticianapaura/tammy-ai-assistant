import { FIRST_ANSWER, FIRST_MESSAGE, FIVE_OPTIONS, expect, test } from './fixtures'

// Behaviour shared by every flow: navigation, scrolling, motion, accessibility, layout.

const FLOWS = [
  'welcome',
  'link',
  'long-message',
  'options',
  'options-10',
  'error-generating',
  'error-request',
  'not-delivered',
  'session-expired',
]

test('switching flows mid-answer starts the new one clean', async ({ chat, page }) => {
  await chat.open('error-generating')
  await expect(chat.typing).toBeVisible()
  await page.evaluate(() => (location.hash = 'link'))
  await expect(chat.reply(/To update your settlement bank account/)).toBeVisible()
  // Outlive the old flow's timers: its error banner must never show up here.
  await page.waitForTimeout(3000)
  await expect(chat.alert).toBeHidden()
  await expect(chat.typing).toBeHidden()
  await expect(chat.userMessages).toHaveCount(1)
  await expect(chat.input).toBeEnabled()
})

test('reloading mid-flow restarts it cleanly', async ({ chat, page }) => {
  await chat.open('welcome')
  await chat.input.press('Enter')
  await expect(chat.typing).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Welcome!' })).toBeVisible()
  await expect(chat.input).toHaveValue(FIRST_MESSAGE)
  await page.waitForTimeout(2000)
  await expect(chat.userMessages).toHaveCount(0)
  await chat.input.press('Enter')
  await expect(chat.reply(FIRST_ANSWER)).toHaveCount(1)
})

test('scrolling up to read is respected; at the bottom the chat follows', async ({ chat, page }) => {
  await chat.open('welcome')
  await chat.input.press('Enter')
  await expect(chat.reply(FIRST_ANSWER)).toBeVisible()
  await chat.input.press('Enter')
  await expect(chat.reply(FIVE_OPTIONS)).toBeVisible()
  await page.waitForTimeout(800)

  const position = () =>
    chat.log.evaluate((log) => ({ top: log.scrollTop, bottom: log.scrollHeight - log.clientHeight }))

  await chat.option(1).click()
  await page.waitForTimeout(800)
  await chat.log.hover()
  await page.mouse.wheel(0, -3000)
  await expect.poll(async () => (await position()).top).toBe(0)
  await expect(chat.reply(/update your Monthly Processing Volume/)).toBeAttached()
  await page.waitForTimeout(800)
  expect((await position()).top).toBe(0)

  // Back at the bottom, the next answer is followed.
  await chat.log.evaluate((log) => (log.scrollTop = log.scrollHeight))
  await page.waitForTimeout(200)
  await chat.say('100k')
  await expect(chat.reply(/I’ve noted that/)).toBeVisible()
  await expect.poll(async () => {
    const { top, bottom } = await position()
    return bottom - top
  }).toBeLessThan(2)
})

for (const flow of FLOWS) {
  test(`StrictMode adds nothing twice when opening ${flow}`, async ({ chat, page }) => {
    await chat.open(flow)
    await page.waitForTimeout(3000)
    const ids = await chat.log.evaluate((log) => {
      const thread = log.firstElementChild!
      return Array.from(thread.children, (child) => child.textContent)
    })
    const repeated = ids.filter((text, i) => text && i > 0 && text === ids[i - 1])
    expect(repeated).toEqual([])
    expect(await chat.userMessages.count()).toBeLessThanOrEqual(1)
  })
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('spinners and Writing... don’t animate', async ({ chat, page }) => {
    await chat.open('error-request')
    await expect(chat.typing).toBeVisible()
    const running = () =>
      page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)
    await page.waitForTimeout(100)
    expect(await running()).toBe(0)
    await chat.retry.click()
    await expect(chat.retry.locator('svg[class*="spin"]')).toBeVisible()
    await page.waitForTimeout(100)
    expect(await running()).toBe(0)
  })
})

test('every control has an accessible name and a visible focus ring', async ({ chat, page }) => {
  await chat.open('options')
  await expect(chat.options).toBeVisible()
  await chat.input.fill('hello')

  for (const control of await page.locator('button, a[href], textarea').all()) {
    await expect(control).toHaveAccessibleName(/\S/)
  }

  await page.getByRole('heading', { name: 'Tammy' }).click()
  const seen = new Set<string>()
  let first: string | undefined
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('Tab')
    const focus = await page.evaluate(() => {
      const element = document.activeElement as HTMLElement
      if (element === document.body) return null
      const own = getComputedStyle(element)
      const box = element.closest('[class*="composer"]')
      const ring =
        (own.outlineStyle !== 'none' && parseFloat(own.outlineWidth) >= 2) ||
        (box !== null && getComputedStyle(box).boxShadow !== 'none')
      return { name: `${element.tagName} ${element.getAttribute('aria-label') ?? element.textContent}`, ring }
    })
    // Tabbing past the last control lands on the page itself; that ends the round.
    if (!focus || focus.name === first) break
    first ??= focus.name
    seen.add(focus.name)
    expect(focus.ring, `focus ring on ${focus.name}`).toBe(true)
  }
  expect(seen.size).toBeGreaterThan(8)
})

test('minimize and close do nothing yet and break nothing', async ({ chat, page }) => {
  await chat.open('options')
  await expect(chat.options).toBeVisible()
  await page.getByRole('button', { name: 'Minimize chat' }).click()
  await page.getByRole('button', { name: 'Close chat' }).click()
  await expect(chat.log).toBeVisible()
  await chat.option(5).click()
  await expect(chat.reply(/update your Refund Policy/)).toBeVisible()
})

for (const flow of FLOWS) {
  test(`${flow} fits the screen without sideways scrolling @layout`, async ({ chat, page }) => {
    await chat.open(flow)
    await page.waitForTimeout(2600)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const header = await page.getByRole('button', { name: 'Close chat' }).boundingBox()
    expect(header!.x + header!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  })
}

test('the too-long error fits the screen @layout', async ({ chat, page }) => {
  await chat.open('long-message')
  await chat.input.fill('word '.repeat(41))
  await expect(chat.tooLong).toBeVisible()
  const width = page.viewportSize()!.width
  for (const part of [chat.tooLong, chat.send, chat.counter]) {
    const box = await part.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
  }
})

test('ten options fit in two rows @layout', async ({ chat, page }) => {
  await chat.open('options-10')
  await expect(chat.options).toBeVisible()
  const last = await chat.option(10).boundingBox()
  expect(last!.x + last!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
})
