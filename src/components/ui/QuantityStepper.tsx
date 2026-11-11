import { Minus, Plus } from 'lucide-react'

type Props = {
  value: number
  onChange: (value: number) => void
  min?: number
  /** 한 번에 늘리고 줄이는 양 (kg 단위 0.1 등) */
  step?: number
  disabled?: boolean
}

/** − 수량 + (최소 1) */
export default function QuantityStepper({ value, onChange, min = 1, step = 1, disabled }: Props) {
  const fix = (v: number) => Math.round(v * 10) / 10
  const btn =
    'flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-default disabled:text-gray-300 disabled:hover:bg-transparent'
  return (
    <div className="flex items-center">
      <button type="button" aria-label="수량 줄이기" disabled={disabled || value <= min} onClick={() => onChange(fix(Math.max(min, value - step)))} className={btn}>
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <span className="w-[44px] text-center font-num text-[18px] font-semibold text-gray-900">{value}</span>
      <button type="button" aria-label="수량 늘리기" disabled={disabled} onClick={() => onChange(fix(value + step))} className={btn}>
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
