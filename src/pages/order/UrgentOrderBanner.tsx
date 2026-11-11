import { ArrowRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { useStockBadge } from '../../state/InventoryContext'
import { ORDER_DATA } from '../../state/OrdersContext'
import { PRODUCT_IMAGES } from '../../lib/products'

const { urgent } = ORDER_DATA

/** 긴급 발주 배너 (발주관리 · 재고현황 공통) — 지금 바로 팥 발주가 필요해요 */
export default function UrgentOrderBanner({ onOrder, className = '' }: { onOrder: () => void; className?: string }) {
  // 배지는 재고현황 칩과 같은 기준 (소진임박 / 주의)
  const badge = useStockBadge()(urgent.itemId) ?? { tone: 'danger' as const, text: urgent.badge }
  return (
    <section className={`flex h-[96px] items-center rounded-card bg-white px-[30px] ${className}`}>
      {/* 품목 사진 — 회색 둥근 사각 칸(69×69) 안에 시안 크기로 */}
      <span className="flex h-[69px] w-[69px] shrink-0 items-center justify-center rounded-[25px] bg-gray-100">
        {PRODUCT_IMAGES[urgent.itemId] && <img src={PRODUCT_IMAGES[urgent.itemId]} alt="" className="h-[39px] w-auto" />}
      </span>
      <div className="ml-[15px]">
        <p className="flex items-center gap-[19px]">
          <span className="text-[20px] font-semibold text-gray-900">{urgent.title}</span>
          <Badge tone={badge.tone} size="sm">
            {badge.text}
          </Badge>
        </p>
        <p className="mt-1 text-[14px]">
          <span className="text-gray-600">{urgent.stockLabel}</span>
          <span className="ml-2.5 font-semibold text-gray-900">{urgent.stock}</span>
        </p>
      </div>
      <Button size="sm" className="ml-auto h-7 text-[13px]" onClick={onOrder}>
        발주하기
        <ArrowRight size={15} />
      </Button>
    </section>
  )
}

export const URGENT_ITEM_ID = urgent.itemId
