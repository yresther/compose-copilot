import starIcon from '../../assets/icons/star.png'
import Dropdown from '../../components/ui/Dropdown'
import data from '../../data/reviews.json'
import type { Review } from '../../state/ReviewsContext'
import type { ChannelFilter } from './ReviewPage'

const card = 'rounded-card bg-white'

/** 평균 평점 — 지난달과 비교 (오름 초록 ▲ / 내림 빨강 ▼ / 같음 회색) */
export function RatingCard({
  reviews,
  channel,
  onChannel,
}: {
  reviews: Review[]
  channel: ChannelFilter
  onChannel: (c: ChannelFilter) => void
}) {
  const avg = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
  const diff = Math.round((avg - data.lastMonthRating[channel]) * 10) / 10
  const tone = diff > 0 ? 'text-success' : diff < 0 ? 'text-down' : 'text-gray-600'
  return (
    <section className={`${card} relative px-[27px] pt-[28px]`}>
      <div className="flex">
        <span className="flex h-[70px] w-[70px] items-center justify-center rounded-[18px] bg-gray-100">
          <img src={starIcon} alt="" className="w-[42px]" />
        </span>
        <div className="ml-[15px]">
          <p className="text-[18px] font-semibold text-gray-900">평균 평점</p>
          <p className="mt-[2px] flex items-baseline gap-[7px]">
            <span className="font-num text-[30px] font-extrabold leading-[1.2] text-gray-900">{avg.toFixed(1)}</span>
            <span className="text-[16px] text-gray-600">점</span>
          </p>
        </div>
        <div className="absolute right-[27px] top-[22px]">
          <Dropdown
            variant="plain"
            ariaLabel="플랫폼"
            value={channel}
            onChange={onChannel}
            options={data.channels.map((c) => ({ value: c.key as ChannelFilter, label: data.platformLabel[c.key as ChannelFilter] }))}
          />
        </div>
      </div>
      <p className={`mt-[13px] flex items-center gap-[9px] text-[15px] font-semibold ${tone}`}>
        {diff !== 0 && (
          <svg width="8" height="7" viewBox="0 0 8 7" aria-hidden className={diff < 0 ? 'rotate-180' : ''}>
            <path d="M4 0 8 7H0z" fill="currentColor" />
          </svg>
        )}
        {diff === 0 ? '지난달과 같아요' : `지난달보다 ${Math.abs(diff).toFixed(1)}점 ${diff > 0 ? '올랐어요' : '내렸어요'}`}
      </p>
    </section>
  )
}

/** 긍정/부정 비율 막대 */
export function SentimentCard({ reviews }: { reviews: Review[] }) {
  const pos = reviews.filter((r) => r.sentiment === 'positive').length
  const pct = Math.round((pos / reviews.length) * 100)
  return (
    <section className={`${card} px-[29px] pt-[29px]`}>
      <h2 className="text-[18px] font-bold text-gray-900">
        리뷰 {reviews.length}개 중 {pos}개는 긍정 리뷰예요!
      </h2>
      <div className="mt-[25px] flex h-4 overflow-hidden rounded-full" role="img" aria-label={`긍정 ${pct}%, 부정 ${100 - pct}%`}>
        <span className="bg-positive" style={{ width: `${pct}%` }} />
        <span className="flex-1 bg-negative" />
      </div>
      <p className="mt-4 flex justify-between text-[15px] font-semibold">
        <span className="text-success">긍정리뷰 {pct}%</span>
        <span className="text-down">부정리뷰 {100 - pct}%</span>
      </p>
    </section>
  )
}

const chip = 'flex h-[29px] items-center rounded-full px-[15px] text-[14px] font-medium'

/** 이번 달 리뷰에서 많이 나온 말 — 좋았던 점 / 아쉬운 점 / 새로 많이 나온 말 */
export function KeywordCard({ channel }: { channel: ChannelFilter }) {
  const k = data.keywords[channel]
  const box = 'h-[99px] w-[332px] rounded-input bg-gray-100 pl-[19px] pt-[17px]'
  return (
    <section className={`${card} mt-5 px-[27px] pb-[23px] pt-5`}>
      <h2 className="text-[18px] font-bold text-gray-900">이번 달 리뷰에서 많이 나온 말이에요</h2>
      <div className="mt-4 flex gap-[22px]">
        <div className={box}>
          <p className="text-[16px] text-gray-600">좋았던 점</p>
          <div className="mt-[14px] flex gap-[9px]">
            {k.good.map((w) => (
              <span key={w} className={`${chip} bg-success-soft text-success`}>
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className={box}>
          <p className="text-[16px] text-gray-600">아쉬운 점</p>
          <div className="mt-[14px] flex gap-[9px]">
            {k.bad.map((w) => (
              <span key={w} className={`${chip} bg-danger-bg text-danger`}>
                {w}
              </span>
            ))}
          </div>
        </div>
        <div className={`${box} ml-[7px]`}>
          <p className="text-[16px] text-gray-600">새로 많이 나온 말</p>
          <div className="mt-[14px] flex items-center gap-[48px]">
            <span className="text-[20px] font-bold text-black">{k.newWord.text}</span>
            <span className={`${chip} bg-danger-bg font-num text-danger`}>+{k.newWord.count}건</span>
          </div>
        </div>
      </div>
    </section>
  )
}
