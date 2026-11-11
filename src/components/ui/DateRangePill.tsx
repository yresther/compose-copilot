import { ChevronDown } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import calendarIcon from '../../assets/icons/calendar.svg'
import { useDismiss } from '../../hooks/useDismiss'
import { kstNow } from '../../lib/kst'
import { DateRangePicker, type YMD, type YMDRange } from './DatePicker'

const pad = (n: number) => String(n).padStart(2, '0')
const fmt = (p: YMD) => `${p.y}.${pad(p.m)}.${pad(p.d)}`

type Props = {
  value: YMDRange
  onChange: (range: YMDRange) => void
}

// 기간 선택 알약 — 누르면 기간 달력이 아래로 열린다 (열린 동안 노란 테두리)
export default function DateRangePill({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)
  const t = kstNow()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="분석 기간"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[46px] items-center gap-3 rounded-full border-[1.5px] bg-white pl-[18px] pr-5 text-[15px] transition-colors ${
          open ? 'border-yellow-300' : 'border-transparent'
        }`}
      >
        <img src={calendarIcon} alt="" className="h-5 w-5" />
        <span className="font-num text-gray-800">
          {fmt(value.start)} ~ {fmt(value.end)}
        </span>
        <ChevronDown size={16} strokeWidth={1.5} className={`text-gray-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-30 animate-fade-in">
          <DateRangePicker
            value={value}
            max={{ y: t.y, m: t.m, d: t.d }}
            onClose={close}
            onApply={(r) => {
              onChange(r)
              close()
            }}
          />
        </div>
      )}
    </div>
  )
}
