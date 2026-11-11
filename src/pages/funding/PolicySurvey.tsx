import { Check, ChevronDown, ChevronUp, Info } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import pencilIcon from '../../assets/icons/pencil.svg'
import Button from '../../components/ui/Button'
import data from '../../data/funding-policy.json'
import { preInfoChips, type PreInfo } from './PreInfoEditor'

export type Answers = Record<string, string>
type Question = (typeof data.questions)[number]

const BASIC = data.questions.filter((q) => q.group === 'basic')
const EXTRA = data.questions.filter((q) => q.group === 'extra')

/** 수집 정보 칩 — 회색 라벨 + 굵은 값 */
export function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex h-[29px] items-center gap-2 rounded-full bg-gray-100 px-[14px] text-[14px]">
      <span className="text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </span>
  )
}

/** 왼쪽 진행 스테퍼 한 칸 — 점 + 제목(+배지·설명) + 아래로 이어지는 점선 (progress: 0~1 노란 구간 비율) */
function StepRow({
  title,
  badge,
  desc,
  active,
  progress,
  last,
  children,
}: {
  title: string
  badge?: string
  desc?: string
  active: boolean
  progress: number
  last?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[438px_702px]">
      <div className="relative flex flex-col pl-1">
        <div className="flex items-center gap-[14px]">
          <span className={`flex h-[23px] w-[23px] items-center justify-center rounded-full ${active ? 'bg-yellow-100' : 'bg-gray-200'}`}>
            <span className={`h-[10px] w-[10px] rounded-full ${active ? 'bg-yellow-500' : 'bg-gray-400'}`} />
          </span>
          <span className="text-[20px] font-bold text-gray-900">{title}</span>
          {badge && (
            <span className="flex h-6 items-center rounded-full border border-yellow-line bg-yellow-50 px-2.5 text-[12px] font-medium text-yellow-700">
              {badge}
            </span>
          )}
        </div>
        {desc && <p className="ml-[37px] mt-2 text-[14px] text-gray-700">{desc}</p>}
        {!last && (
          // 지나온 구간은 노랑, 남은 구간은 회색 점선
          <div className="ml-[15px] mt-3 flex flex-1 flex-col pb-3">
            <span className="border-l-2 border-dotted border-yellow-500" style={{ flexGrow: progress }} />
            <span className="border-l-2 border-dotted border-gray-300" style={{ flexGrow: 1 - progress }} />
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  )
}

/** 설문 아코디언 한 칸 — 펼치면 노란 테두리, 답하면 접힌 상태에 고른 답 표시 */
function QuestionCard({
  q,
  index,
  open,
  answer,
  onToggle,
  onAnswer,
}: {
  q: Question
  index: number
  open: boolean
  answer?: string
  onToggle: () => void
  onAnswer: (value: string) => void
}) {
  const picked = q.options.find((o) => o.value === answer)
  const num = String(index + 1).padStart(2, '0')
  return (
    <div
      className={`rounded-card transition-colors ${open ? 'border border-yellow-500 bg-white' : 'border border-transparent bg-gray-100'}`}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-start px-[22px] pb-6 pt-[23px] text-left">
        <span
          className={`mt-px flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[6px] font-num text-[12px] font-semibold ${
            open ? 'bg-yellow-500 text-white' : 'bg-white text-gray-500'
          }`}
        >
          {num}
        </span>
        <span className="ml-5 flex-1">
          <span className={`block text-[16px] font-semibold ${open ? 'text-gray-900' : 'text-gray-800'}`}>{q.title}</span>
          <span className="mt-[3px] block text-[14px] text-gray-500">{q.desc}</span>
          {!open && picked && (
            <span className="mt-[25px] flex items-center gap-3 text-[15px] text-gray-900">
              <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[3px] bg-yellow-500 text-white">
                <Check size={12} strokeWidth={3} />
              </span>
              {picked.label}
            </span>
          )}
        </span>
        {open ? (
          <ChevronUp size={22} strokeWidth={1.5} className="text-gray-500" />
        ) : (
          <ChevronDown size={22} strokeWidth={1.5} className="text-gray-500" />
        )}
      </button>
      {open && (
        <div className="flex gap-5 pb-[33px] pl-[68px] pr-[22px]">
          {q.options.map((o) => {
            const on = o.value === answer
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onAnswer(o.value)}
                className={`flex h-12 w-[207px] items-center gap-4 rounded-input border px-6 text-[15px] transition-colors ${
                  on ? 'border-yellow-500 bg-yellow-50 text-gray-900' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] ${on ? 'bg-yellow-500' : 'bg-gray-300'} text-white`}
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                {o.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

type Props = {
  answers: Answers
  onAnswer: (id: string, value: string) => void
  onFind: () => void
  onLater: () => void
  /** 사전 정보(자동 수집) — 수정하기로 바꿀 수 있음 */
  preInfo: PreInfo
  onEditInfo: () => void
}

/** 2단계 — 사전 정보 · 기본설문(필수) · 추가설문(선택) */
export default function PolicySurvey({ answers, onAnswer, onFind, onLater, preInfo, onEditInfo }: Props) {
  const all = data.questions
  // 처음엔 아직 답하지 않은 첫 문항을 펼친다
  const [openId, setOpenId] = useState<string | null>(() => all.find((q) => !answers[q.id])?.id ?? null)

  const answer = (q: Question, value: string) => {
    onAnswer(q.id, value)
    // 답하면 다음 미응답 문항을 자동으로 펼침
    const i = all.findIndex((x) => x.id === q.id)
    const next = [...all.slice(i + 1), ...all.slice(0, i)].find((x) => !answers[x.id] && x.id !== q.id)
    setOpenId(next?.id ?? null)
  }

  const basicDone = BASIC.filter((q) => answers[q.id]).length
  const canFind = basicDone === BASIC.length

  const list = (qs: Question[], offset: number) => (
    <div className="flex flex-col gap-[21px]">
      {qs.map((q, i) => (
        <QuestionCard
          key={q.id}
          q={q}
          index={offset + i}
          open={openId === q.id}
          answer={answers[q.id]}
          onToggle={() => setOpenId((o) => (o === q.id ? null : q.id))}
          onAnswer={(v) => answer(q, v)}
        />
      ))}
    </div>
  )

  return (
    <div className="mt-[50px]">
      <StepRow title="사전 정보" active progress={1}>
        <section className="mb-[92px] rounded-card bg-white px-[22px] pb-[27px] pt-[23px]">
          <div className="flex items-center">
            <p className="text-[14px] font-semibold text-gray-900">이미 수집된 정보</p>
            <p className="ml-3 flex items-center gap-1 text-[13px] text-gray-400">
              <Info size={14} strokeWidth={1.5} />
              온보딩과정에서 자동으로 수집된 정보예요.
            </p>
            <button
              type="button"
              onClick={onEditInfo}
              className="ml-auto mr-[9px] flex items-center gap-1 text-[14px] text-gray-600 hover:text-gray-900"
            >
              수정하기
              <img src={pencilIcon} alt="" className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-[22px] flex flex-wrap gap-2">
            {preInfoChips(preInfo).map((p) => (
              <InfoChip key={p.label} label={p.label} value={p.value} />
            ))}
          </div>
        </section>
      </StepRow>

      <StepRow title="기본설문" badge="필수" active progress={basicDone / BASIC.length}>
        <div className="mb-[58px]">{list(BASIC, 0)}</div>
      </StepRow>

      <StepRow title="추가설문" badge="선택" desc="더 정확한 매칭을 위한 추가 설문이에요." active={canFind} progress={0} last>
        {list(EXTRA, BASIC.length)}
      </StepRow>

      <div className="mt-[35px] flex items-center justify-end gap-[76px] pr-[48px]">
        <button type="button" onClick={onLater} className="text-[17px] text-gray-700 hover:text-gray-900">
          다음에 찾기
        </button>
        <Button className="h-[47px] w-[176px] text-[17px] font-medium" disabled={!canFind} onClick={onFind}>
          지원금 찾기
        </Button>
      </div>
    </div>
  )
}
