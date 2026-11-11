import Badge from '../../components/ui/Badge'
import type { HistoryRow } from '../../state/OrdersContext'

const RESULT = {
  shortage: { tone: 'danger', text: '재고부족' },
  normal: { tone: 'success', text: '정상소진' },
  incoming: { tone: 'warning', text: '입고 예정' },
} as const

const COLS = '148px 148px 148px 148px 149px 149px 1fr'

/** 지난 발주내역 표 — AI제안 vs 실제발주, 적게 발주한 칸은 빨간 글씨 */
export default function OrderHistoryTable({ rows }: { rows: HistoryRow[] }) {
  const short = (r: HistoryRow) => r.diff.startsWith('-') && r.diff !== '-'
  return (
    <div role="table">
      <div role="row" className="grid h-[35px] items-center rounded-btn bg-gray-100 pl-[10px] text-[14px] font-medium text-gray-900" style={{ gridTemplateColumns: COLS }}>
        {['날짜', '품목', 'AI제안', '실제발주', '차이', '결과', '참고'].map((h) => (
          <span key={h} role="columnheader">
            {h}
          </span>
        ))}
      </div>
      {rows.length === 0 && <p className="py-8 text-center text-[15px] text-gray-500">해당 품목의 발주내역이 없어요.</p>}
      {rows.map((r, i) => (
        <div
          key={`${r.date}-${r.item}-${i}`}
          role="row"
          className="grid h-[41px] items-center border-b border-gray-200 pl-[10px] text-[15px] text-gray-900"
          style={{ gridTemplateColumns: COLS }}
        >
          <span role="cell" className="font-num">
            {r.date}
          </span>
          <span role="cell" className="font-medium">
            {r.item}
          </span>
          <span role="cell" className="font-num">
            {r.ai}
          </span>
          <span role="cell" className={`font-num ${short(r) && r.result === 'shortage' ? 'text-danger' : ''}`}>
            {r.actual}
          </span>
          <span role="cell" className={`font-num ${short(r) && r.result === 'shortage' ? 'text-danger' : ''}`}>
            {r.diff}
          </span>
          <span role="cell">
            <Badge tone={RESULT[r.result].tone} size="sm">
              {RESULT[r.result].text}
            </Badge>
          </span>
          <span role="cell" className="truncate">
            {r.note}
          </span>
        </div>
      ))}
    </div>
  )
}
