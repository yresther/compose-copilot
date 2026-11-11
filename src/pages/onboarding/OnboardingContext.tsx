import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import data from '../../data/onboarding.json'

// 온보딩 입력값 — 단계를 오가도 유지, 새로고침하면 처음으로 (고정지출·인력은 ExpenseContext가 들고 있음)
export type OnboardingForm = {
  vendor: string
  posKey: string
  consents: Record<string, boolean>
  bizNumber: string
  owner: string
  bank: string
  accountLinked: boolean
  area: string
  customArea: string
  military: string[]
  manager: string
  seat: string
}

const INITIAL: OnboardingForm = {
  vendor: data.step1.pos.vendors[0],
  posKey: '',
  consents: Object.fromEntries(data.step1.consents.map((c) => [c.id, false])),
  bizNumber: '',
  owner: '',
  bank: '',
  accountLinked: false,
  area: data.step4.area.initial,
  customArea: '',
  military: [],
  manager: '',
  seat: '',
}

type Ctx = {
  form: OnboardingForm
  /** 값 바꾸기 — 이전 값으로 계산할 땐 함수로 (빠르게 여러 번 눌러도 안전) */
  set: <K extends keyof OnboardingForm>(key: K, value: OnboardingForm[K] | ((prev: OnboardingForm[K]) => OnboardingForm[K])) => void
  /** 끝낸 단계 중 가장 먼 단계 (0 = 아직 없음) — 이전 단계로 돌아가도 왼쪽 완료 표시 유지 */
  completed: number
  /** n단계에 들어오면 그 앞 단계까지 완료로 */
  reach: (step: number) => void
}
const OnboardingContext = createContext<Ctx | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<OnboardingForm>(INITIAL)
  const [completed, setCompleted] = useState(0)
  const reach = useCallback((step: number) => setCompleted((c) => Math.max(c, step - 1)), [])
  const value = useMemo<Ctx>(
    () => ({
      form,
      completed,
      reach,
      set: (key, v) =>
        setForm((f) => ({
          ...f,
          [key]: typeof v === 'function' ? (v as (p: (typeof f)[typeof key]) => (typeof f)[typeof key])(f[key]) : v,
        })),
    }),
    [form, completed, reach],
  )
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('OnboardingProvider 안에서 써야 해요')
  return ctx
}
