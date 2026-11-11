import { forwardRef, useState } from 'react'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import data from '../../data/reviews.json'
import { useReviews, type Review } from '../../state/ReviewsContext'
import ReplyEditor from './ReplyEditor'

const CHANNEL_NAME = Object.fromEntries(data.channels.map((c) => [c.key, c.label])) as Record<string, string>

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex text-[14px] leading-none" aria-label={`별점 ${rating}점`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </span>
  )
}

type ItemProps = {
  review: Review
  selected: boolean
  editing: boolean
  onGenerate: () => void
  onCancel: () => void
  onSubmit: (text: string) => void
}

/** 리뷰 한 건 — 채널·별점·날짜 / 본문 / 답글 또는 AI 답글 생성 */
const ReviewItem = forwardRef<HTMLLIElement, ItemProps>(function ReviewItem(
  { review: r, selected, editing, onGenerate, onCancel, onSubmit },
  ref,
) {
  const { reply } = useReviews()
  const answer = reply(r.id)
  return (
    <li
      ref={ref}
      id={`review-${r.id}`}
      // 선택된 리뷰는 목록 구분선 대신 노란 테두리 카드로 (첫 줄 구분선 제거 규칙과 섞이지 않게 따로 지정)
      className={`scroll-mt-24 py-6 ${
        selected
          ? '-mx-[11px] my-2 rounded-card border border-yellow-300 px-[20px] shadow-float'
          : 'border-t border-gray-200 px-[10px] first:border-t-0'
      }`}
    >
      <div className="flex items-center gap-[10px]">
        <span className="text-[14px] font-semibold text-gray-800">{CHANNEL_NAME[r.channel]}</span>
        <Stars rating={r.rating} />
        <span className="font-num text-[13px] text-gray-500">{r.date}</span>
        {r.flagged && (
          <Badge tone="danger" size="sm">
            부정리뷰
          </Badge>
        )}
        <span className="ml-auto">
          {answer ? (
            <Badge tone="success" size="sm">
              답변 완료
            </Badge>
          ) : (
            <Badge tone="warning" size="sm">
              미답변
            </Badge>
          )}
        </span>
      </div>
      <p className="mt-3 text-[15px] leading-[1.6] text-gray-900">{r.text}</p>

      {answer ? (
        <div className="mt-4 rounded-input bg-gray-100 px-4 py-3">
          <p className="text-[13px] font-semibold text-gray-700">사장님 답글</p>
          <p className="mt-1 whitespace-pre-line text-[14px] leading-[1.6] text-gray-700">{answer}</p>
        </div>
      ) : editing && r.draft ? (
        <ReplyEditor draft={r.draft} onCancel={onCancel} onSubmit={onSubmit} />
      ) : (
        r.draft && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" className="gap-1.5 px-4" onClick={onGenerate}>
              <AiSparkleIcon size={14} className="text-yellow-300" />
              AI 답글 생성
            </Button>
          </div>
        )
      )}
    </li>
  )
})

type Props = {
  reviews: Review[]
  selectedId: string | null
  itemRef: (id: string) => (el: HTMLLIElement | null) => void
  onRegistered: (r: Review, allFlaggedDone: boolean) => void
}

const PAGE = 8

/** 리뷰 목록 — 부정리뷰만 / 미답변만 필터, 8개씩 더보기 */
export default function ReviewList({ reviews, selectedId, itemRef, onRegistered }: Props) {
  const { reply, register } = useReviews()
  const [onlyNegative, setOnlyNegative] = useState(false)
  const [onlyOpen, setOnlyOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)

  const list = reviews.filter((r) => (!onlyNegative || r.flagged) && (!onlyOpen || !reply(r.id)))
  // 선택된 리뷰는 더보기 안쪽에 있어도 보이게
  const selectedIndex = list.findIndex((r) => r.id === selectedId)
  const shown = list.slice(0, Math.max(limit, selectedIndex + 1))

  const toggle = (on: boolean, set: (v: boolean) => void, label: string) => (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        set(!on)
        setLimit(PAGE)
      }}
      className={`h-[30px] rounded-full border px-[14px] text-[14px] transition-colors ${
        on ? 'border-yellow-300 bg-yellow-50 font-semibold text-gray-900' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <section className="mt-6 rounded-card bg-white px-[27px] pb-[12px] pt-[27px]">
      <div className="flex items-center">
        <h2 className="text-[18px] font-bold text-gray-900">리뷰 목록</h2>
        <span className="ml-2 font-num text-[15px] text-gray-500">{list.length}</span>
        <div className="ml-auto flex gap-2">
          {toggle(onlyNegative, setOnlyNegative, '부정리뷰만')}
          {toggle(onlyOpen, setOnlyOpen, '미답변만')}
        </div>
      </div>
      <ul className="mt-3">
        {shown.map((r) => (
          <ReviewItem
            key={r.id}
            ref={itemRef(r.id)}
            review={r}
            selected={r.id === selectedId && !reply(r.id)}
            editing={editing === r.id}
            onGenerate={() => setEditing(r.id)}
            onCancel={() => setEditing(null)}
            onSubmit={(text) => {
              const { allFlaggedDone } = register(r.id, text)
              setEditing(null)
              onRegistered(r, allFlaggedDone)
            }}
          />
        ))}
        {list.length === 0 && <li className="py-12 text-center text-[15px] text-gray-500">조건에 맞는 리뷰가 없어요</li>}
      </ul>
      {shown.length < list.length && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE)}
          className="mt-1 w-full border-t border-gray-200 py-4 text-[15px] text-gray-600 hover:text-gray-900"
        >
          더보기 ({list.length - shown.length})
        </button>
      )}
    </section>
  )
}
