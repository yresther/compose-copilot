import { X } from 'lucide-react'
import { forwardRef } from 'react'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import Badge from '../../components/ui/Badge'
import QuantityStepper from '../../components/ui/QuantityStepper'
import type { OrderItem } from '../../state/OrdersContext'
import ProductThumb from './ProductThumb'

type Props = {
  item: OrderItem
  /** 액션 제안·긴급 배너에서 넘어온 품목 — 노란 테두리로 강조 */
  highlighted?: boolean
  /** 전송 완료 — 수량 수정·삭제 불가, '발주 완료' 배지 */
  done?: boolean
  onQty: (qty: number) => void
  onRemove: () => void
}

/** 오늘 발주 수량 제안의 품목 카드 */
const OrderItemCard = forwardRef<HTMLElement, Props>(function OrderItemCard({ item, highlighted, done, onQty, onRemove }, ref) {
  return (
    <article
      ref={ref}
      className={`relative flex h-[285px] flex-col rounded-[14px] bg-white transition-shadow ${
        highlighted ? 'border border-yellow-500 shadow-float' : 'border border-gray-300'
      }`}
    >
      {!done && (
        <button
          type="button"
          aria-label={`${item.name} 빼기`}
          onClick={onRemove}
          className="absolute -right-2.5 -top-2.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-gray-400 text-white transition-colors hover:bg-gray-500"
        >
          <X size={13} strokeWidth={2.5} />
        </button>
      )}

      <div className="flex-1 px-[18px] pt-[26px]">
        <div className="flex items-center gap-[13px]">
          <ProductThumb id={item.id} />
          <div className="min-w-0">
            <Badge tone={done ? 'success' : (item.badge?.tone ?? 'neutral')} size="sm">
              {done ? '발주 완료' : item.badge?.text}
            </Badge>
            <p className="mt-[3px] flex items-baseline gap-2.5 whitespace-nowrap">
              <span className="text-[22px] font-bold text-gray-900">{item.name.replace(/^컴포즈 /, '')}</span>
              <span className="font-num text-[14px] text-gray-700">
                {item.spec ? `${item.spec} / ` : ''}
                {item.qty}
                {item.unit}
              </span>
            </p>
          </div>
        </div>

        {item.chips && (
          <div className="mt-[21px] flex flex-wrap gap-2">
            {item.chips.map((c) => (
              <span key={c} className="flex h-[26px] items-center rounded-full bg-gray-100 px-3 text-[13px] text-gray-700">
                {c}
              </span>
            ))}
          </div>
        )}
        {item.reason && (
          <p className="mt-[17px] flex gap-1.5 text-[14px] leading-[1.5] text-gray-700">
            <AiSparkleIcon size={14} className="mt-[3px] shrink-0 text-yellow-500" />
            {item.reason}
          </p>
        )}
      </div>

      <footer className="mx-3 flex h-[58px] items-center justify-between border-t border-gray-200 pl-[18px] pr-[17px]">
        <span className="text-[13px] font-medium text-gray-800">발주 수량</span>
        <QuantityStepper value={item.qty} onChange={onQty} disabled={done} />
      </footer>
    </article>
  )
})

export default OrderItemCard
