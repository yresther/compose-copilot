import type { ReactNode } from 'react'
import type { ExpenseItem } from '../../lib/expense'
import { EXPENSE_BG, pct, won } from './expenseColors'

type Props = {
  item: ExpenseItem
  /** 이름 옆 (주의 아이콘 등) */
  badge?: ReactNode
  sub: ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

/** 지출 한 줄 — 왼쪽 색상바 · 이름/설명 · 금액/비중 */
export default function ExpenseRow({ item, badge, sub, onMouseEnter, onMouseLeave }: Props) {
  return (
    <li
      className="relative flex h-[79px] items-center border-t border-gray-200 pl-[15px] pr-[19px] first:border-t-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className={`h-[52px] w-[6px] shrink-0 rounded-full ${EXPENSE_BG[item.id]}`} />
      <div className="ml-[19px] min-w-0">
        <p className="flex items-center gap-2 text-[18px] font-medium text-gray-900">
          {item.name}
          {badge}
        </p>
        <p className="mt-[2px] text-[14px] text-gray-700">{sub}</p>
      </div>
      <div className="ml-auto text-right">
        <p className="font-num text-[18px] font-semibold text-gray-900">{won(item.amount)}</p>
        <p className="mt-[2px] font-num text-[14px] text-gray-700">{pct(item.share)}</p>
      </div>
    </li>
  )
}
