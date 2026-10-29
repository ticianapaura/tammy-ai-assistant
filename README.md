# Tammy · AI Assistant · White Label

A white-label AI assistant chat with live agent handoff, designed and built by **Ticiana Paura**.

🔗 **Overview:** https://ticianapaura.github.io/tammy-ai-assistant/
▶️ **AI conversation demo:** https://ticianapaura.github.io/tammy-ai-assistant/ai-conversation/
▶️ **Live agent demo:** https://ticianapaura.github.io/tammy-ai-assistant/live-agent/

This repo holds the **front-end side** of the project: both flows as working React apps, every screen of the design as HTML, and the design system behind them.

## What's inside

| Path | What |
| --- | --- |
| `index.html` | Overview: both demos, screen galleries and the design system |
| `ai-conversation/`, `live-agent/` | The two apps, built and ready to play. Each lists its nine flows; `#<flow>` opens one and `#tokens` shows the design tokens |
| `source/ai-conversation-with-tamy/`, `source/live-agent/` | Source code: React 19 + TypeScript + Vite, CSS Modules on design tokens, Playwright end-to-end tests |
| `screens/` | 31 screens across both flows, coded as HTML from the design files |
| `design-system/` | Tokens (`tokens.json`, `tokens.css`), 14 components (`bundle.js`, `bundle.css`, `index.d.ts`) and their guidelines (`components/*.md`) |

## The flows

- **AI conversation with Tammy:** welcome and security notice, typing, answers with links, numbered quick replies (5 and 10), the 200-character limit, and every error with its way out (generating, request, not delivered, session expired).
- **Live agent handoff:** connecting, all agents busy, the conversation with the agent, end of session and the satisfaction survey (including a failed send), plus availability, connection, request, session and history errors.

## Design decisions

- **White label by design.** A merchant changes `src/config/brand.ts` (assistant name, copy, links) and the brand tokens in `src/styles/tokens.css`. Layout, states and behavior stay the same.
- **One primary action at a time.** The accent color is reserved for the single main action on screen: send, or Send feedback.
- **Shape, not just color.** The person writes in a bordered bubble; the assistant speaks without one, next to its mark. Every state carries an icon and text, never color alone.
- **Errors say what failed and what to do next**, and never apologize or blame the person.
- **Accessible and tested.** Real buttons and inputs, a radio-group rating scale with arrow keys, live regions, visible focus, reduced motion. Every flow and edge case is covered by Playwright tests (`npm run test:e2e`).

## Run locally

```bash
cd source/ai-conversation-with-tamy   # or source/live-agent
npm install
npm run dev
```
