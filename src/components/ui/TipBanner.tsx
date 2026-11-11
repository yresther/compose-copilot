import { ArrowRight, X } from 'lucide-react'
import type { ReactNode } from 'react'
import AiSparkleIcon from '../icons/AiSparkleIcon'
import Button from './Button'

type Props = {
  headline: ReactNode
  body?: ReactNode
  /** 오른쪽 일러스트 */
  image?: string
  action?: { label: string; onClick: () => void }
  /** 있으면 오른쪽 위 X 버튼으로 닫을 수 있음 */
  onClose?: () => void
  /** X 버튼 위치 — top: 오른쪽 위 (기본) / center: 오른쪽 세로 가운데 (리뷰 분석) */
  closeAlign?: 'top' | 'center'
  /** 굵은 한 줄 크기 — lg 20px (기본) / md 18px (재고현황) */
  headlineSize?: 'lg' | 'md'
  /** 한 줄형: '✦ 코파일럿 Tip'과 문구를 나란히 (발주관리 하단) */
  inline?: boolean
  className?: string
}

/** 코파일럿 Tip 띠 — 노란 배경, ✦ 코파일럿 Tip / 굵은 한 줄 / 설명 (+ 액션 버튼, 일러스트, 닫기) */
export default function TipBanner({
  headline,
  body,
  image,
  action,
  onClose,
  closeAlign = 'top',
  inline,
  headlineSize = 'lg',
  className = '',
}: Props) {
  if (inline) {
    return (
      <section
        className={`relative flex h-[61px] items-center gap-[30px] rounded-card border border-yellow-line bg-yellow-50 pl-[26px] pr-14 ${className}`}
      >
        <p className="flex shrink-0 items-center gap-[5px] text-[15px] font-medium text-yellow-700">
          <AiSparkleIcon size={15} className="text-yellow-700" />
          코파일럿 Tip
        </p>
        <p className="truncate text-[15px] font-semibold text-gray-900">{headline}</p>
        {onClose && (
          <button
            type="button"
            aria-label="Tip 닫기"
            onClick={onClose}
            className="absolute right-[30px] top-1/2 flex h-[19px] w-[19px] -translate-y-1/2 items-center justify-center rounded-full bg-gray-400 text-white transition-colors hover:bg-gray-500"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </section>
    )
  }
  return (
    <section className={`relative flex items-center rounded-card border border-yellow-line bg-yellow-50 pl-[29px] pr-[46px] ${className}`}>
      <div className="min-w-0 flex-1 py-[14px]">
        <p className="flex items-center gap-[5px] text-[14px] font-medium text-yellow-700">
          <AiSparkleIcon size={14} className="text-yellow-700" />
          코파일럿 Tip
        </p>
        <p className={`mt-[9px] text-gray-900 ${headlineSize === 'lg' ? 'text-[20px] font-bold' : 'text-[18px] font-semibold'}`}>
          {headline}
        </p>
        {body && <p className="mt-[7px] text-[14px] text-gray-700">{body}</p>}
      </div>
      {action && (
        <Button size="sm" className="ml-6 shrink-0" onClick={action.onClick}>
          {action.label}
          <ArrowRight size={16} />
        </Button>
      )}
      {image && <img src={image} alt="" className="ml-10 h-[94px] w-auto shrink-0 self-start mt-[14px]" />}
      {onClose && (
        <button
          type="button"
          aria-label="Tip 닫기"
          onClick={onClose}
          className={`absolute flex h-[19px] ${closeAlign === 'center' ? 'right-[25px] top-1/2 -translate-y-1/2' : 'right-[14px] top-[19px]'} w-[19px] items-center justify-center rounded-full bg-gray-400 text-white transition-colors hover:bg-gray-500`}
        >
          <X size={12} strokeWidth={2.5} />
        </button>
      )}
    </section>
  )
}
