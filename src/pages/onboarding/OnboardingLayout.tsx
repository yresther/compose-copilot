import { Check, ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import watermark from '../../assets/illust/watermark.png'
import logo from '../../assets/logo.svg'
import SkipButton from '../../components/ui/SkipButton'
import data from '../../data/onboarding.json'
import { useOnboarding } from './OnboardingContext'

/**
 * 왼쪽 단계 표시 — 끝낸 단계와 지금 단계는 노란 체크 (마지막 단계는 끝내기 전까지 번호)
 * 이전 단계로 돌아가도 끝낸 단계는 체크 유지, 끝낸 단계와 그다음 단계는 눌러서 이동
 */
function Stepper({ step }: { step: number }) {
  const navigate = useNavigate()
  const { completed } = useOnboarding()
  const last = data.steps.length
  const checked = (i: number) => i <= completed || (i === step && step < last)
  return (
    <div className="absolute left-[56px] top-[280px]">
      <p className="text-[13px] font-semibold text-white">{data.stepperTitle}</p>
      <ol className="mt-[39px]">
        {data.steps.map((label, idx) => {
          const i = idx + 1
          const on = checked(i)
          const back = i !== step && i <= completed + 1
          return (
            <li key={label} className="relative">
              {idx > 0 && (
                <span
                  className={`absolute left-[10px] top-[-24px] h-[16px] w-[1.5px] ${checked(i - 1) && on ? 'bg-yellow-500' : 'bg-gray-700'}`}
                  aria-hidden
                />
              )}
              <button
                type="button"
                disabled={!back}
                onClick={() => navigate(`/onboarding/${i}`)}
                aria-current={i === step ? 'step' : undefined}
                className={`flex h-[21px] items-center gap-[22px] ${idx > 0 ? 'mt-[29px]' : ''} ${back ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
              >
                {on ? (
                  <span className="flex h-[21px] w-[21px] items-center justify-center rounded-full bg-yellow-500">
                    <Check size={13} strokeWidth={2.5} className="text-white" />
                  </span>
                ) : (
                  <span className="w-[21px] text-center font-num text-[11px] font-semibold text-yellow-500">
                    {String(i).padStart(2, '0')}
                  </span>
                )}
                <span className={`text-[15px] font-medium ${on ? 'text-white' : 'text-gray-500'}`}>{label}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

type Props = { step: number; children: ReactNode }

/** 온보딩 화면 틀 — 왼쪽 다크 영역(로고·단계) + 오른쪽 흰 본문, 오른쪽 아래 흐린 COMPOSE 워터마크 */
export default function OnboardingLayout({ step, children }: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 z-20 w-[242px] bg-brown-900">
        <img src={logo} alt="COMPOSE COFFEE" className="absolute left-[39px] top-[34px] w-[161px]" />
        <Stepper step={step} />
      </aside>
      {/* 오른쪽 아래 흐린 COMPOSE 워터마크 (에셋 자체가 반투명, 오른쪽 끝에서 잘린 모양) */}
      <img src={watermark} alt="" aria-hidden className="pointer-events-none fixed bottom-[76px] right-0 w-[636px]" />
      <main className="relative ml-[242px] min-w-0 flex-1 pb-28">
        {step > 1 && (
          <button
            type="button"
            onClick={() => navigate(`/onboarding/${step - 1}`)}
            className="absolute left-[155px] top-[96px] flex items-center gap-0.5 text-[14px] text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft size={16} />
            {data.prev}
          </button>
        )}
        {children}
      </main>
      {/* 로그인 · 회원가입의 건너뛰기와 같은 자리 — 1단계에서만 */}
      {step === 1 && <SkipButton label={data.skip} to="/dashboard" />}
    </div>
  )
}
