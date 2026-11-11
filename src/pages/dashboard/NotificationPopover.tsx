import { ChevronRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useDismiss } from '../../hooks/useDismiss'
import { useNotifications, type Notification } from '../../state/NotificationsContext'
import { ICON_TILE, KIND_ICON, ago } from './notificationKinds'

const WIDTH = 400

type Props = { anchor: RefObject<HTMLElement | null>; open: boolean; onClose: () => void }

function Item({ n, onOpen }: { n: Notification; onOpen: () => void }) {
  const Icon = KIND_ICON[n.kind]
  const fresh = n.unread && !n.done
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`w-full rounded-card border border-gray-200 bg-white px-4 py-3.5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-colors hover:border-gray-300 hover:bg-gray-100 ${n.done ? 'opacity-60' : ''}`}
      >
        <p className="flex items-center gap-2">
          <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${ICON_TILE}`}>
            <Icon size={15} />
            {fresh && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-danger" aria-label="안 읽음" />
            )}
          </span>
          <span className="text-[14px] font-bold text-gray-900">{n.label}</span>
          <span className="font-num text-[13px] text-gray-500">· {ago(n.minutesAgo)}</span>
          {n.done && <span className="ml-auto text-[12px] font-medium text-gray-500">처리 완료</span>}
        </p>
        <p className="mt-2 text-[14px] font-medium leading-[1.5] text-gray-900">{n.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] leading-[1.5] text-gray-600">{n.body}</p>
      </button>
    </li>
  )
}

/** 미확인 알림 버튼 아래로 열리는 알림 창 — 아래 '전체보기'를 누르면 알림 페이지로 */
export default function NotificationPopover({ anchor, open, onClose }: Props) {
  const navigate = useNavigate()
  const { items, unreadCount, markRead, markAllRead } = useNotifications()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; tail: number } | null>(null)

  // 버튼 바로 아래, 오른쪽 끝을 맞춰서 (꼬리는 버튼 가운데)
  useLayoutEffect(() => {
    if (!open || !anchor.current) return
    const place = () => {
      const r = anchor.current!.getBoundingClientRect()
      const left = Math.min(r.right + 12, window.innerWidth - 16) - WIDTH
      setPos({ top: r.bottom + 12, left, tail: r.left + r.width / 2 - left })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, anchor])

  // 버튼을 다시 눌러 닫을 때 바깥 클릭으로 먼저 닫혔다 다시 열리지 않게 버튼도 '안쪽'으로 취급
  useDismiss(ref, open, onClose)
  useEffect(() => {
    if (!open) return
    const stop = (e: MouseEvent) => anchor.current?.contains(e.target as Node) && e.stopPropagation()
    document.addEventListener('mousedown', stop, true)
    return () => document.removeEventListener('mousedown', stop, true)
  }, [open, anchor])

  if (!open || !pos) return null

  // 안 읽은 알림을 위로
  const list = [...items].sort((a, b) => Number(b.unread && !b.done) - Number(a.unread && !a.done) || a.minutesAgo - b.minutesAgo)
  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-label="알림센터"
      className="fixed z-50 animate-pop-in rounded-[16px] bg-white shadow-modal"
      style={{ top: pos.top, left: pos.left, width: WIDTH, transformOrigin: `${pos.tail}px 0` }}
    >
      <span className="absolute -top-[7px] h-[14px] w-[14px] rotate-45 bg-white" style={{ left: pos.tail - 7 }} aria-hidden />
      <header className="relative flex items-center px-5 pb-3 pt-5">
        <h2 className="text-[18px] font-bold text-gray-900">알림센터</h2>
        {unreadCount > 0 && (
          <span className="ml-2 rounded-full bg-danger px-[7px] py-px font-num text-[12px] font-bold text-white">{unreadCount}</span>
        )}
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="ml-auto text-[13px] text-gray-600 hover:text-gray-900 disabled:text-gray-400"
        >
          모두 읽음
        </button>
      </header>
      <ul className="max-h-[440px] space-y-2.5 overflow-y-auto bg-gray-200 px-4 py-4">
        {list.slice(0, 5).map((n) => (
          <Item
            key={n.id}
            n={n}
            onOpen={() => {
              markRead(n.id)
              go(n.cta.to)
            }}
          />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => go('/dashboard/notifications')}
        className="flex h-[52px] w-full items-center justify-center gap-1 rounded-b-[16px] text-[14px] font-semibold text-gray-800 hover:bg-gray-100"
      >
        전체보기
        <ChevronRight size={16} strokeWidth={2} />
      </button>
    </div>,
    document.body,
  )
}
