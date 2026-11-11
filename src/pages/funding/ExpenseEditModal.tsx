import { RotateCcw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/expense.json'
import { autoVariable, monthExpense, monthKey, type FixedId, type Month, type VariableId } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import { EXPENSE_BG, won } from './expenseColors'

const VARIABLE: { id: VariableId; name: string; hint: string }[] = [
  { id: 'labor', name: '인건비', hint: '근무표로 자동 계산' },
  { id: 'material', name: '재료 발주비', hint: '매출의 32%로 자동 계산' },
  { id: 'repair', name: '매장 관리 · 수리비', hint: '' },
]

/** 금액 입력 — 쉼표 자동, 숫자만 */
function AmountInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <label className="flex h-11 w-[200px] items-center rounded-input bg-gray-200 px-4 focus-within:ring-1 focus-within:ring-yellow-300">
      <input
        aria-label={label}
        inputMode="numeric"
        value={value.toLocaleString('ko-KR')}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, '').slice(0, 10)) || 0)}
        onFocus={(e) => e.target.select()}
        className="w-full bg-transparent text-right font-num text-[16px] font-semibold text-gray-900 outline-none"
      />
      <span className="ml-1 text-[15px] text-gray-700">원</span>
    </label>
  )
}

function Row({ id, name, hint, children }: { id: FixedId | VariableId; name: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <li className="flex h-[68px] items-center border-b border-gray-200">
      <span className={`h-9 w-[5px] rounded-full ${EXPENSE_BG[id]}`} />
      <div className="ml-4">
        <p className="text-[16px] font-medium text-gray-900">{name}</p>
        {hint && <p className="mt-0.5 text-[13px] text-gray-500">{hint}</p>}
      </div>
      <div className="ml-auto">{children}</div>
    </li>
  )
}

type Props = { open: boolean; month: Month; onClose: () => void }

/** 지출 직접 수정하기 — 고정지출(매달 공통)과 그 달 변동지출 금액 */
export default function ExpenseEditModal({ open, month, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} width={640}>
      {open && <EditForm month={month} onClose={onClose} />}
    </Modal>
  )
}

function EditForm({ month, onClose }: { month: Month; onClose: () => void }) {
  const toast = useToast()
  const { settings, updateFixed, setMonthVariable } = useExpense()
  const auto = autoVariable(month, settings.staff)
  const saved = settings.overrides[monthKey(month)] ?? {}
  const [fixed, setFixed] = useState(
    () => Object.fromEntries(data.fixed.map((f) => [f.id, settings.fixed[f.id as FixedId].amount])) as Record<FixedId, number>,
  )
  const [variable, setVariable] = useState<Record<VariableId, number>>(() => ({ ...auto, ...saved }))

  // 바꾼 값으로 다시 계산한 총 지출 (저장 전 미리보기)
  const draft = {
    ...settings,
    fixed: Object.fromEntries(
      data.fixed.map((f) => [f.id, { ...settings.fixed[f.id as FixedId], amount: fixed[f.id as FixedId] }]),
    ) as typeof settings.fixed,
    overrides: { ...settings.overrides, [monthKey(month)]: variable },
  }
  const before = monthExpense(month, settings).total
  const after = monthExpense(month, draft).total
  const changed = after !== before || JSON.stringify(variable) !== JSON.stringify({ ...auto, ...saved })

  const save = () => {
    updateFixed(Object.fromEntries(data.fixed.map((f) => [f.id, { amount: fixed[f.id as FixedId] }])))
    // 자동 계산값과 같은 항목은 저장하지 않음 → 계속 자동으로 따라감
    setMonthVariable(month, Object.fromEntries(VARIABLE.filter((v) => variable[v.id] !== auto[v.id]).map((v) => [v.id, variable[v.id]])))
    onClose()
    toast.show('지출을 수정했어요. 총 지출과 비중에 바로 반영돼요')
  }

  const section = 'mt-7 text-[15px] font-semibold text-gray-900'
  return (
    <div className="max-h-[calc(100vh-40px)] overflow-y-auto px-12 pb-10 pt-12">
      <h2 className="text-subhead text-gray-900">{month.m}월 지출 직접 수정하기</h2>
      <p className="mt-3 text-[16px] text-gray-600">실제 금액과 일치하지 않는 금액은 직접 변경할수있어요.</p>

      <h3 className={section}>
        고정지출 <span className="ml-1.5 text-[13px] font-normal text-gray-500">매달 같은 금액으로 바뀌어요</span>
      </h3>
      <ul className="mt-2 border-t border-gray-300">
        {data.fixed.map((f) => (
          <Row key={f.id} id={f.id as FixedId} name={f.name}>
            <AmountInput label={f.name} value={fixed[f.id as FixedId]} onChange={(v) => setFixed((s) => ({ ...s, [f.id]: v }))} />
          </Row>
        ))}
      </ul>

      <h3 className={section}>
        변동지출 <span className="ml-1.5 text-[13px] font-normal text-gray-500">{month.m}월에만 반영돼요</span>
      </h3>
      <ul className="mt-2 border-t border-gray-300">
        {VARIABLE.map((v) => {
          const edited = variable[v.id] !== auto[v.id]
          return (
            <Row
              key={v.id}
              id={v.id}
              name={v.name}
              hint={
                edited ? (
                  <button
                    type="button"
                    onClick={() => setVariable((s) => ({ ...s, [v.id]: auto[v.id] }))}
                    className="flex items-center gap-1 text-yellow-700 hover:underline"
                  >
                    <RotateCcw size={12} strokeWidth={2} />
                    자동 계산값({won(auto[v.id])})으로 되돌리기
                  </button>
                ) : (
                  v.hint
                )
              }
            >
              <AmountInput label={v.name} value={variable[v.id]} onChange={(n) => setVariable((s) => ({ ...s, [v.id]: n }))} />
            </Row>
          )
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between rounded-input bg-gray-100 px-5 py-4">
        <span className="text-[15px] text-gray-700">{month.m}월 총 지출</span>
        <span className="font-num text-[18px] font-bold text-gray-900">
          {after !== before && <span className="mr-2 text-[14px] font-medium text-gray-500 line-through">{won(before)}</span>}
          {won(after)}
        </span>
      </div>

      <div className="mt-8 flex flex-col items-center">
        <Button size="lg" className="w-[244px]" disabled={!changed} onClick={save}>
          저장하기
        </Button>
        <button type="button" onClick={onClose} className="mt-4 text-[16px] text-gray-600 hover:text-gray-900">
          닫기
        </button>
      </div>
    </div>
  )
}
