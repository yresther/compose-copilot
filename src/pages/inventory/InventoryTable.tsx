import Badge from '../../components/ui/Badge'
import QuantityStepper from '../../components/ui/QuantityStepper'
import { CATEGORIES, type InventoryRow, type InventoryStatus } from '../../state/InventoryContext'

const STATUS: Record<InventoryStatus, { tone: 'danger' | 'warning' | 'success'; text: string }> = {
  danger: { tone: 'danger', text: '소진임박' },
  warn: { tone: 'warning', text: '주의' },
  ok: { tone: 'success', text: '여유' },
  incoming: { tone: 'warning', text: '입고 예정' },
}

const COLS = '170px 137px 120px 1fr'
const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('ko-KR') : n.toFixed(1))

type Props = {
  rows: InventoryRow[]
  category: string
  onCategory: (key: string) => void
  /** 강조할 품목 (발주관리에서 넘어온 경우) */
  highlightId?: string | null
  /** 직접 수정 모드 — 현재 재고를 −/+로 수정 */
  editing: boolean
  draft: Record<string, number>
  onDraft: (id: string, stock: number) => void
}

/** 전체 재고현황 — 왼쪽 카테고리 세로 탭 + 오른쪽 품목 표 (10줄 넘으면 표 안에서 스크롤) */
export default function InventoryTable({ rows, category, onCategory, highlightId, editing, draft, onDraft }: Props) {
  const list = rows.filter((r) => r.categoryKey === category)

  return (
    <div className="flex">
      {/* 카테고리 세로 탭 */}
      <div role="tablist" aria-orientation="vertical" className="w-[165px] shrink-0 rounded-input bg-gray-100 pb-2 pt-[38px]">
        {CATEGORIES.map((c) => {
          const active = c.key === category
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCategory(c.key)}
              className="flex h-[49px] w-full items-center"
            >
              <span
                className={`flex h-[35px] w-full items-center justify-between border-l-4 pl-[9px] pr-4 text-[14px] transition-colors ${
                  active ? 'border-yellow-300 bg-yellow-50 font-semibold text-gray-900' : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {c.label}
                <span className={`font-num ${active ? 'text-gray-600' : 'text-gray-500'}`}>{c.items.length}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* 품목 표 */}
      <div role="table" className="min-w-0 flex-1 text-[14px]">
        <div role="row" className="grid h-[35px] items-center bg-gray-100 pl-[41px] text-gray-700" style={{ gridTemplateColumns: COLS }}>
          <span role="columnheader">품목</span>
          <span role="columnheader">현재 재고</span>
          <span role="columnheader">소진 예상일</span>
          <span role="columnheader" className="text-center">
            상태
          </span>
        </div>
        <div className="max-h-[490px] overflow-y-auto">
          {list.map((r) => {
            const s = STATUS[r.status]
            return (
              <div
                key={r.id}
                role="row"
                className={`grid h-[49px] items-center border-b border-gray-200 pl-[41px] text-gray-900 ${highlightId === r.id ? 'bg-yellow-50' : ''}`}
                style={{ gridTemplateColumns: COLS }}
              >
                <span role="cell">{r.name}</span>
                <span role="cell" className="font-num">
                  {editing ? (
                    <QuantityStepper value={draft[r.id] ?? r.stock} min={0} step={r.unit === 'kg' ? 0.1 : 1} onChange={(v) => onDraft(r.id, v)} />
                  ) : (
                    <>
                      {fmt(r.stock)} {r.unit}
                      {r.incoming && (
                        <span className="ml-2 text-[13px] font-semibold text-yellow-700">
                          +{r.incoming.qty}
                          {r.incoming.unit}
                        </span>
                      )}
                    </>
                  )}
                </span>
                <span role="cell" className="font-num text-gray-800">
                  {r.status === 'danger' || r.status === 'warn' ? `D - ${r.days}` : '-'}
                </span>
                <span role="cell" className="flex justify-center">
                  <Badge tone={s.tone} size="sm">
                    {s.text}
                  </Badge>
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
