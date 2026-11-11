import { ArrowRight } from 'lucide-react'
import koditLogo from '../../assets/logos/kodit.png'
import semasLogo from '../../assets/logos/semas.png'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'

export type Program = {
  id: string
  name: string
  linkLabel: string
  org: string
  logo: string
  limit: string
  rate: string
  term: string
  /** 마감까지 남은 일수 — null이면 상시 */
  deadlineDays: number | null
  instant: boolean
  reason: string
  /** 신청 버튼으로 여는 기관 홈페이지 */
  url: string
}

// 기관 로고 (정책자금 사이트 썸네일)
const LOGO: Record<string, string> = { semas: semasLogo, kodit: koditLogo }

function OrgLogo({ logo }: { logo: string }) {
  return (
    <span className="h-[69px] w-[69px] shrink-0 overflow-hidden rounded-[20px] border border-gray-200 bg-white">
      {LOGO[logo] && <img src={LOGO[logo]} alt="" className="h-full w-full object-cover" />}
    </span>
  )
}

/** D-day 배지 — 15일 이하 빨강, 그 이상 노랑, 상시 회색 */
function DeadlineBadge({ days }: { days: number | null }) {
  if (days === null)
    return (
      <Badge tone="neutral" size="sm" className="font-semibold">
        상시
      </Badge>
    )
  return (
    <Badge tone={days <= 15 ? 'danger' : 'warning'} size="sm" className="font-num font-semibold">
      D-{days}
    </Badge>
  )
}

type Props = {
  program: Program
  onApply?: () => void
  onConsult?: () => void
  /** 상담 요청을 마친 카드 */
  consulted?: boolean
  /** 위 요약 링크로 고른 카드 — 노란 테두리 */
  highlighted?: boolean
}

/** 정책자금 결과 카드 — 기관 · 한도/금리/기간 · 해당 이유 · 상담요청 / 신청 */
export default function FundingCard({ program: p, onApply, onConsult, consulted, highlighted }: Props) {
  return (
    <article
      id={`program-${p.id}`}
      className={`flex h-[248px] scroll-mt-6 flex-col rounded-card border bg-white px-[28px] pt-[17px] transition-[border-color,box-shadow] duration-500 ${
        highlighted ? 'border-yellow-300 shadow-float' : 'border-transparent'
      }`}
    >
      <header className="flex items-start">
        <OrgLogo logo={p.logo} />
        <div className="ml-[17px] mt-[9px]">
          <h3 className="text-[18px] font-semibold text-gray-900">{p.name}</h3>
          <p className="mt-1 text-[14px] text-gray-600">{p.org}</p>
        </div>
        <span className="ml-auto mt-[11px]">
          <DeadlineBadge days={p.deadlineDays} />
        </span>
      </header>

      <dl className="mt-4 grid h-[83px] grid-cols-3 items-center rounded-input bg-gray-100">
        {[
          ['한도', p.limit],
          ['금리', p.rate],
          ['기간', p.term],
        ].map(([label, value], i) => (
          <div key={label} className={`pl-[22px] ${i > 0 ? 'border-l border-gray-300' : ''}`}>
            <dt className="text-[14px] text-gray-600">{label}</dt>
            <dd className="mt-1.5 text-[18px] font-bold text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>

      <footer className="mt-auto flex h-[60px] items-center">
        <p className="flex items-center gap-[7px] text-[14px] text-gray-700">
          <AiSparkleIcon size={14} className="text-gray-500" />
          {p.reason}
        </p>
        <div className="ml-auto flex gap-2">
          {onConsult && (
            <Button variant="outline" size="sm" className="font-medium" disabled={consulted} onClick={onConsult}>
              {consulted ? '상담 요청됨' : '상담요청'}
            </Button>
          )}
          <Button size="sm" className="w-[85px]" onClick={onApply}>
            신청
            <ArrowRight size={15} />
          </Button>
        </div>
      </footer>
    </article>
  )
}
