# AssistantMessage

An answer from Tammy or from a live agent: the assistant mark, the text, and thumbs to rate it.

- Children: one or more `<p>`, `<ol>` or `<a>`. Paragraphs sit 14px apart. Links use `color-link`, underlined, and open in a new tab, so say so in the copy ("This link will open in a new tab.").
- `sender` names who is speaking ("Tammy", "Adam, support agent"); screen readers announce it.
- Thumbs: one choice per message, tap again to undo. `feedback={false}` hides them (system answers).
- No bubble: text in `color-text-strong` straight on `color-surface`.
