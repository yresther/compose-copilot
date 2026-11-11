import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * 화면 오른쪽 아래 건너뛰기 — 데모에서 가입·온보딩 과정을 빠르게 넘길 때
 * 로그인 · 회원가입 · 온보딩 1단계에서 같은 자리(fixed)에 표시
 */
export default function SkipButton({ label, to }: { label: string; to: string }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="fixed bottom-[32px] right-[40px] z-30 flex items-center gap-0.5 rounded-full px-3 py-2 text-[14px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      {label}
      <ChevronRight size={16} />
    </button>
  )
}
