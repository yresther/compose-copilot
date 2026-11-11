import { Info } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/onboarding.json'

/** 단계 제목 + 설명 */
export function StepTitle({ title, description, className = '' }: { title: string; description: string; className?: string }) {
  return (
    <header className={className}>
      <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>
      <p className="mt-[11px] text-[16px] text-gray-600">{description}</p>
    </header>
  )
}

export function FieldLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-[15px] font-semibold text-gray-900 ${className}`}>{children}</p>
}

/** 회색 입력칸 (캡처의 #F5F5F5 상자) */
export function TextInput({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`h-[47px] w-full rounded-input border border-transparent bg-gray-200 px-5 text-[15px] text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-yellow-300 focus:bg-white ${className}`}
    />
  )
}

/** 아래쪽 큰 버튼 (연동하기 · 다음 · 완료) */
export function PrimaryButton({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="h-[47px] w-[233px] rounded-[10px] bg-brown-900 text-[16px] font-medium text-white transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {children}
    </button>
  )
}

/** 예비 사장님 모드 링크 — 올리면 안내 말풍선, 누르면 준비중 (아직 잠김) */
export function PreOwnerLink({ className = '' }: { className?: string }) {
  const toast = useToast()
  const p = data.preOwner
  return (
    <div className={`group relative flex justify-center ${className}`}>
      <button
        type="button"
        onClick={() => toast.show(p.toast)}
        className="relative left-[4px] text-[16px] text-gray-800 underline underline-offset-4 hover:text-gray-900"
      >
        {/* 밑줄 글자가 위 버튼과 같은 가운데에 오도록 아이콘은 글자 왼쪽 바깥에 둠 */}
        <Info size={18} strokeWidth={1.5} className="absolute right-full top-1/2 mr-2 -translate-y-1/2 text-gray-700" />
        {p.link}
      </button>
      <div className="pointer-events-none absolute left-1/2 top-[41px] w-[320px] -translate-x-[99px] rounded-card bg-white px-[22px] pb-[21px] pt-[19px] opacity-0 shadow-modal transition-opacity group-hover:opacity-100">
        <span className="absolute -top-[6px] left-[28px] h-3 w-3 rotate-45 bg-white" aria-hidden />
        <p className="flex items-center gap-[7px] text-[15px] font-semibold text-gray-900">
          <Info size={17} strokeWidth={1.75} className="text-yellow-500" />
          {p.title}
        </p>
        <p className="mt-[10px] whitespace-pre-line text-[14px] leading-[20px] text-gray-800">{p.body}</p>
      </div>
    </div>
  )
}

/** 알약 선택지 — 고르면 노란 테두리 · 연노랑 배경 */
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-[44px] whitespace-nowrap rounded-full border px-[19px] text-[15px] transition-colors ${
        on ? 'border-yellow-500 bg-yellow-50 font-medium text-gray-900' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
