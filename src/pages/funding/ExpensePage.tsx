import { TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/expense.json'
import { currentMonth, monthExpense, payDayLabel, type Month } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import ExpenseEditModal from './ExpenseEditModal'
import ExpenseRow from './ExpenseRow'
import ExpenseStackBar from './ExpenseStackBar'
import MonthSelector from './MonthSelector'
import PayDayModal from './PayDayModal'
import { won } from './expenseColors'

const card = 'rounded-card bg-white'

/** 만원 단위 쉬운 금액 — 120,000 → 12만원 */
const manwon = (n: number) => `${Math.round(Math.abs(n) / 10000).toLocaleString('ko-KR')}만원`

function CardHeader({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="px-[37px] pb-[19px] pt-[27px]">
      <h2 className="text-[18px] font-bold text-gray-900">{title}</h2>
      <div className="mt-1 flex items-center">
        <p className="text-[14px] text-gray-600">{desc}</p>
        {action}
      </div>
    </div>
  )
}

/** 인건비 주의 툴팁 — 한산한 시간 1인 운영 시 절약액 */
function LaborTip({ rate, saving, quiet }: { rate: number; saving: number; quiet: [number, number] }) {
  return (
    <div
      role="tooltip"
      className="absolute left-[calc(100%+29px)] top-1/2 z-10 w-[321px] -translate-y-[38px] animate-fade-in rounded-input bg-white px-[23px] pb-[19px] pt-4 shadow-float"
    >
      {/* 왼쪽 꼬리 */}
      <span className="absolute -left-[7px] top-[31px] h-[14px] w-[14px] rotate-45 bg-white" aria-hidden />
      <p className="relative flex items-center gap-2 text-[14px] font-semibold text-gray-900">
        <TriangleAlert size={16} className="fill-yellow-500 text-white" strokeWidth={2} />
        인건비가 매출의 {rate}%를 차지해요.
      </p>
      <p className="relative mt-[11px] break-keep text-[14px] leading-[20px] text-gray-800">
        한산한 시간({quiet[0]}~{quiet[1]}시)에 혼자 운영하면 한 달에 {manwon(saving)}을 아낄 수 있어요
      </p>
    </div>
  )
}

/** 지출관리 — 이번 달 예상지출 요약 · 고정지출 · 변동지출 */
export default function ExpensePage() {
  const toast = useToast()
  const [month, setMonth] = useState<Month>(currentMonth)
  const [tip, setTip] = useState(false)
  const { settings } = useExpense()
  const [modal, setModal] = useState<'edit' | 'payday' | null>(null)
  const e = monthExpense(month, settings)
  const label = e.isCurrent ? '이번 달' : `${month.m}월`

  return (
    <div className="px-page pb-24">
      <section className={`mt-[17px] px-9 pb-9 pt-[33px] ${card}`}>
        <MonthSelector
          value={month}
          isCurrent={e.isCurrent}
          onChange={setMonth}
          onRefresh={() => toast.show('최신 지출 내역을 불러왔어요')}
        />
        <p className="mt-[31px] font-num text-[30px] font-extrabold leading-[1.3] tracking-[-0.02em] text-gray-900">{won(e.total)}</p>
        <div className="mt-2 flex items-center">
          <p className="flex items-center gap-2 text-[16px] font-medium text-gray-800">
            <svg width="9" height="7" viewBox="0 0 9 7" aria-hidden className={e.diff >= 0 ? 'text-down' : 'rotate-180 text-info'}>
              <path d="M4.5 0 9 7H0z" fill="currentColor" />
            </svg>
            지난달 같은 기간보다 {manwon(e.diff)} {e.diff >= 0 ? '더' : '덜'} 썼어요
          </p>
          <button
            type="button"
            onClick={() => setModal('edit')}
            className="ml-auto text-[16px] text-gray-700 underline underline-offset-4 hover:text-gray-900"
          >
            지출 직접 수정하기
          </button>
        </div>
        <div className="mt-8">
          <ExpenseStackBar items={e.bar} />
        </div>
      </section>

      <div className="mt-[19px] grid grid-cols-2 gap-[17px]">
        <section className={card}>
          <CardHeader
            title={`${label} 고정지출`}
            desc={data.fixedDesc}
            action={
              <button
                type="button"
                onClick={() => setModal('payday')}
                className="ml-auto text-[14px] text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                납부일 변경
              </button>
            }
          />
          <ul className="mx-[26px] border-t border-gray-300 pb-[15px] pt-2">
            {e.fixed.map((f) => (
              <ExpenseRow
                key={f.id}
                item={f}
                sub={
                  <>
                    <span className="text-gray-900">{f.dueText}</span> / 매달 {payDayLabel(f.payDay)} · {f.source}
                  </>
                }
              />
            ))}
          </ul>
        </section>

        <section className={card}>
          <CardHeader title={`${label} 변동지출`} desc={data.variableDesc} />
          <ul className="mx-[26px] border-t border-gray-300 pb-[15px] pt-2">
            {e.variable.map((v) => (
              <ExpenseRow
                key={v.id}
                item={v}
                sub={v.sub}
                onMouseEnter={v.warn ? () => setTip(true) : undefined}
                onMouseLeave={v.warn ? () => setTip(false) : undefined}
                badge={
                  v.warn && (
                    <span className="relative flex">
                      <TriangleAlert size={17} className="fill-yellow-500 text-white" strokeWidth={2} aria-label="주의" />
                      {tip && <LaborTip {...e.labor} />}
                    </span>
                  )
                }
              />
            ))}
          </ul>
        </section>
      </div>
      <ExpenseEditModal open={modal === 'edit'} month={month} onClose={() => setModal(null)} />
      <PayDayModal open={modal === 'payday'} onClose={() => setModal(null)} />
    </div>
  )
}
