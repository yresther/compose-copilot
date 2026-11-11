import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import data from '../data/reviews.json'
import { fillDates } from '../lib/kst'
import { useActions } from './ActionsContext'

export type ChannelKey = 'naver' | 'baemin' | 'coupang'
export type Review = {
  id: string
  channel: ChannelKey
  rating: number
  sentiment: 'positive' | 'negative'
  date: string
  text: string
  /** 별점이 낮아 답글이 꼭 필요한 부정리뷰 — 대시보드·액션 제안의 리뷰 카드와 연결 */
  flagged?: boolean
  /** 이미 달린 답글 */
  reply?: string
  /** 미리 준비한 AI 답글 초안 */
  draft?: string
}

/** 목업 리뷰 — 날짜 자리표시자를 오늘 기준으로 채움 */
export const REVIEWS = (data.reviews as Review[]).map((r) => ({ ...r, date: fillDates(r.date) }))

type Ctx = {
  /** 이번에 등록한 답글 (새로고침하면 사라짐) */
  replies: Record<string, string>
  reply: (id: string) => string | undefined
  register: (id: string, text: string) => { allFlaggedDone: boolean }
}

const ReviewsContext = createContext<Ctx | null>(null)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const { complete } = useActions()
  const [replies, setReplies] = useState<Record<string, string>>({})

  const reply = useCallback((id: string) => replies[id] ?? REVIEWS.find((r) => r.id === id)?.reply, [replies])

  // 답글 등록 — 부정리뷰가 모두 답변되면 홈·액션 제안의 리뷰 카드를 완료 처리
  const register = useCallback<Ctx['register']>(
    (id, text) => {
      const next = { ...replies, [id]: text }
      setReplies(next)
      const allFlaggedDone = REVIEWS.filter((r) => r.flagged).every((r) => next[r.id] ?? r.reply)
      if (allFlaggedDone) complete([data.actionId])
      return { allFlaggedDone }
    },
    [replies, complete],
  )

  const value = useMemo(() => ({ replies, reply, register }), [replies, reply, register])
  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>
}

export function useReviews() {
  const ctx = useContext(ReviewsContext)
  if (!ctx) throw new Error('ReviewsProvider 안에서 써야 해요')
  return ctx
}
