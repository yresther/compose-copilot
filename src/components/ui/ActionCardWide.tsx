import { ArrowRight } from 'lucide-react'
import { COMPLETED_SIDE_BUTTON } from '../../config/demo'
import AiSparkleIcon from '../icons/AiSparkleIcon'
import { ActionCardHeader, ActionCardTitle, richText, stop, type ActionCardData } from './ActionCard'
import Button from './Button'

type Props = {
  data: ActionCardData
  checked: boolean
  onCheckedChange: (on: boolean) => void
  /** 왼쪽 영역(과 onCta가 없을 때 전송 버튼) → 페이지 이동 */
  onOpen: (data: ActionCardData) => void
  /** 오른쪽 아래 버튼(발주시스템으로 전송 등)을 페이지 이동 대신 이 자리에서 처리 */
  onCta?: (data: ActionCardData) => void
  onComplete: (data: ActionCardData) => void
  onUndo: (data: ActionCardData) => void
  /** 초안 전체보기 (리뷰 카드) */
  onViewDraft?: (data: ActionCardData) => void
}

/** 액션 제안 페이지의 가로형 카드 — 왼쪽 요약 | 오른쪽 근거·초안 + 우측 완료하기 칸 */
export default function ActionCardWide({ data, checked, onCheckedChange, onOpen, onCta, onComplete, onUndo, onViewDraft }: Props) {
  const box = data.done ? 'bg-gray-200' : 'bg-gray-100'
  // 왼쪽 표: 발주는 재고 행, 리뷰는 플랫폼별 건수
  const leftRows = data.rows ?? data.platforms?.map((p) => ({ label: p.name, value: p.value, done: p.done })) ?? []
  const detail = data.detail

  return (
    <div className="flex gap-4">
      <article
        className={`flex h-[235px] min-w-0 flex-1 rounded-card transition-shadow [&:has(.card-link:hover)]:shadow-float ${
          data.done ? 'bg-gray-100 opacity-60' : 'bg-white'
        }`}
      >
        {/* 왼쪽: 홈 카드와 같은 요약 — 이 영역만 눌러서 이동 */}
        <div
          onClick={() => onOpen(data)}
          className="card-link flex w-[432px] shrink-0 cursor-pointer flex-col pb-[17px] pl-6 pr-[33px] pt-4"
        >
          <ActionCardHeader data={data} checked={checked} onCheckedChange={onCheckedChange} />
          <div className="mt-[17px]">
            <ActionCardTitle data={data} subtitle={data.kind === 'order' ? `수량 ${data.subtitle}` : undefined} />
          </div>
          <dl className={`mt-auto flex flex-col gap-[13px] rounded-input ${box} px-[22px] py-[13px] text-[14px]`}>
            {leftRows.map((r) => (
              <div key={r.label} className="flex justify-between">
                <dt className="text-gray-600">{r.label}</dt>
                <dd className={'done' in r && r.done ? 'text-gray-400' : 'font-semibold text-gray-900'}>{r.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <span className="mb-[15px] mt-[22px] w-px shrink-0 bg-gray-200" />

        {/* 오른쪽: 추천 근거 표 또는 답글 초안 — 버튼 외에는 눌러도 반응 없음 */}
        <div className="flex min-w-0 flex-1 flex-col pb-[17px] pl-[35px] pr-[26px] pt-[21px]">
          <div className="flex h-8 items-center justify-between">
            <p className="flex items-center gap-[5px] text-[14px] text-gray-600">
              <AiSparkleIcon className="text-gray-600" />
              {detail?.label}
            </p>
            <div className="flex gap-3">
              {detail?.draft && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-400 font-normal text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    stop(e)
                    onViewDraft?.(data)
                  }}
                >
                  초안 전체보기
                </Button>
              )}
              <Button
                size="sm"
                disabled={!!onCta && data.done}
                onClick={(e) => {
                  stop(e)
                  ;(onCta ?? onOpen)(data)
                }}
              >
                {data.cta}
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          <div className={`mt-[21px] flex-1 rounded-input ${box} px-[23px] text-[14px]`}>
            {detail?.rows && (
              <dl className="flex flex-col gap-[10px] pt-[19px]">
                {detail.rows.map((r) => (
                  <div key={r.label} className="flex">
                    <dt className="w-[79px] shrink-0 text-gray-600">{r.label}</dt>
                    <dd className="text-gray-900">{richText(r.value)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {detail?.draft && (
              <div className="pt-[19px]">
                <p className="text-gray-600">{detail.draftLabel}</p>
                <p className="mt-2 line-clamp-4 whitespace-pre-line leading-[20px] text-gray-900">{detail.draft}</p>
              </div>
            )}
          </div>
        </div>
      </article>

      <SideButton data={data} onComplete={onComplete} onUndo={onUndo} />
    </div>
  )
}

/** 카드 오른쪽 세로 '완료하기' 칸 — 완료 후 모습은 config/demo.ts 설정을 따른다 */
function SideButton({ data, onComplete, onUndo }: Pick<Props, 'data' | 'onComplete' | 'onUndo'>) {
  const base = 'h-[235px] w-[108px] shrink-0 rounded-card border border-gray-300 text-[16px] font-medium transition-colors'

  if (!data.done) {
    return (
      <button
        type="button"
        onClick={() => onComplete(data)}
        className={`${base} bg-gray-250 text-gray-600 hover:bg-gray-300 hover:text-gray-800`}
      >
        완료하기
      </button>
    )
  }
  if (COMPLETED_SIDE_BUTTON === 'hide') return <span className="w-[108px] shrink-0" aria-hidden />
  if (COMPLETED_SIDE_BUTTON === 'disabled') {
    return (
      <button type="button" disabled className={`${base} cursor-default bg-gray-200 text-gray-400`}>
        완료하기
      </button>
    )
  }
  return (
    <button type="button" onClick={() => onUndo(data)} className={`${base} bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800`}>
      완료 취소
    </button>
  )
}
