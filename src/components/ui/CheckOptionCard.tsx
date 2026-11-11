import type { ReactNode } from 'react'
import Checkbox from './Checkbox'

type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** 오른쪽 보조 정보 (전화번호, 이메일 등) */
  aside?: ReactNode
  /** 라벨 아래 설명 (있으면 카드가 두 줄 높이) */
  description?: string
  className?: string
}

/** 선택하면 노란 테두리·배경으로 바뀌는 체크 카드 */
export default function CheckOptionCard({ checked, onChange, label, aside, description, className = '' }: Props) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), onChange(!checked))}
      className={`flex ${description ? 'h-[78px]' : 'h-[67px]'} cursor-pointer items-center rounded-card border pl-[18px] pr-[34px] transition-colors ${
        checked ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-white hover:bg-gray-100'
      } ${className}`}
    >
      <span aria-hidden className="pointer-events-none">
        <Checkbox checked={checked} size="sm" />
      </span>
      <span className="ml-3.5">
        <span className="block text-[15px] text-gray-900">{label}</span>
        {description && <span className="mt-0.5 block text-[13px] text-gray-500">{description}</span>}
      </span>
      {aside && <span className="ml-auto font-num text-[15px] text-gray-900">{aside}</span>}
    </div>
  )
}
