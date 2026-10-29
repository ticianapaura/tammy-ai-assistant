# AI conversation with Tammy

Part of [Tammy · AI Assistant · White Label](../../README.md) by Ticiana Paura.

React 19 + TypeScript + Vite. Each flow opens at `#<flow id>` (see `src/flows/flows.ts`); `#tokens` shows the design tokens.

- `src/config/brand.ts`: the white-label settings (assistant name, copy, links).
- `src/styles/tokens.css`: design tokens. Components only use these.
- `src/chat/`: the conversation engine and the scripted flows.
- `e2e/`: Playwright tests for every flow and edge case.

```bash
npm install
npm run dev        # local server
npm run test:e2e   # end-to-end tests
```
