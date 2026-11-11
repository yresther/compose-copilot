import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import coinImg from '../../assets/illust/coin.png'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import BottomSheet from '../../components/ui/BottomSheet'
import Button from '../../components/ui/Button'
import CheckOptionCard from '../../components/ui/CheckOptionCard'
import PeriodTabs from '../../components/ui/PeriodTabs'
import { TextLink } from '../../components/ui/SectionCard'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/funding-policy.json'
import FundingCard, { type Program } from './FundingCard'
import { InfoChip, type Answers } from './PolicySurvey'
import { preInfoChips, type PreInfo } from './PreInfoEditor'

type Filter = 'all' | 'instant' | 'closing'
const matches = (p: Program, f: Filter) =>
  f === 'instant' ? p.instant : f === 'closing' ? p.deadlineDays !== null && p.deadlineDays <= 15 : true

const FILTERS = data.filters.map((f) => ({ key: f.value as Filter, label: f.label }))
const programs = data.programs as Program[]

/** 설문 답 → '설문에서 수집된 정보' 칩 */
const surveyChips = (answers: Answers) =>
  data.questions.flatMap((q) => {
    const o = q.options.find((x) => x.value === answers[q.id])
    return o ? [{ label: q.chipLabel, value: o.chip }] : []
  })

type Props = { answers: Answers; preInfo: PreInfo; onEdit: () => void }

/** 3단계 — 찾은 지원금 요약 + 필터 + 지원금 카드 + 상담요청 바텀시트 */
export default function PolicyResult({ answers, preInfo, onEdit }: Props) {
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  const [consultFor, setConsultFor] = useState<Program | null>(null)
  const [channel, setChannel] = useState('kakao')
  const [consulted, setConsulted] = useState<string[]>([])
  // 요약 링크로 고른 카드 — 그 카드로 스크롤하고 잠깐 노란 테두리로 표시
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null)
  const highlightId = focus?.id ?? null
  useEffect(() => {
    if (!focus) return
    document.getElementById(`program-${focus.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // 스크롤이 끝나고 잠깐 보여준 뒤 테두리를 다시 지움
    const timer = setTimeout(() => setFocus(null), 1800)
    return () => clearTimeout(timer)
  }, [focus])
  const focusProgram = (id: string) => {
    const p = programs.find((x) => x.id === id)!
    // 지금 필터에서 안 보이는 카드면 전체로 돌려서 보이게
    if (!matches(p, filter)) setFilter('all')
    setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 }))
  }

  const visible = programs.filter((p) => matches(p, filter))

  const requestConsult = () => {
    const c = data.consult.channels.find((x) => x.id === channel)!
    setConsulted((list) => [...list, consultFor!.id])
    setConsultFor(null)
    toast.show(c.toast)
  }

  return (
    <>
      {/* 요약 */}
      <section className="mt-[13px] flex h-[270px] rounded-card bg-white">
        <div className="relative w-[502px] shrink-0 pl-[34px] pt-[38px]">
          <h2 className="text-subhead text-gray-900">
            {data.owner}님을 위한 지원금 <span className="text-yellow-700">{programs.length}개</span> 찾았어요
          </h2>
          <ul className="mt-[57px] flex flex-col gap-[14px]">
            {data.summaryLinks.map((id) => {
              const p = programs.find((x) => x.id === id)!
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => focusProgram(id)}
                    className="flex items-center gap-3 text-[16px] font-medium text-gray-700 hover:text-gray-900"
                  >
                    {p.linkLabel}
                    <ArrowRight size={18} strokeWidth={1.5} className="text-gray-500" />
                  </button>
                </li>
              )
            })}
          </ul>
          {/* 돈주머니 일러스트 에셋이 없어 코인 이미지로 대신 */}
          <img src={coinImg} alt="" className="absolute bottom-[30px] right-[48px] w-[86px]" />
        </div>

        <span className="my-[30px] w-px bg-gray-200" />

        <div className="flex-1 pl-[41px] pr-[53px] pt-[27px]">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-[14px] font-medium text-gray-800">
              <AiSparkleIcon size={14} className="text-gray-500" />
              POS · 온보딩에서 수집된 정보
            </p>
            <span className="text-[14px]">
              <TextLink onClick={onEdit}>응답 수정하기</TextLink>
            </span>
          </div>
          <div className="mt-[17px] flex flex-wrap gap-2">
            {preInfoChips(preInfo).map((c) => (
              <InfoChip key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
          <p className="mt-[37px] flex items-center gap-2 text-[14px] font-medium text-gray-800">
            <AiSparkleIcon size={14} className="text-gray-500" />
            설문에서 수집된 정보
          </p>
          <div className="mt-[18px] flex flex-wrap gap-x-2 gap-y-[13px]">
            {surveyChips(answers).map((c) => (
              <InfoChip key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-[33px]">
        <PeriodTabs variant="light" items={FILTERS} value={filter} onChange={setFilter} />
      </div>

      <div className="mt-[21px] grid grid-cols-2 gap-[17px]">
        {visible.map((p) => (
          <FundingCard
            key={p.id}
            program={p}
            highlighted={highlightId === p.id}
            consulted={consulted.includes(p.id)}
            onConsult={() => {
              setChannel('kakao')
              setConsultFor(p)
            }}
            onApply={() => window.open(p.url, '_blank', 'noopener,noreferrer')}
          />
        ))}
      </div>

      {/* 상담요청 바텀시트 — 카카오톡 / 전화 중 하나 */}
      <BottomSheet open={!!consultFor} onClose={() => setConsultFor(null)}>
        <h2 className="mt-6 text-[22px] font-bold text-gray-900">{data.consult.title}</h2>
        <p className="mt-2 text-[15px] text-gray-600">{consultFor?.name} 신청 방법을 전문 상담사가 안내해드려요.</p>
        <div className="mt-6 flex flex-col gap-3">
          {data.consult.channels.map((c) => (
            <CheckOptionCard
              key={c.id}
              checked={channel === c.id}
              onChange={() => setChannel(c.id)}
              label={c.label}
              aside={c.aside}
              description={c.desc}
            />
          ))}
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="outline" size="lg" className="w-[150px]" onClick={() => setConsultFor(null)}>
            닫기
          </Button>
          <Button size="lg" className="w-[200px]" onClick={requestConsult}>
            상담 요청하기
          </Button>
        </div>
      </BottomSheet>
    </>
  )
}
