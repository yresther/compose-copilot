import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, type MouseEvent, type ReactNode } from 'react'
import reviewIcon from '../../assets/icons/review.png'
import { PRODUCT_IMAGES } from '../../lib/products'
import AiSparkleIcon from '../icons/AiSparkleIcon'
import Badge, { type BadgeTone } from './Badge'
import Button from './Button'
import Checkbox from './Checkbox'

export type ActionCardData = {
  id: string
  kind: 'order' | 'review'
  category: string // 발주제안 · 리뷰관리
  badge: { tone: BadgeTone; text: string }
  title: string
  subtitle: string // 발주는 수량 (4병), 리뷰는 상태 문구
  /** 발주: 재고현황·평균 소비 */
  rows?: { label: string; value: string }[]
  /** 리뷰: 플랫폼별 부정리뷰 */
  platforms?: { name: string; value: string; done?: boolean }[]
  /** 홈 카드의 AI 추천 근거 — **굵게** 표기 지원 */
  reasons?: string[]
  /** 액션 제안 페이지 오른쪽 영역: 추천 근거 표 또는 답글 초안 */
  detail?: {
    label: string
    rows?: { label: string; value: string }[]
    draftLabel?: string
    draft?: string
  }
  cta: string
  /** 카드·버튼을 눌렀을 때 이동할 곳 */
  link?: string
  /** 품목 썸네일 (design/assets) — 없으면 임시 이모지 */
  image?: string
  /** 처리 완료된 액션 — 카드 전체를 흐린 회색 톤으로 */
  done?: boolean
}

// 액션 카드 회색 칸(54×54) 안 품목 사진 높이 — 디자인 시안 기준
const PRODUCT_ICON_HEIGHT: Record<string, number> = { 'vanilla-syrup': 45, 'red-bean': 31 }

// 사진이 없는 발주 품목은 임시 이모지 (리뷰는 design/assets/review.png)
const ICONS: Record<ActionCardData['kind'], string> = { order: '📝', review: '💬' }

/** "남은 프로모션일 **3일**" → 굵은 글씨 처리 */
export function richText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') ? (
      <strong key={i} className="font-semibold text-gray-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}

/** 카드 안 버튼·체크박스를 눌렀을 때 카드 클릭(페이지 이동)이 같이 일어나지 않게 */
export const stop = (e: MouseEvent) => e.stopPropagation()

/** 체크박스 + 카테고리 + 배지 */
export function ActionCardHeader({
  data,
  checked,
  onCheckedChange,
}: {
  data: ActionCardData
  checked: boolean
  onCheckedChange: (on: boolean) => void
}) {
  return (
    <header className="flex h-[30px] items-center justify-between">
      <div className="flex items-center gap-2">
        <span onClick={stop}>
          <Checkbox checked={checked} onChange={onCheckedChange} disabled={data.done} label={`${data.title} 선택`} />
        </span>
        <span className="text-body1 text-gray-900">{data.category}</span>
      </div>
      <Badge tone={data.badge.tone} size="sm">
        {data.badge.text}
      </Badge>
    </header>
  )
}

/** 아이콘 + 제목 + 부제 */
export function ActionCardTitle({ data, subtitle, iconSize = 54 }: { data: ActionCardData; subtitle?: string; iconSize?: number }) {
  return (
    <div className="flex items-center gap-4">
      <span
        style={{ width: iconSize, height: iconSize }}
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] text-[24px] ${data.done ? 'bg-gray-200' : 'bg-gray-100'}`}
      >
        {data.image ? (
          // 배경을 뺀 품목 사진 — 품목마다 디자인 기준 크기(높이)로
          <img src={PRODUCT_IMAGES[data.image]} alt="" style={{ height: PRODUCT_ICON_HEIGHT[data.image] ?? 40 }} className="w-auto" />
        ) : data.kind === 'review' ? (
          <img src={reviewIcon} alt="" className="w-[31.46px]" />
        ) : (
          ICONS[data.kind]
        )}
      </span>
      <div>
        <h3 className="text-[22px] font-semibold leading-[1.4] text-gray-900">{data.title}</h3>
        <p className="text-[16px] font-semibold text-gray-800">{subtitle ?? data.subtitle}</p>
      </div>
    </div>
  )
}

type Props = {
  data: ActionCardData
  /** 카드 또는 버튼을 눌렀을 때 (페이지 이동) */
  onAction?: (data: ActionCardData) => void
  /** 체크 상태를 부모가 관리할 때 (하단 완료하기 버튼과 연동) */
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

/** 대시보드 홈의 세로형 액션 카드 */
export default function ActionCard({ data, onAction, checked: checkedProp, onCheckedChange }: Props) {
  const [checkedState, setCheckedState] = useState(false)
  const checked = checkedProp ?? checkedState
  const setChecked = onCheckedChange ?? setCheckedState
  const hasDetail = !!data.reasons?.length
  // 근거가 없는 카드(리뷰)는 접힌 화살표(∨)로 시작
  const [open, setOpen] = useState(hasDetail)
  const box = data.done ? 'bg-gray-200' : 'bg-gray-100'

  return (
    <article
      onClick={() => onAction?.(data)}
      className={`flex flex-col rounded-card px-6 pt-6 transition-shadow pb-[19px] ${
        data.done ? 'bg-gray-100 opacity-60' : 'bg-white'
      } ${onAction ? 'cursor-pointer hover:shadow-float' : ''}`}
    >
      <ActionCardHeader data={data} checked={checked} onCheckedChange={setChecked} />

      <div className="mt-7">
        <ActionCardTitle data={data} />
      </div>

      {data.rows && (
        <dl className={`mt-6 flex flex-col gap-2.5 rounded-input ${box} px-5 py-[18px] text-[14px]`}>
          {data.rows.map((r) => (
            <div key={r.label} className="flex justify-between">
              <dt className="text-gray-600">{r.label}</dt>
              <dd className="font-semibold text-gray-900">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {data.platforms && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {data.platforms.map((p) => (
            <div key={p.name} className={`flex h-[42px] items-center gap-[18px] whitespace-nowrap rounded-btn ${box} px-3 text-[14px]`}>
              <span className="text-gray-600">{p.name}</span>
              <span className={p.done ? 'text-gray-400' : 'font-semibold text-gray-900'}>{p.value}</span>
            </div>
          ))}
        </div>
      )}

      {hasDetail && open && (
        <div className="mt-4">
          <p className="flex items-center gap-[5px] text-[14px] text-gray-600">
            <AiSparkleIcon className="ml-1 text-gray-600" />
            AI 추천 근거
          </p>
          <ul className={`mt-[14px] flex flex-col gap-2 rounded-input ${box} px-6 py-[10px] text-[14px] leading-[1.6] text-gray-800`}>
            {data.reasons!.map((r) => (
              <li key={r}>{richText(r)}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className={`${hasDetail ? 'mt-[18px]' : 'mt-[23px]'} flex items-center justify-between`}>
        <button
          type="button"
          aria-label={open ? '접기' : '펼치기'}
          onClick={(e) => {
            stop(e)
            setOpen((o) => !o)
          }}
          className="-ml-[3px] flex h-8 w-6 items-center justify-start text-gray-500 hover:text-gray-800"
        >
          {open ? <ChevronUp size={22} strokeWidth={1.5} /> : <ChevronDown size={22} strokeWidth={1.5} />}
        </button>
        <Button
          size="sm"
          onClick={(e) => {
            stop(e)
            onAction?.(data)
          }}
        >
          {data.cta}
          <ArrowRight size={16} />
        </Button>
      </footer>
    </article>
  )
}
