import { Check, ChevronDown, ChevronUp, CircleAlert, Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import lockIcon from '../../assets/icons/lock.svg'
import moneyBag from '../../assets/icons/money-bag.svg'
import Badge from '../../components/ui/Badge'
import Dropdown from '../../components/ui/Dropdown'
import { useToast } from '../../components/ui/Toast'
import expenseData from '../../data/expense.json'
import data from '../../data/onboarding.json'
import { useDismiss } from '../../hooks/useDismiss'
import { COMMON_PAY_DAYS, payDayLabel, type FixedId } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import { useOnboarding } from './OnboardingContext'
import { FieldLabel, PrimaryButton, StepTitle } from './parts'

const s = data.step3
const NAME = Object.fromEntries(expenseData.fixed.map((f) => [f.id, f.name])) as Record<FixedId, string>
const MAIN = s.main as FixedId[]
const EXTRA = expenseData.fixed.map((f) => f.id as FixedId).filter((id) => !MAIN.includes(id))

/** 노란 카드 아이콘 (사업용 계좌) */
function CardIcon() {
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" aria-hidden>
      <rect x="1" y="2" width="24" height="16" rx="2.5" fill="#F9B418" />
      <rect x="1" y="6" width="24" height="3.2" fill="#FFE590" />
      <rect x="4.5" y="12.5" width="7" height="2" rx="1" fill="#FFF6D3" />
    </svg>
  )
}

/** 금액 입력 — 쉼표 자동, 0이면 빈칸(예시 문구) */
function AmountInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <input
      aria-label={`${label} 금액`}
      inputMode="numeric"
      placeholder={s.manual.placeholder}
      value={value ? value.toLocaleString('ko-KR') : ''}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '').slice(0, 10)) || 0)}
      className="h-[47px] min-w-0 flex-1 rounded-input border border-transparent bg-gray-200 px-5 font-num text-[16px] text-gray-900 outline-none placeholder:font-sans placeholder:text-gray-500 focus:border-yellow-300 focus:bg-white"
    />
  )
}

/** 매월 N일 — 누르면 흔히 쓰는 납부일(1·5·10·15·20·25일·말일) 목록 */
function PayDayBox({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))
  // 지금 값이 목록에 없으면(지출관리에서 바꾼 날) 그 날도 함께 보여줌
  const days = COMMON_PAY_DAYS.includes(value) ? COMMON_PAY_DAYS : [...COMMON_PAY_DAYS, value].sort((x, y) => x - y)
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label={`${label} 납부일`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-[47px] w-[98px] items-center justify-between rounded-input border bg-white pl-[14px] pr-[8px] transition-colors ${
          open ? 'border-yellow-300' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="text-[15px] text-gray-900">매월 {payDayLabel(value)}</span>
        <span className="flex flex-col text-gray-400">
          <ChevronUp size={13} strokeWidth={2.5} />
          <ChevronDown size={13} strokeWidth={2.5} className="-mt-1" />
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-20 w-[120px] animate-fade-in rounded-input border border-gray-200 bg-white py-1.5 shadow-float"
        >
          {days.map((d) => {
            const on = d === value
            return (
              <li key={d}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    onChange(d)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-left text-[14px] hover:bg-gray-100 ${on ? 'font-semibold text-gray-900' : 'text-gray-600'}`}
                >
                  매월 {payDayLabel(d)}
                  {on && <Check size={14} strokeWidth={2.5} className="text-yellow-500" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/** 3단계 — 고정지출 등록. 금액·납부일·입력 방식은 지출관리와 같은 공유 상태(ExpenseContext)에 바로 저장 */
export default function Step3Expense() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, set } = useOnboarding()
  const { settings, updateFixed } = useExpense()
  // 기타 고정비 — 금액이 있는 항목만 보이고, + 버튼으로 남은 항목을 추가
  const [shownExtra, setShownExtra] = useState<FixedId[]>(() => EXTRA.filter((id) => settings.fixed[id].amount > 0))
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useDismiss(menuRef, menu, () => setMenu(false))
  const addable = EXTRA.filter((id) => !shownExtra.includes(id))

  const editAmount = (id: FixedId, amount: number) => updateFixed({ [id]: { amount, source: 'manual' } })
  const linkAccount = () => {
    const ids = expenseData.fixed.map((f) => f.id as FixedId)
    updateFixed(Object.fromEntries(ids.map((id) => [id, { source: 'account' }])))
    setShownExtra(EXTRA)
    set('accountLinked', true)
    toast.show(`${form.bank} 계좌를 연동했어요`)
  }

  const row = (id: FixedId, removable = false) => (
    <div key={id}>
      <FieldLabel className="flex items-center gap-2">
        {NAME[id]}
        {settings.fixed[id].source === 'account' && form.accountLinked && (
          <span className="text-[12px] font-medium text-success">계좌 연동</span>
        )}
      </FieldLabel>
      <div className="mt-[11px] flex items-center gap-[7px]">
        <AmountInput label={NAME[id]} value={settings.fixed[id].amount} onChange={(v) => editAmount(id, v)} />
        <PayDayBox label={NAME[id]} value={settings.fixed[id].payDay} onChange={(d) => updateFixed({ [id]: { payDay: d } })} />
        {removable ? (
          <button
            type="button"
            aria-label={`${NAME[id]} 빼기`}
            onClick={() => {
              editAmount(id, 0)
              setShownExtra((l) => l.filter((x) => x !== id))
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
          >
            <X size={15} />
          </button>
        ) : (
          // 기타 고정비 줄과 입력칸 끝을 맞추는 빈 칸
          <span className="w-6 shrink-0" aria-hidden />
        )}
      </div>
    </div>
  )

  return (
    <div className="ml-[163px] w-[872px] pt-[165px]">
      <StepTitle title={s.title} description={s.description} />

      <div className="mt-[52px] grid grid-cols-2 gap-[15px]">
        {/* 사업용 계좌 연동 (추천) */}
        <section className="flex flex-col rounded-card border border-yellow-500 bg-white px-[25px] pb-[24px] pt-[30px]">
          <h2 className="flex items-center gap-[8px] text-[17px] font-bold text-gray-900">
            <CardIcon />
            {s.account.title}
            <Badge tone="warning" size="sm" className="ml-1 h-[22px] bg-yellow-300 px-[10px] text-[12px] font-semibold text-white">
              {s.account.badge}
            </Badge>
          </h2>
          <p className="mt-[8px] text-[14px] text-gray-700">{s.account.description}</p>
          <ul className="mt-[31px] flex flex-col gap-[10px] pl-[13px]">
            {s.account.features.map((f) => (
              <li key={f} className="flex items-center gap-[15px] text-[15px] text-gray-800">
                <Check size={14} strokeWidth={2} className="text-yellow-500" />
                {f}
              </li>
            ))}
          </ul>
          <FieldLabel className="mt-[38px]">{s.account.bankLabel}</FieldLabel>
          <div className="mt-[12px] [&>div>button]:h-[47px] [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:rounded-input [&>div>button]:border-transparent [&>div>button]:bg-gray-200 [&>div>button]:px-5 [&>div>button]:text-[15px] [&>div]:w-full">
            <Dropdown
              options={s.account.banks.map((b) => ({ value: b, label: b }))}
              value={form.bank}
              displayLabel={form.bank || <span className="text-gray-500">{s.account.bankPlaceholder}</span>}
              onChange={(b) => {
                set('bank', b)
                set('accountLinked', false)
              }}
              ariaLabel={s.account.bankLabel}
            />
          </div>
          {form.accountLinked ? (
            <p className="mt-[18px] flex h-[47px] items-center justify-center gap-2 rounded-input bg-success-bg text-[15px] font-semibold text-success">
              <Check size={17} strokeWidth={2.5} />
              {s.account.linked.replace('{count}', String(expenseData.fixed.length))}
            </p>
          ) : (
            <button
              type="button"
              disabled={!form.bank}
              onClick={linkAccount}
              className="mt-[18px] h-[47px] rounded-input bg-brown-900 text-[16px] font-medium text-white transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {s.account.cta}
            </button>
          )}
          <p className="mt-[24px] flex items-center gap-[6px] text-[14px] text-gray-600">
            <img src={lockIcon} alt="" className="h-4 w-4" />
            {s.account.security}
          </p>
        </section>

        {/* 고정 지출 직접 입력 — 지출관리 고정지출과 같은 값 */}
        <section className="flex flex-col rounded-card border border-gray-300 bg-white px-[28px] pb-[28px] pt-[30px]">
          <h2 className="flex items-center gap-[8px] text-[17px] font-bold text-gray-900">
            {/* 돈주머니 아이콘을 노란색으로 */}
            <span
              className="h-6 w-6 bg-yellow-500"
              style={{
                WebkitMask: `url(${JSON.stringify(moneyBag)}) center / contain no-repeat`,
                mask: `url(${JSON.stringify(moneyBag)}) center / contain no-repeat`,
              }}
              aria-hidden
            />
            {s.manual.title}
          </h2>
          <p className="mt-[8px] text-[14px] text-gray-700">{s.manual.description}</p>
          <div className="mt-[20px] flex flex-col gap-[21px]">
            {MAIN.map((id) => row(id))}
            {shownExtra.map((id) => row(id, true))}
          </div>
          <div ref={menuRef} className="relative mt-[24px]">
            <button
              type="button"
              onClick={() => (addable.length ? setMenu((m) => !m) : toast.show('추가할 수 있는 고정비를 모두 등록했어요'))}
              className="flex h-[47px] w-full items-center justify-center gap-[7px] rounded-input border border-dashed border-gray-300 text-[15px] text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <Plus size={16} strokeWidth={1.75} />
              {s.manual.addLabel}
            </button>
            {menu && (
              <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 animate-fade-in rounded-input border border-gray-200 bg-white py-1.5 shadow-float">
                {addable.map((id) => (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        setShownExtra((l) => [...l, id])
                        setMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-[15px] text-gray-700 hover:bg-gray-100"
                    >
                      {NAME[id]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-[34px] flex gap-[8px] whitespace-pre-line text-[14px] leading-[20px] text-gray-700">
            <CircleAlert size={15} className="mt-[2px] shrink-0 text-white" fill="#BDBDBD" />
            {s.manual.note}
          </p>
        </section>
      </div>

      <div className="mt-[62px] flex flex-col items-center">
        <PrimaryButton onClick={() => navigate('/onboarding/4')}>{s.cta}</PrimaryButton>
        <button type="button" onClick={() => navigate('/onboarding/4')} className="mt-[28px] text-[16px] text-gray-700 hover:text-gray-900">
          {s.later}
        </button>
      </div>
    </div>
  )
}
