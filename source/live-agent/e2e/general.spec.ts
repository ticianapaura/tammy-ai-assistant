import { ADAM_HELLO, ASK_FOR_AGENT, OPENING, expect, test } from './fixtures'

// Behaviour shared by every flow: navigation, scrolling, motion, accessibility, layout.

const FLOWS = [
  'handoff',
  'agents-busy',
  'survey',
  'survey-error',
  'error-availability',
  'error-connect',
  'error-request',
  'session-expired',
  'history-error',
]

test('switching flows while connecting starts the new one clean', async ({ chat, page }) => {
  await chat.open('handoff')
  await chat.input.press('Enter')
  await expect(chat.connecting).toBeVisible({ timeout: 10_000 })
  await page.evaluate(() => (location.hash = 'survey'))
  await expect(chat.survey).toBeVisible()
  // Outlive the old flow's timers: Adam must never join here.
  await page.waitForTimeout(6000)
  await expect(chat.connecting).toHaveCount(0)
  await expect(chat.reply(ADAM_HELLO)).toHaveCount(0)
  await expect(chat.typing).toBeHidden()
  await expect(chat.userMessages).toHaveCount(1)
  await expect(chat.input).toBeDisabled()
})

test('reloading mid-flow restarts it cleanly', async ({ chat, page }) => {
  await chat.open('handoff')
  await chat.input.press('Enter')
  await expect(chat.connecting).toBeVisible({ timeout: 10_000 })
  await page.reload()
  await expect(chat.reply(OPENING)).toBeVisible()
  await expect(chat.input).toHaveValue(ASK_FOR_AGENT)
  await expect(chat.input).toBeEnabled()
  await page.waitForTimeout(3000)
  await expect(chat.connecting).toHaveCount(0)
  await expect(chat.userMessages).toHaveCount(1)
  await chat.reachAdam()
  await expect(chat.reply(ADAM_HELLO)).toHaveCount(1)
})

test('scrolling up to read is respected; at the bottom the chat follows', async ({ chat, page }) => {
  await chat.open('handoff')
  await chat.reachAdam()
  await page.waitForTimeout(800)
  const position = () =>
    chat.log.evaluate((log) => ({ top: log.scrollTop, bottom: log.scrollHeight - log.clientHeight }))

  await chat.input.press('Enter')
  await page.waitForTimeout(800)
  await chat.log.hover()
  await page.mouse.wheel(0, -3000)
  await expect.poll(async () => (await position()).top).toBe(0)
  await expect(chat.reply(/^At this point, I’ll need to escalate this/)).toBeAttached()
  await page.waitForTimeout(800)
  expect((await position()).top).toBe(0)

  await chat.log.evaluate((log) => (log.scrollTop = log.scrollHeight))
  await page.waitForTimeout(200)
  await chat.input.press('Enter')
  await expect(chat.reply('It typically takes 1–2 business days.')).toBeVisible()
  await expect.poll(async () => {
    const { top, bottom } = await position()
    return bottom - top
  }).toBeLessThan(2)
})

for (const flow of FLOWS) {
  test(`StrictMode adds nothing twice when opening ${flow}`, async ({ chat, page }) => {
    await chat.open(flow)
    await page.waitForTimeout(1500)
    const texts = await chat.log.evaluate((log) => Array.from(log.firstElementChild!.children, (child) => child.textContent))
    const repeated = texts.filter((text, i) => text && i > 0 && text === texts[i - 1])
    expect(repeated).toEqual([])
    expect(await chat.page.getByRole('region', { name: 'Satisfaction survey' }).count()).toBeLessThanOrEqual(1)
  })
}

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the Connecting spinner, Writing... and the retry spinner don’t animate', async ({ chat, page }) => {
    const running = () =>
      page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === 'running').length)
    await chat.open('error-connect')
    await chat.input.press('Enter')
    await expect(chat.typing).toBeVisible()
    await page.waitForTimeout(100)
    expect(await running()).toBe(0)
    await expect(chat.connecting).toBeVisible({ timeout: 10_000 })
    await page.waitForTimeout(100)
    expect(await running()).toBe(0)
    await chat.retry.click()
    await expect(chat.retry.locator('svg[class*="spin"]')).toBeVisible()
    await page.waitForTimeout(100)
    expect(await running()).toBe(0)
  })
})

for (const flow of ['handoff', 'survey']) {
  test(`every control in ${flow} has an accessible name and a visible focus ring`, async ({ chat, page }) => {
    await chat.open(flow)
    if (flow === 'handoff') await chat.reachAdam()

    for (const control of await page.locator('button, a[href], textarea, [role="radio"]').all()) {
      await expect(control).toHaveAccessibleName(/\S/)
    }

    await page.getByRole('heading', { name: 'Tammy' }).click()
    const seen = new Set<string>()
    let first: string | undefined
    for (let i = 0; i < 30; i++) {
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
      if (!focus || focus.name === first) break
      first ??= focus.name
      seen.add(focus.name)
      expect(focus.ring, `focus ring on ${focus.name}`).toBe(true)
    }
    expect(seen.size).toBeGreaterThan(4)
  })
}

test('minimize and close do nothing yet and break nothing', async ({ chat, page }) => {
  await chat.open('handoff')
  await page.getByRole('button', { name: 'Minimize chat' }).click()
  await page.getByRole('button', { name: 'Close chat' }).click()
  await expect(chat.log).toBeVisible()
  await chat.reachAdam()
})

for (const flow of FLOWS) {
  test(`${flow} fits the screen without sideways scrolling @layout`, async ({ chat, page }) => {
    await chat.open(flow)
    await page.waitForTimeout(1000)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    const close = await page.getByRole('button', { name: 'Close chat' }).boundingBox()
    expect(close!.x + close!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  })
}

test('every survey step fits the screen @layout', async ({ chat, page }) => {
  const width = page.viewportSize()!.width
  const fits = async () => {
    const box = await chat.survey.boundingBox()
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  }
  await chat.open('survey-error')
  await fits()
  for (const n of [1, 2, 3, 4, 5]) {
    const radio = await chat.rating(n).boundingBox()
    expect(radio!.width).toBeGreaterThanOrEqual(24)
  }
  await chat.rating(5).click()
  await expect(chat.comment).toBeVisible()
  await fits()
  await chat.sendFeedback.click()
  await expect(chat.survey.getByText('Your feedback hasn’t been sent')).toBeVisible()
  await fits()
})

test('the connecting pill and busy notes fit the screen @layout', async ({ chat, page }) => {
  await chat.open('agents-busy')
  await chat.input.press('Enter')
  await expect(chat.connecting).toBeVisible({ timeout: 10_000 })
  const pill = await chat.connecting.locator('span').first().boundingBox()
  expect(pill!.x).toBeGreaterThanOrEqual(0)
  expect(pill!.x + pill!.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  await expect(chat.log.getByText(/^All agents are currently busy/)).toBeVisible({ timeout: 10_000 })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})
