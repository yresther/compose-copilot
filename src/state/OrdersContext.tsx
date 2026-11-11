import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import inventoryData from '../data/inventory.json'
import ordersData from '../data/orders.json'
import { fillDates, formatTime, kstNow } from '../lib/kst'
import { useActions } from './ActionsContext'

// 발주관리 데모 상태 — 발주 목록·수량, 전송 여부, 새 발주내역, 입고 예정
// 액션 제안·대시보드(완료 표시)와 재고현황(입고 예정)이 함께 본다. 새로고침하면 처음 상태로 돌아간다.

const data = JSON.parse(fillDates(JSON.stringify(ordersData))) as typeof ordersData

export type OrderItem = {
  id: string
  name: string
  spec: string
  unit: string
  category: string
  price: number
  qty: number
  /** AI 제안 수량 (직접 추가한 품목은 없음) */
  aiQty?: number
  actionId?: string
  image?: string
  badge?: { tone: 'danger' | 'success' | 'warning' | 'neutral'; text: string }
  chips?: string[]
  reason?: string
  manual?: boolean
}

export type HistoryRow = {
  date: string
  item: string
  category: string
  ai: string
  actual: string
  diff: string
  result: 'shortage' | 'normal' | 'incoming'
  note: string
}

export const ORDER_DATA = data

// 카탈로그에 없는 재고 품목을 발주할 때 쓰는 단위별 평균 단가 (데모용)
const UNIT_PRICE: Record<string, number> = { 병: 10000, 봉: 15000, 팩: 3000, 개: 1500, 박스: 12000, 통: 18000, kg: 5000 }
export const CATALOG = data.catalog

type OrdersState = {
  items: OrderItem[]
  setQty: (id: string, qty: number) => void
  remove: (id: string) => void
  /** 카탈로그(없으면 재고 품목)에서 추가 — 이미 있으면 false. extra로 AI 제안 수량·연결 액션 등을 덮어씀 */
  add: (id: string, extra?: Partial<OrderItem>) => boolean
  /** 전송 시각 (HH:MM) — 전송 전이면 null */
  submittedAt: string | null
  submit: () => void
  /** 전송 취소 — 발주내역·입고 예정·액션 완료를 되돌리고 다시 수정할 수 있게 */
  cancelSubmit: () => void
  /** 전송으로 새로 생긴 발주내역 (최신순) */
  newRows: HistoryRow[]
  /** 품목 id → 입고 예정 수량 (재고현황에서 사용) */
  incoming: Record<string, { qty: number; unit: string }>
}

const OrdersContext = createContext<OrdersState | null>(null)

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside OrdersProvider')
  return ctx
}

const initialItems = (): OrderItem[] =>
  data.proposals.map((p) => ({ ...p, qty: p.aiQty, badge: p.badge as OrderItem['badge'] }))

export function OrdersProvider({ children }: { children: ReactNode }) {
  const { complete, undo } = useActions()
  const [items, setItems] = useState<OrderItem[]>(initialItems)
  const [submittedAt, setSubmittedAt] = useState<string | null>(null)
  const [newRows, setNewRows] = useState<HistoryRow[]>([])
  const [incoming, setIncoming] = useState<OrdersState['incoming']>({})

  const setQty = useCallback((id: string, qty: number) => {
    setItems((list) => list.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)))
  }, [])

  const remove = useCallback((id: string) => setItems((list) => list.filter((it) => it.id !== id)), [])

  const add = useCallback(
    (id: string, extra?: Partial<OrderItem>) => {
      if (items.some((it) => it.id === id)) return false
      // 발주 카탈로그에 없으면 재고현황 품목으로 만든다 (단가는 단위별 평균값)
      const inv = inventoryData.categories.flatMap((c) => c.items.map((it) => ({ ...it, category: c.key }))).find((x) => x.id === id)
      const c = data.catalog.find((x) => x.id === id) ?? (inv && { id, name: inv.name, spec: '', unit: inv.unit, price: UNIT_PRICE[inv.unit] ?? 5000, category: inv.category })
      if (!c) return false
      setItems((list) => [...list, { ...c, qty: 1, manual: true, badge: { tone: 'neutral', text: '직접 추가' }, ...extra }])
      return true
    },
    [items],
  )

  const submit = useCallback(() => {
    const now = kstNow()
    const today = `${now.m}/${now.d}`
    setSubmittedAt(formatTime(now, false))
    // 발주내역: AI 제안 대비 실제 발주 차이, 결과는 '입고 예정'
    setNewRows(
      items.map((it) => {
        const diff = it.aiQty === undefined ? null : it.qty - it.aiQty
        return {
          date: today,
          item: it.name.replace(/^컴포즈 /, ''),
          category: it.category,
          ai: it.aiQty === undefined ? '-' : `${it.aiQty}${it.unit}`,
          actual: `${it.qty}${it.unit}`,
          diff: !diff ? '-' : `${diff > 0 ? '+' : ''}${diff}${it.unit}`,
          result: 'incoming',
          note: it.manual ? '직접 추가 품목' : '오늘 전송',
        }
      }),
    )
    setIncoming(Object.fromEntries(items.map((it) => [it.id, { qty: it.qty, unit: it.unit }])))
    // 액션 제안 · 대시보드 홈의 발주 카드도 완료 처리
    complete(items.flatMap((it) => (it.actionId ? [it.actionId] : [])))
  }, [items, complete])

  const cancelSubmit = useCallback(() => {
    setSubmittedAt(null)
    setNewRows([])
    setIncoming({})
    items.forEach((it) => it.actionId && undo(it.actionId))
  }, [items, undo])

  const value = useMemo(
    () => ({ items, setQty, remove, add, submittedAt, submit, cancelSubmit, newRows, incoming }),
    [items, setQty, remove, add, submittedAt, submit, cancelSubmit, newRows, incoming],
  )
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}
