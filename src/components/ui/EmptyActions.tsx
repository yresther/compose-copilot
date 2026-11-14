import { ClipboardCheck } from 'lucide-react'
import dashboard from '../../data/dashboard.json'

/** 오늘의 할 일이 하나도 없을 때 (모두 삭제했거나 아직 생기지 않음) — 홈 · 오늘의 할 일 페이지 공용 */
/** none: 할 일이 아직 없음 / allDone: 모두 완료해서 남은 할 일이 없음 / done: 완료한 항목 탭이 비었음 */
export default function EmptyActions({ className = '', variant = 'none' }: { className?: string; variant?: 'none' | 'allDone' | 'done' }) {
  const e = variant === 'done' ? dashboard.emptyDone : variant === 'allDone' ? dashboard.emptyAllDone : dashboard.emptyActions
  return (
    <div className={`flex flex-col items-center rounded-card bg-white px-6 py-[52px] text-center ${className}`}>
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-yellow-50">
        <ClipboardCheck size={24} strokeWidth={1.75} className="text-yellow-700" />
      </span>
      <p className="mt-[18px] text-[18px] font-semibold text-gray-900">{e.title}</p>
      <p className="mt-[8px] whitespace-pre-line text-[15px] leading-[23px] text-gray-500">{e.desc}</p>
    </div>
  )
}
