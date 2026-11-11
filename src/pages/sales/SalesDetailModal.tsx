import { useState } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import PeriodTabs from '../../components/ui/PeriodTabs'
import { formatNumber, formatWon } from '../../lib/format'

export type RankItem = { name: string; qty: number; revenue: number }

type SortKey = 'revenue' | 'qty'
const SORTS: { key: SortKey; label: string }[] = [
  { key: 'revenue', label: '매출액순' },
  { key: 'qty', label: '판매량순' },
]

type Props = {
  open: boolean
  onClose: () => void
  /** 오늘 · 어제 · 지난주 · 지난달 */
  periodLabel: string
  /** 기간 날짜 (2026.10.19 (월), 10/6 ~ 10/12 등) */
  dateText: string
  total: number
  ranking: RankItem[]
}

// 상위 판매 '자세히 보기' 팝업 — 상위 10개 메뉴 순위, 매출액순/판매량순 정렬
export default function SalesDetailModal({ open, onClose, periodLabel, dateText, total, ranking }: Props) {
  const [sort, setSort] = useState<SortKey>('revenue')
  const rows = [...ranking].sort((a, b) => b[sort] - a[sort])
  const topShare = (ranking.reduce((s, r) => s + r.revenue, 0) / total) * 100
  const maxShare = Math.max(...ranking.map((r) => r.revenue / total))

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-12 pb-10 pt-[50px]">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-subhead text-gray-900">판매 상세</h2>
            <p className="mt-2 text-[16px] text-gray-600">
              <span className="font-semibold text-gray-700">{periodLabel}</span> · <span className="font-num">{dateText}</span> · 총 매출{' '}
              <span className="font-num">{formatWon(total)}</span>
            </p>
          </div>
          <PeriodTabs variant="light" items={SORTS} value={sort} onChange={setSort} />
        </div>

        <div role="table" className="mt-7 text-[14px]">
          <div role="row" className="grid h-[35px] grid-cols-[52px_1fr_88px_112px_150px] items-center rounded-btn bg-gray-100 px-3 font-semibold text-gray-900">
            <span role="columnheader">순위</span>
            <span role="columnheader">상품명</span>
            <span role="columnheader" className="text-right">판매량</span>
            <span role="columnheader" className="text-right">매출액</span>
            <span role="columnheader" className="pl-6">비중</span>
          </div>
          {rows.map((r, i) => {
            const share = (r.revenue / total) * 100
            return (
              <div key={r.name} role="row" className="grid h-[40px] grid-cols-[52px_1fr_88px_112px_150px] items-center border-b border-gray-200 px-3 text-gray-800">
                <span role="cell">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-num text-[12px] font-semibold ${
                      i < 3 ? 'bg-yellow-300 text-gray-900' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                </span>
                <span role="cell">{r.name}</span>
                <span role="cell" className="text-right font-num">
                  {formatNumber(r.qty)}잔
                </span>
                <span role="cell" className="text-right font-num">
                  {formatWon(r.revenue)}
                </span>
                <span role="cell" className="flex items-center gap-2.5 pl-6">
                  <span className="h-1.5 w-[70px] rounded-full bg-gray-200">
                    <span className="block h-full rounded-full bg-yellow-300" style={{ width: `${(share / 100 / maxShare) * 100}%` }} />
                  </span>
                  <span className="font-num text-gray-600">{share.toFixed(1)}%</span>
                </span>
              </div>
            )
          })}
        </div>

        <p className="mt-5 rounded-input bg-yellow-50 px-4 py-3 text-[14px] text-gray-800">
          상위 10개 메뉴가 전체 매출의 <span className="font-num font-semibold">{topShare.toFixed(0)}%</span>를 차지해요.
        </p>

        <div className="mt-8 flex justify-center">
          <Button size="lg" className="w-[244px]" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
