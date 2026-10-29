// Provisional line icons drawn from the PNG designs. Replace each one with the
// exported SVG from the design file; keep the names and the currentColor fill.
import type { ReactNode, SVGProps } from 'react'

type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>

function Svg({ size = 20, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function BotIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="4" width="14" height="8" rx="3" />
      <rect x="5" y="14" width="14" height="6" rx="3" />
      <circle cx="9.5" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function MinusIcon(props: IconProps) {
  return (
    <Svg size={12} {...props}>
      <path d="M6 12h12" />
    </Svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg size={12} {...props}>
      <path d="M7 7l10 10M17 7L7 17" />
    </Svg>
  )
}

export function SendIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6l7 6-7 6M10 6h4l7 6-7 6h-4" />
    </Svg>
  )
}

export function ThumbUpIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <path d="M8 10v10H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h3zm0 0l4-6a2 2 0 0 1 3 1.7V9h4a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.8 20H8" />
    </Svg>
  )
}

export function ThumbDownIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <path d="M16 14V4h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3zm0 0l-4 6a2 2 0 0 1-3-1.7V15H5a2 2 0 0 1-2-2.3l1.2-7A2 2 0 0 1 6.2 4H16" />
    </Svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16h.01" />
    </Svg>
  )
}

export function WarningIcon(props: IconProps) {
  return (
    <Svg size={16} {...props}>
      <path d="M12 4l9 16H3L12 4z" />
      <path d="M12 10v4M12 17h.01" />
    </Svg>
  )
}

export function RetryIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </Svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg size={18} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  )
}

export function SpinnerIcon(props: IconProps) {
  return (
    <Svg size={16} {...props}>
      <path d="M12 3a9 9 0 1 1-8.5 6" />
    </Svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg size={14} {...props}>
      <path d="M5 12l5 5 9-10" />
    </Svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <Svg size={72} strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M7.5 12.5l3 3 6-7" />
    </Svg>
  )
}

export function XCircleIcon(props: IconProps) {
  return (
    <Svg size={72} strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 8l8 8M16 8l-8 8" />
    </Svg>
  )
}
