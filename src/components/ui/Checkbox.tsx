import { Check } from 'lucide-react'

type Props = {
  checked: boolean
  onChange?: (checked: boolean) => void
  label?: string
  /** md 20px (카드) / sm 16px (모달 선택지) */
  size?: 'md' | 'sm'
  disabled?: boolean
  className?: string
}

/** 체크 전: 회색 박스 + 흰 체크 / 체크 후: 노란 박스 */
export default function Checkbox({ checked, onChange, label, size = 'md', disabled, className = '' }: Props) {
  const sm = size === 'sm'
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`flex shrink-0 items-center justify-center transition-colors disabled:cursor-default ${sm ? 'h-4 w-4 rounded-[3px]' : 'h-5 w-5 rounded'} ${
        checked ? 'bg-yellow-500' : 'bg-gray-300'
      } ${className}`}
    >
      <Check size={sm ? 11 : 14} strokeWidth={2.5} className="text-white" />
    </button>
  )
}
