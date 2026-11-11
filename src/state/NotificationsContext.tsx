import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import data from '../data/notifications.json'
import { currentMonth, monthExpense, payDayLabel } from '../lib/expense'
import { REVIEWS, useReviews } from './ReviewsContext'
import { useActions } from './ActionsContext'
import { useExpense } from './ExpenseContext'
import { useInventory } from './InventoryContext'

export type NotificationKind = 'stock' | 'review' | 'expense' | 'funding' | 'report'
export type Notification = {
  id: string
  kind: NotificationKind
  label: string
  title: string
  body: string
  minutesAgo: number
  cta: { label: string; to: string }
  /** 연결된 액션이 완료되면 '처리 완료' */
  done: boolean
  unread: boolean
}

type Ctx = { items: Notification[]; unreadCount: number; markRead: (id: string) => void; markAllRead: () => void }
const NotificationsContext = createContext<Ctx | null>(null)

const fill = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''))

/** 알림 — 문구는 지금 데모 상태(재고·리뷰·지출)로 채우고, 읽음 여부는 새로고침 전까지 유지 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { completed } = useActions()
  const { rows } = useInventory()
  const { reply } = useReviews()
  const { settings } = useExpense()
  const [read, setRead] = useState<Set<string>>(() => new Set(data.items.filter((n) => !n.unread).map((n) => n.id)))

  const items = useMemo<Notification[]>(() => {
    const redBean = rows.find((r) => r.id === 'red-bean')
    const openNegatives = REVIEWS.filter((r) => r.flagged && !reply(r.id)).length
    // 가장 가까운 고정지출 납부일 묶음 (같은 날 나가는 항목끼리)
    const fixed = monthExpense(currentMonth(), settings).fixed.filter((f) => f.dueText !== '납부 완료')
    const soonest = [...fixed].sort((a, b) => parseInt(a.dueText) - parseInt(b.dueText))[0]
    const sameDay = fixed.filter((f) => f.payDay === soonest?.payDay)
    const values: Record<string, string | number> = {
      days: redBean?.days ?? 0,
      count: openNegatives,
    }
    return data.items.map((n) => {
      const v =
        n.id === 'expense-due' && soonest
          ? {
              names: sameDay.map((f) => f.name).join(' · '),
              days: soonest.dueText === '오늘' ? 0 : parseInt(soonest.dueText),
              payDay: payDayLabel(soonest.payDay),
              amount: `${sameDay.reduce((s, f) => s + f.amount, 0).toLocaleString('ko-KR')}원`,
            }
          : values
      return {
        ...n,
        kind: n.kind as NotificationKind,
        title: fill(n.title, v),
        body: fill(n.body, v),
        done: Boolean(n.actionId && completed[n.actionId]),
        unread: !read.has(n.id),
      }
    })
  }, [rows, reply, settings, completed, read])

  // 처리 완료된 알림은 안 읽은 수에서 뺀다
  const unreadCount = items.filter((n) => n.unread && !n.done).length
  const markRead = useCallback((id: string) => setRead((s) => new Set(s).add(id)), [])
  const markAllRead = useCallback(() => setRead(new Set(data.items.map((n) => n.id))), [])

  const value = useMemo(() => ({ items, unreadCount, markRead, markAllRead }), [items, unreadCount, markRead, markAllRead])
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('NotificationsProvider 안에서 써야 해요')
  return ctx
}
