import type { ActionCardData } from '../components/ui/ActionCard'
import { useActionList } from './ActionsContext'
import { actionItemId, useStockBadge } from './InventoryContext'

/**
 * 화면용 액션 목록 — 발주 제안 카드의 배지를 재고현황 칩과 같은 기준(소진임박 / 주의)으로 맞춘다
 * 재고를 직접 수정해 생긴 카드는 '재고 부족' 그대로, 완료된 카드는 'HH:MM 완료' 그대로
 */
export function useLiveActionList(): ActionCardData[] {
  const list = useActionList()
  const stockBadge = useStockBadge()
  return list.map((a) => {
    if (a.done || a.kind !== 'order' || a.id.startsWith('inv-')) return a
    const badge = stockBadge(actionItemId(a.link))
    return badge ? { ...a, badge } : a
  })
}
