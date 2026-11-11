import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { useRef, useState } from 'react'
import { useDismiss } from '../../hooks/useDismiss'
import { sameMonth, selectableMonths, type Month } from '../../lib/expense'

type Props = { value: Month; isCurrent: boolean; onChange: (m: Month) => void; onRefresh: () => void }

export const monthTitle = (m: Month, isCurrent: boolean) => `${m.m}월 ${isCurrent ? '예상지출' : '지출'}`

/** ‹ N월 예상지출 ▾ › ⟳ — 이번 달 ~ 지난 5달 */
export default function MonthSelector({ value, isCurrent, onChange, onRefresh }: Props) {
  const months = selectableMonths()
  const idx = months.findIndex((m) => sameMonth(m, value))
  const [open, setOpen] = useState(false)
  const [spin, setSpin] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))

  const arrow =
    'flex h-7 w-7 items-center justify-center rounded-btn text-gray-800 hover:bg-gray-200 disabled:pointer-events-none disabled:text-gray-300'
  return (
    <div className="flex items-center">
      <button
        type="button"
        aria-label="이전 달"
        className={`-ml-[6px] ${arrow}`}
        disabled={idx >= months.length - 1}
        onClick={() => onChange(months[idx + 1])}
      >
        <ChevronLeft size={22} strokeWidth={1.75} />
      </button>
      <div ref={ref} className="relative ml-[2px]">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-3 text-pagetitle text-gray-900"
        >
          {monthTitle(value, isCurrent)}
          <svg
            width="11"
            height="8"
            viewBox="0 0 11 8"
            aria-hidden
            className={`text-gray-800 transition-transform ${open ? 'rotate-180' : ''}`}
          >
            <path d="M5.5 7.5 0.5 0.5h10z" fill="currentColor" />
          </svg>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 top-[calc(100%+8px)] z-20 w-[180px] animate-fade-in rounded-input border border-gray-300 bg-white py-1.5 shadow-float"
          >
            {months.map((m, i) => {
              const on = i === idx
              return (
                <li key={`${m.y}-${m.m}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => {
                      onChange(m)
                      setOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-[15px] hover:bg-gray-100 ${on ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
                  >
                    {m.y}년 {monthTitle(m, i === 0)}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      <button
        type="button"
        aria-label="다음 달"
        className={`ml-[2px] ${arrow}`}
        disabled={idx <= 0}
        onClick={() => onChange(months[idx - 1])}
      >
        <ChevronRight size={22} strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="새로고침"
        className="ml-[4px] flex h-7 w-7 items-center justify-center rounded-btn text-gray-400 hover:bg-gray-200 hover:text-gray-600"
        onClick={() => {
          setSpin(true)
          setTimeout(() => setSpin(false), 600)
          onRefresh()
        }}
      >
        <RefreshCw size={16} strokeWidth={1.75} className={spin ? 'animate-spin' : ''} />
      </button>
    </div>
  )
}
