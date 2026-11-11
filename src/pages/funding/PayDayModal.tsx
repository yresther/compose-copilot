import { useState } from 'react'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import Modal from '../../components/ui/Modal'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/expense.json'
import { payDayLabel, type FixedId } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import { EXPENSE_BG, won } from './expenseColors'

const DAYS = Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: `매달 ${payDayLabel(i + 1)}` }))

type Props = { open: boolean; onClose: () => void }

/** 납부일 변경 — 고정지출 4개의 매달 나가는 날 */
export default function PayDayModal({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} width={560}>
      {open && <PayDayForm onClose={onClose} />}
    </Modal>
  )
}

function PayDayForm({ onClose }: { onClose: () => void }) {
  const toast = useToast()
  const { settings, updateFixed } = useExpense()
  const [days, setDays] = useState(() => Object.fromEntries(data.fixed.map((f) => [f.id, settings.fixed[f.id as FixedId].payDay])))
  const changed = data.fixed.some((f) => days[f.id] !== settings.fixed[f.id as FixedId].payDay)

  const save = () => {
    updateFixed(Object.fromEntries(data.fixed.map((f) => [f.id, { payDay: days[f.id] }])))
    onClose()
    toast.show('납부일을 변경했어요')
  }

  return (
    <div className="max-h-[calc(100vh-40px)] overflow-y-auto px-12 pb-10 pt-12">
      <h2 className="text-subhead text-gray-900">납부일 변경</h2>
      <p className="mt-3 text-[16px] text-gray-600">매달 나가는 고정 지출의 납부일을 변경할 수 있어요.</p>

      <ul className="mt-8 border-t border-gray-300">
        {data.fixed.map((f) => (
          <li key={f.id} className="flex h-[72px] items-center border-b border-gray-200">
            <span className={`h-9 w-[5px] rounded-full ${EXPENSE_BG[f.id as FixedId]}`} />
            <div className="ml-4">
              <p className="text-[16px] font-medium text-gray-900">{f.name}</p>
              <p className="mt-0.5 font-num text-[13px] text-gray-600">{won(settings.fixed[f.id as FixedId].amount)}</p>
            </div>
            <div className="ml-auto">
              <Dropdown
                options={DAYS}
                value={String(days[f.id])}
                onChange={(v) => setDays((d) => ({ ...d, [f.id]: Number(v) }))}
                ariaLabel={`${f.name} 납부일`}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-9 flex flex-col items-center">
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
