import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { formatNumber, formatWon } from '../../lib/format'
import type { OrderItem } from '../../state/OrdersContext'

type Props = { open: boolean; items: OrderItem[]; onClose: () => void; onConfirm: () => void }

/** 발주 시스템 전송 전 확인 — 품목·수량·금액을 한 번 더 보여준다 */
export default function OrderConfirmModal({ open, items, onClose, onConfirm }: Props) {
  const total = items.reduce((s, it) => s + it.qty * it.price, 0)

  return (
    <Modal open={open} onClose={onClose}>
      <div className="px-12 pb-10 pt-[50px]">
        <h2 className="text-subhead text-gray-900">발주 시스템으로 전송할까요?</h2>
        <p className="mt-2 text-[16px] text-gray-600">전송하면 본사 발주 시스템에 접수되고, 수량은 바꿀 수 없어요.</p>

        <ul className="mt-7 divide-y divide-gray-200 rounded-card border border-gray-300">
          {items.map((it) => {
            const changed = it.aiQty !== undefined && it.qty !== it.aiQty
            return (
              <li key={it.id} className="flex h-[54px] items-center px-5 text-[15px]">
                <span className="font-semibold text-gray-900">{it.name.replace(/^컴포즈 /, '')}</span>
                <span className="ml-2 font-num text-[14px] text-gray-500">{it.spec}</span>
                {changed && <span className="ml-3 text-[13px] text-yellow-700">AI 제안 {it.aiQty}{it.unit}에서 변경</span>}
                <span className="ml-auto font-num text-gray-800">
                  {formatNumber(it.qty)}
                  {it.unit}
                </span>
                <span className="w-[110px] text-right font-num font-semibold text-gray-900">{formatWon(it.qty * it.price)}</span>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex items-baseline justify-end gap-3">
          <span className="text-[15px] text-gray-600">예상 발주 금액</span>
          <span className="font-num text-[22px] font-bold text-gray-900">{formatWon(total)}</span>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="lg" className="w-[160px]" onClick={onClose}>
            취소
          </Button>
          <Button size="lg" className="w-[200px]" onClick={onConfirm}>
            전송하기
          </Button>
        </div>
      </div>
    </Modal>
  )
}
