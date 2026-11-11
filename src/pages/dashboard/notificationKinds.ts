import { BankFill, BoxFill, ChatFill, DocFill, WalletFill } from '../../components/icons/FilledIcons'
import type { NotificationKind } from '../../state/NotificationsContext'

// 알림 종류별 아이콘 — 알림 창과 알림 페이지가 같이 씀 (면 아이콘, 색 없이 회색)
export const KIND_ICON: Record<NotificationKind, typeof BoxFill> = {
  stock: BoxFill,
  review: ChatFill,
  expense: WalletFill,
  funding: BankFill,
  report: DocFill,
}
export const ICON_TILE = 'bg-gray-200 text-gray-400'

/** 12분 전 / 3시간 전 / 어제 / 2일 전 */
export const ago = (m: number) =>
  m < 60 ? `${m}분 전` : m < 24 * 60 ? `${Math.floor(m / 60)}시간 전` : m < 48 * 60 ? '어제' : `${Math.floor(m / 1440)}일 전`
