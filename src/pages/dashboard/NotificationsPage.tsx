import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Badge from '../../components/ui/Badge'
import PeriodTabs from '../../components/ui/PeriodTabs'
import { useNotifications, type Notification } from '../../state/NotificationsContext'
import { ICON_TILE, KIND_ICON, ago } from './notificationKinds'

function Row({ n, onOpen }: { n: Notification; onOpen: () => void }) {
  const Icon = KIND_ICON[n.kind]
  const fresh = n.unread && !n.done
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`group flex w-full items-center gap-5 rounded-input px-5 py-5 text-left transition-colors hover:bg-gray-100 ${n.done ? 'opacity-60' : ''}`}
      >
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${ICON_TILE}`}>
          <Icon size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[13px] text-gray-500">
            <span className="font-semibold text-gray-700">{n.label}</span>
            <span className="font-num">{ago(n.minutesAgo)}</span>
            {n.done && (
              <Badge tone="neutral" size="sm" className="h-[22px] px-2 text-[12px]">
                처리 완료
              </Badge>
            )}
          </p>
          <p className="mt-1 flex items-center gap-2 text-[16px] font-semibold text-gray-900">
            {fresh && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-700" aria-label="안 읽음" />}
            {n.title}
          </p>
          <p className="mt-1 text-[14px] text-gray-600">{n.body}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-gray-600 group-hover:text-gray-900">
          {n.cta.label}
          <ChevronRight size={16} strokeWidth={2} />
        </span>
      </button>
    </li>
  )
}

/** 알림 — 실시간 브리핑의 '미확인 알림' 버튼으로 들어옴. 누르면 읽음 처리 후 해당 화면으로 */
export default function NotificationsPage() {
  const navigate = useNavigate()
  const { items, unreadCount, markRead, markAllRead } = useNotifications()
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const list = tab === 'unread' ? items.filter((n) => n.unread && !n.done) : items
  const today = list.filter((n) => n.minutesAgo < 24 * 60)
  const earlier = list.filter((n) => n.minutesAgo >= 24 * 60)

  const open = (n: Notification) => {
    markRead(n.id)
    navigate(n.cta.to)
  }

  const group = (title: string, rows: Notification[]) =>
    rows.length > 0 && (
      <div className="mt-2 first:mt-0">
        <p className="px-5 pb-1 pt-3 text-[13px] font-semibold text-gray-500">{title}</p>
        <ul>
          {rows.map((n) => (
            <Row key={n.id} n={n} onOpen={() => open(n)} />
          ))}
        </ul>
      </div>
    )

  return (
    <div className="pb-24">
      <PageHeader title="알림" className="pt-[14px]" />
      <div className="px-page">
        <div className="mt-[31px] flex items-center">
          <PeriodTabs
            variant="light"
            items={[
              { key: 'all', label: '전체' },
              { key: 'unread', label: `안 읽음 ${unreadCount}` },
            ]}
            value={tab}
            onChange={setTab}
          />
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="ml-auto text-[14px] text-gray-600 underline underline-offset-4 hover:text-gray-900 disabled:pointer-events-none disabled:text-gray-400 disabled:no-underline"
          >
            모두 읽음으로 표시
          </button>
        </div>

        <section className="mt-4 rounded-card bg-white px-4 py-4">
          {group('오늘', today)}
          {group('이전 알림', earlier)}
          {list.length === 0 && <p className="py-16 text-center text-[15px] text-gray-500">새로운 알림이 없어요</p>}
        </section>
      </div>
    </div>
  )
}
