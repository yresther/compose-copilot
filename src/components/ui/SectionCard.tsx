import type { ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** 제목 행 오른쪽 (링크, 드롭다운 등) */
  right?: ReactNode
  className?: string
  children: ReactNode
}

/** 흰 카드 + 제목 행 */
export default function SectionCard({ title, right, className = '', children }: Props) {
  return (
    <section className={`rounded-card bg-white ${className}`}>
      <header className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold text-gray-900">{title}</h2>
        {right}
      </header>
      {children}
    </section>
  )
}

/** 밑줄 텍스트 링크 (자세히 보기) */
/** size sm: 카드 안 '자세히 보기' (14px) / md: 16px */
export function TextLink({ children, onClick, size = 'md' }: { children: ReactNode; onClick?: () => void; size?: 'sm' | 'md' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size === 'sm' ? 'text-[14px]' : 'text-[16px]'} text-gray-600 underline underline-offset-2 hover:text-gray-900`}
    >
      {children}
    </button>
  )
}
