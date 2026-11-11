import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSidebarOffset } from '../../hooks/useSidebarOffset'

type Props = {
  open: boolean
  onClose?: () => void
  /** 로딩 모달처럼 바깥 클릭·ESC로 닫히면 안 되는 경우 false */
  dismissible?: boolean
  width?: number
  /** true면 사이드바를 빼지 않고 화면 전체 기준 가운데 (온보딩) */
  screenCenter?: boolean
  className?: string
  children: ReactNode
}

export default function Modal({ open, onClose, dismissible = true, width = 754, screenCenter, className = '', children }: Props) {
  const sidebar = useSidebarOffset(open)
  const offset = screenCenter ? 0 : sidebar
  useEffect(() => {
    if (!open || !dismissible) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, dismissible, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-black/20"
      style={{ paddingLeft: offset }}
      onClick={dismissible ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className={`animate-pop-in rounded-modal bg-white shadow-modal ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
