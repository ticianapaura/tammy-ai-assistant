# SatisfactionSurvey

The card shown after a live chat session ends.

**Flow**: rating → comment (optional) → sending → "Thank you for your feedback" or "Your feedback hasn't been sent" (with Try again, which returns to the comment step and shows "Your feedback could not be sent. Try again").

- Appears right after the "The live chat session has ended" StatusPill.
- Close (×) dismisses it at any step; nothing is sent.
- Provide `onSubmit`; `simulate` and `delay` only drive the preview.
