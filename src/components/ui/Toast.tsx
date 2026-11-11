import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ToastContextValue = { show: (message: string) => void }
const ToastContext = createContext<ToastContextValue>({ show: () => {} })
export const useToast = () => useContext(ToastContext)

const DURATION = 2400

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const show = useCallback((message: string) => {
    clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = setTimeout(() => setToast(null), DURATION)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && (
        <div
          key={toast.id}
          role="status"
          className="fixed bottom-10 left-1/2 z-[60] flex -translate-x-1/2 animate-toast-in items-center gap-2.5 rounded-card bg-brown-900 px-6 py-[14px] text-[15px] font-medium text-white shadow-modal"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0 text-yellow-300">
            <circle cx="10" cy="10" r="10" fill="currentColor" />
            <path
              d="M5.8 10.3 8.7 13.1 14.3 7.4"
              fill="none"
              stroke="#25221E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}
