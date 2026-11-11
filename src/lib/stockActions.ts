// 재고현황에서 직접 수정해 '소진임박'이 된 품목 → 실시간 브리핑·액션 제안에 띄울 발주 제안 카드
// 제안 수량: 7일치를 채우는 만큼 (최소 1)

import type { ActionCardData } from '../components/ui/ActionCard'
import { PRODUCT_IMAGES } from './products'

export type StockItem = { id: string; name: string; unit: string; stock: number; dailyUse: number; days: number }

const TARGET_DAYS = 7

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('ko-KR') : n.toFixed(1))

/** 7일치를 채우는 발주 수량 */
export const suggestQty = (it: StockItem) => Math.max(1, Math.ceil(it.dailyUse * TARGET_DAYS - it.stock))

export const stockActionId = (itemId: string) => `inv-${itemId}`

export function buildStockAction(it: StockItem): ActionCardData {
  const qty = suggestQty(it)
  const cover = Math.floor((it.stock + qty) / it.dailyUse)
  const when = it.days === 0 ? '오늘' : `D-${it.days}`
  return {
    id: stockActionId(it.id),
    kind: 'order',
    category: '발주제안',
    badge: { tone: 'danger', text: '재고 부족' },
    title: `${it.name} 발주`,
    subtitle: `${fmt(qty)}${it.unit}`,
    image: PRODUCT_IMAGES[it.id] ? it.id : undefined,
    rows: [
      { label: '재고현황', value: `약 ${fmt(it.stock)}${it.unit} 남음` },
      { label: '평균 소비', value: `일 소비 약 ${fmt(it.dailyUse)}${it.unit}` },
    ],
    reasons: [
      `직접 수정한 재고가 **${it.days}일치**로 줄었어요`,
      `일 평균 **${fmt(it.dailyUse)}${it.unit}** 사용 · ${when} 소진 예상`,
      `**${fmt(qty)}${it.unit}** 발주 시 약 **${cover}일치** 확보`,
    ],
    detail: {
      label: '추천 근거',
      rows: [
        { label: '재고', value: `재고현황에서 직접 수정 → **${fmt(it.stock)}${it.unit}** (${it.days}일치)` },
        { label: '소비', value: `일 평균 ${fmt(it.dailyUse)}${it.unit} 사용` },
        { label: '예상 소진', value: `**${when} 소진** 예상 · ${fmt(qty)}${it.unit} 발주 시 약 ${cover}일치 확보` },
      ],
    },
    cta: '발주시스템으로 전송',
    link: `/order?item=${it.id}&action=${stockActionId(it.id)}&qty=${qty}`,
  }
}
