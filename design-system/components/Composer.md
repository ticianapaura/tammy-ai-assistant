# Composer

Where the person writes. Grows with the text, counts characters, and blocks sending past the limit.

**States**
- Empty: placeholder in `color-text-placeholder`, send button inactive (`color-control`).
- With text: send turns `color-accent` with `color-on-accent`. Enter sends, Shift+Enter adds a line.
- Multi-line: the text takes the full width and the counter ("199/200") sits next to send.
- Over the limit: border `color-danger`, field `color-danger-surface`, send blocked, helper "Your input exceeds the maximum allowed length!".
- Disabled: `color-surface-disabled` with `color-border-disabled`, while connecting to an agent or after a session ends.

**Placeholders by moment**: "What would you like to ask to Tammy?" (welcome), "Type..." (conversation), "Share more details about your issue..." (waiting for an agent), "What would you like to ask next" (after a session ends).

Provide `maxLength` (default 200) and `onSend`.
