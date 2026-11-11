import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import { richText } from '../../components/ui/ActionCard'
import DatePill from '../../components/ui/DatePill'
import PeriodTabs from '../../components/ui/PeriodTabs'
import TipBanner from '../../components/ui/TipBanner'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/reviews.json'
import { kstDay } from '../../lib/kst'
import { REVIEWS, type ChannelKey } from '../../state/ReviewsContext'
import InsightList from './InsightList'
import ReviewList from './ReviewList'
import { KeywordCard, RatingCard, SentimentCard } from './ReviewSummary'

export type ChannelFilter = 'all' | ChannelKey
const TABS = data.channels.map((c) => ({ key: c.key as ChannelFilter, label: c.label }))

/** 리뷰 분석 — 평점·긍정/부정·많이 나온 말·인사이트 + 리뷰 목록(AI 답글) */
export default function ReviewPage() {
  const toast = useToast()
  const [params] = useSearchParams()
  // 대시보드·액션 제안의 리뷰 카드에서 넘어오면 그 리뷰를 선택해서 보여줌
  const selectedId = params.get('review')
  const [channel, setChannel] = useState<ChannelFilter>('all')
  const [tipClosed, setTipClosed] = useState(false)
  const today = kstDay()

  const reviews = REVIEWS.filter((r) => channel === 'all' || r.channel === channel)

  const items = useRef<Record<string, HTMLLIElement | null>>({})
  useEffect(() => {
    if (!selectedId) return
    const t = setTimeout(() => items.current[selectedId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150)
    return () => clearTimeout(t)
  }, [selectedId])

  return (
    <div className="pb-24">
      <PageHeader
        title="리뷰 분석"
        basis
        right={<DatePill value={{ y: today.y, m: today.m, d: today.d }} onChange={() => toast.show('날짜별 리뷰 분석은 준비중이에요')} />}
        className="pt-[14px]"
      />

      <div className="px-page">
        {!tipClosed && (
          <TipBanner
            className="mt-[26px]"
            headlineSize="md"
            headline={richText(data.tip)}
            closeAlign="center"
            onClose={() => setTipClosed(true)}
          />
        )}

        <div className="mt-[34px]">
          <PeriodTabs variant="chip" items={TABS} value={channel} onChange={setChannel} />
        </div>

        <div className="mt-[31px] grid h-[161px] grid-cols-[424px_1fr] gap-[14px]">
          <RatingCard reviews={reviews} channel={channel} onChannel={setChannel} />
          <SentimentCard reviews={reviews} />
        </div>

        <KeywordCard channel={channel} />
        <InsightList />

        <ReviewList
          reviews={reviews}
          selectedId={selectedId}
          itemRef={(id) => (el) => {
            items.current[id] = el
          }}
          onRegistered={(_, allDone) => toast.show(allDone ? '부정리뷰 답글을 모두 등록했어요. 액션도 완료됐어요' : '답글을 등록했어요')}
        />
      </div>
    </div>
  )
}
