import type { ReactNode } from 'react'

export type BadgeTone = 'danger' | 'success' | 'warning' | 'neutral'

const TONES: Record<BadgeTone, string> = {
  danger: 'bg-danger-bg text-danger',
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  neutral: 'bg-gray-200 text-gray-600',
}

const SIZES = {
  md: 'h-[30px] px-3 text-[14px]',
  sm: 'h-[26px] px-3 text-[13px]', // 카드 우상단 · 표 안 상태 (소진임박, 미확인 리뷰 2건, 여유, 주의)
}

type Props = { tone?: BadgeTone; size?: keyof typeof SIZES; className?: string; children: ReactNode }

export default function Badge({ tone = 'neutral', size = 'md', className = '', children }: Props) {
  return (
    <span
      className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-normal ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      {children}
    </span>
  )
}
