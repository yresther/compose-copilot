import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useSidebarOffset } from '../../hooks/useSidebarOffset'

type Props = { open: boolean; onClose: () => void; children: ReactNode }

/** 화면 아래에서 올라오는 시트 — 뒤 배경을 어둡게, 바깥 클릭·ESC로 닫힘 */
export default function BottomSheet({ open, onClose, children }: Props) {
  const offset = useSidebarOffset(open)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-black/20" style={{ paddingLeft: offset }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-[640px] animate-sheet-in rounded-t-[20px] bg-white px-10 pb-9 pt-3 shadow-modal"
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-gray-300" aria-hidden />
        {children}
      </div>
    </div>,
    document.body,
  )
}
