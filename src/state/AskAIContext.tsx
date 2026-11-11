import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import fundingData from '../data/funding-policy.json'
import kpi from '../data/kpi.json'
import salesReport from '../data/sales-report.json'
import { askAI, type AiAnswer, type AiSnapshot } from '../lib/askAI'
import { currentMonth, monthExpense } from '../lib/expense'
import { useExpense } from './ExpenseContext'
import { useInventory } from './InventoryContext'
import { useNotifications } from './NotificationsContext'
import { useOrders } from './OrdersContext'
import { REVIEWS, useReviews } from './ReviewsContext'
import { useLiveActionList } from './useLiveActions'
import reviewsData from '../data/reviews.json'

export type ChatMessage = { id: number; role: 'user' | 'ai'; text: string; answer?: AiAnswer }

type Ctx = {
  open: boolean
  setOpen: (v: boolean) => void
  messages: ChatMessage[]
  /** 답을 만드는 중 (생각 중 표시) */
  thinking: boolean
  ask: (question: string) => void
  reset: () => void
}
const AskAIContext = createContext<Ctx | null>(null)

const CHANNEL = Object.fromEntries(reviewsData.channels.map((c) => [c.key, c.label])) as Record<string, string>
const [salesKpi, deliveryKpi, aovKpi, peakKpi] = kpi.today as {
  value: string
  count?: string
  delta?: { text: string }
  highlight?: string
}[]

/** 지금 앱 상태(사장님이 바꾼 값 포함)를 AI가 읽을 수 있는 모양으로 모은다 */
function useSnapshot(): AiSnapshot {
  const { rows } = useInventory()
  const { items, submittedAt } = useOrders()
  const { settings } = useExpense()
  const { reply } = useReviews()
  const { unreadCount } = useNotifications()
  const actions = useLiveActionList()

  const e = monthExpense(currentMonth(), settings)
  const labor = e.variable.find((v) => v.id === 'labor')!
  const today = salesReport.periods.today
  return {
    owner: fundingData.owner,
    sales: {
      total: salesKpi.value,
      count: salesKpi.count ?? '',
      delta: salesKpi.delta?.text ?? '',
      delivery: deliveryKpi.value,
      deliveryCount: deliveryKpi.count ?? '',
      deliveryDelta: deliveryKpi.delta?.text ?? '',
      aov: aovKpi.value,
      aovDelta: aovKpi.delta?.text ?? '',
    },
    peak: { time: peakKpi.value, note: peakKpi.highlight ?? '' },
    channels: today.breakdowns.channel.map((c) => ({ name: c.name, count: c.count, revenue: c.revenue ?? 0 })),
    menus: today.ranking,
    stock: rows
      .filter((r) => r.status !== 'ok' || r.incoming)
      .sort((a, b) => a.days - b.days)
      .map((r) => ({
        name: r.name,
        days: r.days,
        status: r.status,
        incoming: r.incoming ? `+${r.incoming.qty}${r.incoming.unit}` : undefined,
      })),
    order: { submittedAt, items: items.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, price: i.price })) },
    todos: actions.filter((a) => !a.done).map((a) => `${a.title} (${a.subtitle})`),
    expense: {
      monthLabel: '이번 달',
      total: e.total,
      sales: e.sales,
      diff: e.diff,
      items: e.bar.map((i) => ({ name: i.name, amount: i.amount, share: i.share })),
      fixed: e.fixed.map((f) => ({ name: f.name, amount: f.amount, dueText: f.dueText, payDay: f.payDay })),
      labor: { amount: labor.amount, rate: e.labor.rate, saving: e.labor.saving, quiet: e.labor.quiet, warn: labor.warn },
    },
    reviews: {
      avg: REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length,
      total: REVIEWS.length,
      positivePct: Math.round((REVIEWS.filter((r) => r.sentiment === 'positive').length / REVIEWS.length) * 100),
      openNegatives: REVIEWS.filter((r) => r.flagged && !reply(r.id)).map((r) => ({ channel: CHANNEL[r.channel], text: r.text })),
    },
    funding: fundingData.programs.map((p) => ({
      name: p.name,
      limit: p.limit,
      rate: p.rate,
      deadlineDays: p.deadlineDays,
      instant: p.instant,
    })),
    unreadAlerts: unreadCount,
  }
}

/** AI에게 추가질문하기 — 대화는 페이지를 옮겨도 이어지고 새로고침하면 처음부터 */
export function AskAIProvider({ children }: { children: ReactNode }) {
  const snapshot = useSnapshot()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [thinking, setThinking] = useState(false)

  const ask = useCallback(
    (question: string) => {
      const q = question.trim()
      if (!q || thinking) return
      const id = Date.now()
      setMessages((m) => [...m, { id, role: 'user', text: q }])
      setThinking(true)
      // 질문한 순간의 데이터로 답을 만들고, 잠깐 생각하는 시간을 둔 뒤 보여줌
      const answer = askAI(q, snapshot)
      setTimeout(() => {
        setMessages((m) => [...m, { id: id + 1, role: 'ai', text: answer.text, answer }])
        setThinking(false)
      }, 700)
    },
    [snapshot, thinking],
  )
  const reset = useCallback(() => setMessages([]), [])

  const value = useMemo(() => ({ open, setOpen, messages, thinking, ask, reset }), [open, messages, thinking, ask, reset])
  return <AskAIContext.Provider value={value}>{children}</AskAIContext.Provider>
}

export function useAskAI() {
  const ctx = useContext(AskAIContext)
  if (!ctx) throw new Error('AskAIProvider 안에서 써야 해요')
  return ctx
}
