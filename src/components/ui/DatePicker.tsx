import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export type YMD = { y: number; m: number; d: number }
export type YMDRange = { start: YMD; end: YMD }

const WEEK = ['월', '화', '수', '목', '금', '토', '일']
const toKey = (p: YMD) => p.y * 10000 + p.m * 100 + p.d
const sameDay = (a: YMD, b: YMD) => toKey(a) === toKey(b)

type DayState = { selected: boolean; inRange?: boolean; rangeStart?: boolean; rangeEnd?: boolean }

/** 달력 공통 틀 — 월 이동, 요일, 날짜 칸, 닫기/적용 (월요일 시작, 오늘 이후는 선택 불가) */
function CalendarCard({
  initialView,
  max,
  dayState,
  onPick,
  hint,
  canApply = true,
  onApply,
  onClose,
}: {
  initialView: { y: number; m: number }
  max: YMD
  dayState: (date: YMD) => DayState
  onPick: (date: YMD) => void
  hint?: ReactNode
  canApply?: boolean
  onApply: () => void
  onClose: () => void
}) {
  const [view, setView] = useState(initialView)

  const first = new Date(Date.UTC(view.y, view.m - 1, 1))
  const lead = (first.getUTCDay() + 6) % 7 // 월요일 시작 기준 앞 빈칸
  const days = new Date(Date.UTC(view.y, view.m, 0)).getUTCDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  const move = (delta: number) => {
    const d = new Date(Date.UTC(view.y, view.m - 1 + delta, 1))
    setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 })
  }
  const canNext = view.y * 100 + view.m < max.y * 100 + max.m

  return (
    <div className="w-[271px] rounded-[16px] bg-white px-4 pb-4 pt-5 shadow-modal">
      <div className="flex items-center justify-between pl-2">
        <p className="font-num text-[18px] font-semibold text-gray-900">
          {view.y}년 {view.m}월
        </p>
        <div className="flex gap-1">
          <button type="button" aria-label="이전 달" onClick={() => move(-1)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100">
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="다음 달"
            disabled={!canNext}
            onClick={() => move(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center text-[13px] font-semibold text-gray-500">
        {WEEK.map((w) => (
          <span key={w} className="h-7 leading-7">
            {w}
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1">
        {cells.map((d, i) => {
          if (d === null) return <span key={`e${i}`} />
          const date = { y: view.y, m: view.m, d }
          const future = toKey(date) > toKey(max)
          const today = sameDay(date, max)
          const s = dayState(date)
          return (
            <div key={d} className="relative flex h-[34px] items-center justify-center">
              {/* 기간 선택: 시작~끝 사이를 연한 노란 띠로 */}
              {s.inRange && (
                <span
                  className="absolute inset-y-0 bg-yellow-50"
                  style={{ left: s.rangeStart ? '50%' : 0, right: s.rangeEnd ? '50%' : 0 }}
                />
              )}
              <button
                type="button"
                disabled={future}
                onClick={() => onPick(date)}
                className={`relative flex h-[34px] w-[34px] items-center justify-center rounded-full font-num text-[14px] transition-colors ${
                  s.selected
                    ? 'bg-yellow-300 font-semibold text-gray-900'
                    : s.inRange
                      ? 'text-gray-900 hover:bg-yellow-100'
                      : today
                        ? 'bg-yellow-50 font-semibold text-yellow-700'
                        : future
                          ? 'cursor-default text-gray-300'
                          : 'text-gray-800 hover:bg-gray-100'
                }`}
              >
                {d}
              </button>
            </div>
          )
        })}
      </div>

      {hint && <p className="mt-3 text-center text-[13px] text-gray-500">{hint}</p>}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onClose} className="h-10 flex-1 rounded-full bg-gray-200 text-[15px] font-medium text-gray-600 hover:bg-gray-300">
          닫기
        </button>
        <button
          type="button"
          disabled={!canApply}
          onClick={onApply}
          className="h-10 flex-1 rounded-full bg-brown-900 text-[15px] font-semibold text-white hover:bg-brown-700 disabled:bg-gray-300"
        >
          적용
        </button>
      </div>
    </div>
  )
}

type Props = {
  value: YMD
  /** 오늘 — 이후 날짜는 고를 수 없음 */
  max: YMD
  onApply: (date: YMD) => void
  onClose: () => void
}

/** 단일 날짜 선택 — 고른 뒤 '적용'을 눌러야 반영 */
export default function DatePicker({ value, max, onApply, onClose }: Props) {
  const [picked, setPicked] = useState<YMD>(value)
  return (
    <CalendarCard
      initialView={{ y: value.y, m: value.m }}
      max={max}
      dayState={(date) => ({ selected: sameDay(date, picked) })}
      onPick={setPicked}
      onApply={() => onApply(picked)}
      onClose={onClose}
    />
  )
}

type RangeProps = {
  value: YMDRange
  max: YMD
  onApply: (range: YMDRange) => void
  onClose: () => void
}

/** 기간 선택 — 시작일 → 종료일 순서로 누르고 '적용' (종료일을 시작일보다 앞으로 누르면 시작일이 바뀜) */
export function DateRangePicker({ value, max, onApply, onClose }: RangeProps) {
  const [start, setStart] = useState<YMD>(value.start)
  const [end, setEnd] = useState<YMD | null>(value.end)

  const pick = (date: YMD) => {
    if (end || toKey(date) < toKey(start)) {
      setStart(date)
      setEnd(null)
    } else {
      setEnd(date)
    }
  }

  return (
    <CalendarCard
      initialView={{ y: value.end.y, m: value.end.m }}
      max={max}
      dayState={(date) => {
        const k = toKey(date)
        const isStart = sameDay(date, start)
        const isEnd = !!end && sameDay(date, end)
        const inRange = !!end && k >= toKey(start) && k <= toKey(end) && !sameDay(start, end)
        return { selected: isStart || isEnd, inRange, rangeStart: isStart, rangeEnd: isEnd }
      }}
      onPick={pick}
      hint={end ? `${start.m}/${start.d} ~ ${end.m}/${end.d}` : '종료일을 선택해주세요'}
      canApply={!!end}
      onApply={() => end && onApply({ start, end })}
      onClose={onClose}
    />
  )
}
