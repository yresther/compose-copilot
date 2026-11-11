import { House, RotateCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export type DashboardMode = 'live' | 'closing'

const OPTIONS: { key: DashboardMode; label: string }[] = [
  { key: 'live', label: '영업중' },
  { key: 'closing', label: '영업종료' },
]

// 데모 전용 — 실제 시간과 상관없이 영업중/영업종료 화면을 전환 + 온보딩 다시 보기 + 첫 화면(인트로·로그인)으로
export default function DemoModeToggle({ mode, onChange }: { mode: DashboardMode; onChange: (m: DashboardMode) => void }) {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white py-1 pl-3 pr-1 shadow-float">
      <span className="text-[12px] font-medium text-gray-500">데모</span>
      <div role="radiogroup" aria-label="데모 영업 상태" className="flex rounded-full bg-gray-200 p-0.5">
        {OPTIONS.map((o) => (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={mode === o.key}
            onClick={() => onChange(o.key)}
            className={`h-7 rounded-full px-3 text-[13px] font-semibold transition-colors ${
              mode === o.key ? 'bg-brown-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <span className="h-4 w-px bg-gray-300" aria-hidden />
      <button
        type="button"
        onClick={() => navigate('/onboarding/1')}
        className="flex h-7 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
      >
        <RotateCcw size={13} strokeWidth={2.25} />
        온보딩 다시보기
      </button>
      {/* 새로 불러와서 인트로 애니메이션부터 다시 재생 (데모 상태도 처음으로) */}
      <button
        type="button"
        onClick={() => window.location.assign('/login')}
        className="flex h-7 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
      >
        <House size={13} strokeWidth={2.25} />
        첫 화면으로 돌아가기
      </button>
    </div>
  )
}
