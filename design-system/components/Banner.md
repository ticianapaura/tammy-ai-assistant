# Banner

A message about the conversation itself: an error with a way out, or the security notice.

**Tones**
- `error`: something failed. Always offers one action. `retry` ("Try again") repeats what failed; `continue` ("Continue") starts a new session after one expired.
- `info`: the security notice. No action.

**Layouts**
- `compact` (mobile, the chat panel): round 32px icon button.
- `wide` (desktop): text button with icon.

**Copy**: say what failed and end with what to do: "We couldn't load your previous messages. Please try again." Catalogue in use:
- Something went wrong while generating the response.
- Your session has expired due to inactivity. Please continue to chat again. (continue)
- We couldn't connect you to a support agent at the moment. Please try again.
- We couldn't confirm support agent availability right now. Please try again.
- We couldn't load your previous messages. Please try again.
- Message wasn't delivered.
- We couldn't share the conversation history. Please try again.
- We couldn't send your request to a support agent. Please try again.
- We couldn't complete this request at the moment. Please try again.

Errors sit directly above the Composer, replacing any previous error.
