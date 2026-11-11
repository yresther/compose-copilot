import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_SETTINGS, monthKey, type ExpenseSettings, type FixedId, type Month, type Staff, type VariableId } from '../lib/expense'

type Ctx = {
  settings: ExpenseSettings
  /** 고정지출 금액·납부일 (매달 공통) */
  updateFixed: (patch: Partial<Record<FixedId, Partial<ExpenseSettings['fixed'][FixedId]>>>) => void
  /** 그 달 변동지출 — 값이 없으면 자동 계산값으로 되돌림 */
  setMonthVariable: (month: Month, values: Partial<Record<VariableId, number>>) => void
  /** 운영인력 전체 교체 (온보딩 4단계) */
  setStaff: (staff: Staff[]) => void
}

const ExpenseContext = createContext<Ctx | null>(null)

/** 지출관리에서 사장님이 고친 값 (새로고침하면 처음 값으로) */
export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ExpenseSettings>(DEFAULT_SETTINGS)

  const updateFixed = useCallback<Ctx['updateFixed']>((patch) => {
    setSettings((s) => {
      const fixed = { ...s.fixed }
      for (const [id, p] of Object.entries(patch) as [FixedId, Partial<ExpenseSettings['fixed'][FixedId]>][])
        fixed[id] = { ...fixed[id], ...p }
      return { ...s, fixed }
    })
  }, [])

  const setMonthVariable = useCallback<Ctx['setMonthVariable']>((month, values) => {
    setSettings((s) => ({ ...s, overrides: { ...s.overrides, [monthKey(month)]: values } }))
  }, [])

  const setStaff = useCallback((staff: Staff[]) => setSettings((s) => ({ ...s, staff })), [])

  const value = useMemo(() => ({ settings, updateFixed, setMonthVariable, setStaff }), [settings, updateFixed, setMonthVariable, setStaff])
  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}

export function useExpense() {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('ExpenseProvider 안에서 써야 해요')
  return ctx
}
