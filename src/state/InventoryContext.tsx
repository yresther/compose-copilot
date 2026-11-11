import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import inventoryData from '../data/inventory.json'
import { buildStockAction, stockActionId } from '../lib/stockActions'
import { ACTIONS, useActions } from './ActionsContext'
import { useOrders } from './OrdersContext'

// 재고현황 데모 상태 — 직접 수정한 재고, 소진 임박 알림 기준(임계치)
// 발주관리에서 전송한 품목(입고 예정)을 함께 계산해 표·알림에 반영한다. 새로고침하면 처음 상태로.

export type InventoryStatus = 'danger' | 'warn' | 'ok' | 'incoming'

export type InventoryRow = {
  id: string
  name: string
  unit: string
  stock: number
  dailyUse: number
  categoryKey: string
  /** 남은 일수 (재고 ÷ 하루 사용량, 내림) */
  days: number
  status: InventoryStatus
  /** 발주 전송으로 입고 예정인 수량 */
  incoming?: { qty: number; unit: string }
}

export type Thresholds = { danger: number; warn: number }

export const CATEGORIES = inventoryData.categories

// 이미 고정 액션 카드가 있는 품목 (바닐라 시럽 · 빙수 팥)은 새 카드를 만들지 않는다
const STATIC_LINKED = ACTIONS.flatMap((a) => (a.link?.startsWith('/order?item=') ? [a.link.split('item=')[1]] : []))

type InventoryState = {
  rows: InventoryRow[]
  thresholds: Thresholds
  setThresholds: (t: Thresholds) => void
  /** 직접 수정한 재고 저장 (id → 수량) — 소진임박이 된 품목 수를 돌려준다 (발주 제안 카드로 추가됨) */
  saveStocks: (stocks: Record<string, number>) => number
}

const InventoryContext = createContext<InventoryState | null>(null)

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used inside InventoryProvider')
  return ctx
}

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { incoming } = useOrders()
  const { upsertDynamic, removeDynamic } = useActions()
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [thresholds, setThresholds] = useState<Thresholds>(inventoryData.thresholds)

  const saveStocks = useCallback(
    (stocks: Record<string, number>) => {
      setOverrides((o) => ({ ...o, ...stocks }))
      const items = CATEGORIES.flatMap((c) => c.items)
      const short = []
      const recovered = []
      for (const [id, stock] of Object.entries(stocks)) {
        const it = items.find((x) => x.id === id)
        if (!it || incoming[id] || STATIC_LINKED.includes(id)) continue
        const days = Math.floor(stock / it.dailyUse)
        if (days <= thresholds.danger) short.push(buildStockAction({ ...it, stock, days }))
        else recovered.push(stockActionId(id))
      }
      if (short.length) upsertDynamic(short)
      if (recovered.length) removeDynamic(recovered)
      return short.length
    },
    [incoming, thresholds, upsertDynamic, removeDynamic],
  )

  const rows = useMemo<InventoryRow[]>(
    () =>
      CATEGORIES.flatMap((c) =>
        c.items.map((it) => {
          const stock = overrides[it.id] ?? it.stock
          const days = Math.floor(stock / it.dailyUse)
          const inc = incoming[it.id]
          const status: InventoryStatus = inc ? 'incoming' : days <= thresholds.danger ? 'danger' : days <= thresholds.warn ? 'warn' : 'ok'
          return { ...it, stock, days, status, categoryKey: c.key, incoming: inc }
        }),
      ),
    [overrides, thresholds, incoming],
  )

  const value = useMemo(() => ({ rows, thresholds, setThresholds, saveStocks }), [rows, thresholds, saveStocks])
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export type StockBadge = { tone: 'danger' | 'warning' | 'success'; text: string }

const STOCK_BADGE: Record<Exclude<InventoryStatus, 'incoming'>, StockBadge> = {
  danger: { tone: 'danger', text: '소진임박' },
  warn: { tone: 'warning', text: '주의' },
  ok: { tone: 'success', text: '여유' },
}

/**
 * 제안 카드 배지 — 재고현황 칩과 같은 기준(소진임박 / 주의 / 여유)
 * 품목 id로 현재 재고 상태를 찾아 돌려준다. 입고 예정이거나 재고 품목이 아니면 null
 */
export function useStockBadge() {
  const { rows } = useInventory()
  return (itemId?: string): StockBadge | null => {
    const row = itemId ? rows.find((r) => r.id === itemId) : undefined
    if (!row || row.status === 'incoming') return null
    return STOCK_BADGE[row.status]
  }
}

/** 액션 카드 → 연결된 재고 품목 id (/order?item=…) */
export const actionItemId = (link?: string) => link?.match(/[?&]item=([^&]+)/)?.[1]
