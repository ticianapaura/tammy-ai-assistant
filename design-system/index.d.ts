import type * as React from 'react';
export interface ChatHeaderProps { /** Assistant name, from the merchant's brand config. Default "Tammy". */ name?: string; onMinimize?: () => void; onClose?: () => void }
export declare function ChatHeader(props: ChatHeaderProps): React.ReactElement;
export interface UserMessageProps { children: React.ReactNode }
export declare function UserMessage(props: UserMessageProps): React.ReactElement;
export interface AssistantMessageProps { /** Who is speaking: the assistant's name or the live agent's. Read by screen readers. */ sender?: string; children: React.ReactNode; /** false hides the thumbs. */ feedback?: boolean; defaultFeedback?: 'up' | 'down' | null; onFeedback?: (value: 'up' | 'down' | null) => void }
export declare function AssistantMessage(props: AssistantMessageProps): React.ReactElement;
export interface TypingIndicatorProps { label?: string }
export declare function TypingIndicator(props: TypingIndicatorProps): React.ReactElement;
export interface OptionButtonsProps { /** How many numbered options the answer lists (1–10). */ count?: number; label?: string; onSelect?: (n: number) => void }
export declare function OptionButtons(props: OptionButtonsProps): React.ReactElement;
export interface WelcomeProps { name?: string; notice?: React.ReactNode }
export declare function Welcome(props: WelcomeProps): React.ReactElement;
export interface ComposerProps { placeholder?: string; maxLength?: number; defaultValue?: string; disabled?: boolean; label?: string; onSend?: (text: string) => void }
export declare function Composer(props: ComposerProps): React.ReactElement;
export interface FeedbackTextareaProps { placeholder?: string; label?: string; defaultValue?: string; maxLength?: number; onChange?: React.ChangeEventHandler<HTMLTextAreaElement> }
export declare function FeedbackTextarea(props: FeedbackTextareaProps): React.ReactElement;
export interface BannerProps { tone?: 'error' | 'info'; /** wide: text button (desktop). compact: round icon button (mobile). */ layout?: 'wide' | 'compact'; action?: 'retry' | 'continue'; actionLabel?: string; onAction?: () => void; children: React.ReactNode }
export declare function Banner(props: BannerProps): React.ReactElement;
export interface SystemNoteProps { children: React.ReactNode }
export declare function SystemNote(props: SystemNoteProps): React.ReactElement;
export interface StatusPillProps { variant?: 'divider' | 'loading'; children: React.ReactNode }
export declare function StatusPill(props: StatusPillProps): React.ReactElement;
export interface ButtonProps { variant?: 'accent' | 'danger'; state?: 'idle' | 'loading' | 'done'; doneLabel?: string; disabled?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children?: React.ReactNode }
export declare function Button(props: ButtonProps): React.ReactElement;
export interface RatingScaleProps { variant?: 'mono' | 'color'; defaultValue?: 1 | 2 | 3 | 4 | 5; label?: string; onChange?: (value: number) => void }
export declare function RatingScale(props: RatingScaleProps): React.ReactElement;
export interface SatisfactionSurveyProps { question?: string; ratingVariant?: 'mono' | 'color'; initialStep?: 'rating' | 'comment' | 'sending' | 'sent' | 'failed' | 'retry'; /** Preview only: which outcome the fake send ends in. */ simulate?: 'success' | 'error'; delay?: number; onSubmit?: () => void; onClose?: () => void }
export declare function SatisfactionSurvey(props: SatisfactionSurveyProps): React.ReactElement;
declare global { interface Window { Tammy: { ChatHeader: typeof ChatHeader; UserMessage: typeof UserMessage; AssistantMessage: typeof AssistantMessage; TypingIndicator: typeof TypingIndicator; OptionButtons: typeof OptionButtons; Welcome: typeof Welcome; Composer: typeof Composer; FeedbackTextarea: typeof FeedbackTextarea; Banner: typeof Banner; SystemNote: typeof SystemNote; StatusPill: typeof StatusPill; Button: typeof Button; RatingScale: typeof RatingScale; SatisfactionSurvey: typeof SatisfactionSurvey } } }
