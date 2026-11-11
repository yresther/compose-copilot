import { Check, ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useDismiss } from '../../hooks/useDismiss'

export type DropdownOption<V extends string> = { value: V; label: string }

type Props<V extends string> = {
  options: DropdownOption<V>[]
  value: V
  onChange: (value: V) => void
  /** boxed: 테두리 상자 (전체 ∨) / plain: 글자만 (채널별 ∨) / pill: 흰 알약 + 앞 아이콘 (패턴 분석 필터) — 모두 열리면 노란 테두리 */
  variant?: 'boxed' | 'plain' | 'pill'
  ariaLabel?: string
  /** 버튼에 보일 글자 (기본: 고른 항목 이름) */
  displayLabel?: ReactNode
  /** 알약 앞 아이콘 */
  icon?: ReactNode
}

/** 아래로 펼쳐지는 선택 목록 — 바깥 클릭·ESC로 닫힘 */
export default function Dropdown<V extends string>({ options, value, onChange, variant = 'boxed', ariaLabel, displayLabel, icon }: Props<V>) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const current = options.find((o) => o.value === value)

  const frame =
    variant === 'boxed'
      ? `h-[34px] min-w-[81px] rounded-btn bg-white pl-3 pr-2.5 ${open ? 'border-yellow-300' : 'border-gray-300'}`
      : variant === 'pill'
        ? `h-[46px] rounded-full bg-white pl-[18px] pr-5 gap-3 ${open ? 'border-yellow-300' : 'border-transparent'}`
        : `h-[34px] rounded-btn pl-3 pr-2.5 ${open ? 'border-yellow-300 bg-white' : 'border-transparent'}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-between gap-2 border-[1.5px] text-[15px] transition-colors ${frame} ${
          open ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {icon}
        <span className={variant === 'pill' ? 'text-gray-800' : undefined}>{displayLabel ?? current?.label}</span>
        <ChevronDown size={16} strokeWidth={1.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute top-[calc(100%+6px)] z-30 min-w-full ${variant === 'pill' ? 'left-0' : 'right-0'} animate-fade-in max-h-[264px] overflow-y-auto rounded-input border border-gray-200 bg-white py-1.5 shadow-float`}
        >
          {options.map((o) => {
            const selected = o.value === value
            return (
              <li key={o.value} ref={selected ? (el) => el?.scrollIntoView({ block: 'nearest' }) : undefined}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(o.value)
                    close()
                  }}
                  className={`flex h-9 w-full items-center justify-between gap-6 whitespace-nowrap px-3.5 text-left text-[14px] hover:bg-gray-100 ${
                    selected ? 'font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {o.label}
                  <Check size={15} strokeWidth={2.5} className={selected ? 'text-yellow-700' : 'invisible'} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
