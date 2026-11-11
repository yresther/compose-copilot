import { useCallback, useRef, useState } from 'react'
import calendarIcon from '../../assets/icons/calendar.svg'
import { useDismiss } from '../../hooks/useDismiss'
import { formatDate, kstDay } from '../../lib/kst'
import DatePicker, { type YMD } from './DatePicker'

type Props = {
  value: YMD
  onChange: (date: YMD) => void
}

// 페이지 오른쪽 위 날짜 알약 — 누르면 날짜 선택 달력이 아래로 열린다 (열린 동안 노란 테두리)
export default function DatePill({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(ref, open, close)

  const today = kstDay()
  const label = formatDate({ ...today, ...value, weekday: weekdayOf(value) })

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[47px] w-[271px] items-center justify-between rounded-full border-[1.5px] bg-white pl-[22px] pr-5 font-num text-[16px] transition-colors ${
          open ? 'border-yellow-300 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        {label}
        <img src={calendarIcon} alt="" className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-30 animate-fade-in">
          <DatePicker
            value={value}
            max={{ y: today.y, m: today.m, d: today.d }}
            onClose={close}
            onApply={(d) => {
              onChange(d)
              close()
            }}
          />
        </div>
      )}
    </div>
  )
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const weekdayOf = (p: YMD) => WEEKDAYS[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()]
