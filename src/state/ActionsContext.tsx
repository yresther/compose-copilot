import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { ActionCardData } from '../components/ui/ActionCard'
import actionsData from '../data/actions.json'
import { fillDates, formatTime, kstNow } from '../lib/kst'

// 대시보드 홈과 오늘의 할 일 페이지가 함께 쓰는 액션 상태 (체크·완료·삭제)
// 새로고침하면 처음 상태로 돌아간다

// 문구 속 {{date:+n}} 자리표시자는 오늘(KST) 기준 날짜로 채운다
export const ACTIONS = JSON.parse(fillDates(JSON.stringify(actionsData))) as ActionCardData[]

type ActionsState = {
  checked: Set<string>
  setChecked: (id: string, on: boolean) => void
  /** id → 완료 시각 (HH:MM, KST). 키 순서 = 완료한 순서 */
  completed: Record<string, string>
  complete: (ids: string[]) => void
  undo: (id: string) => void
  /** 완료하지 않고 지운 할 일 — 홈 · 오늘의 할 일 페이지 모두에서 사라짐 */
  removed: Set<string>
  remove: (ids: string[]) => void
  /** 재고현황에서 직접 수정해 부족해진 품목의 발주 제안 (맨 앞에 표시) */
  dynamicActions: ActionCardData[]
  /** 같은 id는 내용을 갱신, 없으면 맨 앞에 추가 */
  upsertDynamic: (actions: ActionCardData[]) => void
  /** 완료되지 않은 동적 제안만 지운다 (재고를 다시 늘린 경우) */
  removeDynamic: (ids: string[]) => void
}

const ActionsContext = createContext<ActionsState | null>(null)

export function useActions() {
  const ctx = useContext(ActionsContext)
  if (!ctx) throw new Error('useActions must be used inside ActionsProvider')
  return ctx
}

/** 완료하면 '해야 할 일'에서 빠져 '완료한 항목' 탭(오늘의 할 일 페이지)으로 옮겨진다는 안내 */
export const doneToast = (n: number) => `${n > 1 ? `${n}개 항목을` : '할 일을'} 완료했어요. 완료한 항목에서 볼 수 있어요.`

const nowHHMM = () => formatTime(kstNow(), false)

/** 완료된 액션은 홈 영업종료 캡처의 완료 스타일로 (회색 카드 + 'HH:MM 완료' 배지) */
export function withCompletion(action: ActionCardData, completedAt?: string): ActionCardData {
  if (!completedAt) return action
  return { ...action, done: true, badge: { tone: 'neutral', text: `${completedAt} 완료` } }
}

/** 화면에 보여줄 액션 목록 — 재고 부족으로 새로 생긴 제안이 맨 앞, 미완료는 원래 순서, 완료한 액션은 완료한 순서대로 맨 뒤 */
export function useActionList(): ActionCardData[] {
  const { completed, dynamicActions, removed } = useActions()
  const all = [...dynamicActions, ...ACTIONS].filter((a) => !removed.has(a.id))
  const pending = all.filter((a) => !completed[a.id])
  const done = Object.keys(completed)
    .map((id) => all.find((a) => a.id === id))
    .filter((a): a is ActionCardData => !!a)
    .map((a) => withCompletion(a, completed[a.id]))
  return [...pending, ...done]
}

export function ActionsProvider({ children }: { children: ReactNode }) {
  const [checked, setCheckedSet] = useState<Set<string>>(new Set())
  const [completed, setCompleted] = useState<Record<string, string>>({})
  const [dynamicActions, setDynamicActions] = useState<ActionCardData[]>([])
  const [removed, setRemoved] = useState<Set<string>>(new Set())

  const setChecked = useCallback((id: string, on: boolean) => {
    setCheckedSet((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
  }, [])

  const complete = useCallback((ids: string[]) => {
    const time = nowHHMM()
    setCompleted((prev) => ({ ...prev, ...Object.fromEntries(ids.filter((id) => !prev[id]).map((id) => [id, time])) }))
    setCheckedSet((prev) => new Set([...prev].filter((id) => !ids.includes(id))))
  }, [])

  const undo = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  const remove = useCallback((ids: string[]) => {
    setRemoved((prev) => new Set([...prev, ...ids]))
    setCheckedSet((prev) => new Set([...prev].filter((id) => !ids.includes(id))))
  }, [])

  const upsertDynamic = useCallback((actions: ActionCardData[]) => {
    setDynamicActions((prev) => {
      const next = prev.map((p) => actions.find((a) => a.id === p.id) ?? p)
      const added = actions.filter((a) => !prev.some((p) => p.id === a.id))
      return [...added, ...next]
    })
  }, [])

  const removeDynamic = useCallback(
    (ids: string[]) => setDynamicActions((prev) => prev.filter((p) => !ids.includes(p.id) || completed[p.id])),
    [completed],
  )

  const value = useMemo(
    () => ({ checked, setChecked, completed, complete, undo, removed, remove, dynamicActions, upsertDynamic, removeDynamic }),
    [checked, setChecked, completed, complete, undo, removed, remove, dynamicActions, upsertDynamic, removeDynamic],
  )
  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}
