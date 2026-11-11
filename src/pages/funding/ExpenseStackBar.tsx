import type { ExpenseItem } from '../../lib/expense'
import { EXPENSE_BG, EXPENSE_TEXT, pct } from './expenseColors'

const BAR_WIDTH = 1114 // 막대 실제 너비(px) — 글자가 들어갈 자리인지 판단용
const fits = (share: number, need: number) => (share / 100) * BAR_WIDTH >= need

/** 총 예상지출 비중 막대 — 칸이 넓으면 '이름 %', 좁으면 '%'만, 더 좁으면 색만 */
export default function ExpenseStackBar({ items }: { items: ExpenseItem[] }) {
  return (
    <div
      className="flex h-[37px] overflow-hidden rounded-[4px]"
      role="img"
      aria-label={items.map((i) => `${i.name} ${pct(i.share)}`).join(', ')}
    >
      {items.map((i) => (
        <div
          key={i.id}
          className={`flex shrink-0 items-center gap-[11px] overflow-hidden whitespace-nowrap pl-[14px] transition-[width] duration-500 ease-out text-[14px] ${EXPENSE_BG[i.id]} ${EXPENSE_TEXT[i.id]}`}
          style={{ width: `${i.share}%`, paddingLeft: fits(i.share, 110) ? undefined : fits(i.share, 44) ? 8 : 0 }}
        >
          {fits(i.share, 110) && <span>{i.name}</span>}
          {fits(i.share, 44) && <span className="font-semibold">{pct(i.share)}</span>}
        </div>
      ))}
    </div>
  )
}
