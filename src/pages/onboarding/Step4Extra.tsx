import { Info, Plus, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropdown from '../../components/ui/Dropdown'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/onboarding.json'
import type { Staff } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import { useOnboarding } from './OnboardingContext'
import { Chip, PrimaryButton, StepTitle } from './parts'

const s = data.step4
const WEEK = ['일', '월', '화', '수', '목', '금', '토']
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // 월요일부터
const HOURS = Array.from({ length: 20 }, (_, i) => i + 5) // 05시 ~ 24시
const hourLabel = (h: number) => `${String(h).padStart(2, '0')}:00`

/** 01 · 질문 제목 · 설명 */
function Question({
  no,
  title,
  description,
  children,
  className = '',
}: {
  no: number
  title: string
  description: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <h2 className="flex items-center gap-[11px] text-[18px] font-bold text-gray-900">
        <span className="flex h-[23px] w-[23px] items-center justify-center rounded-[6px] bg-yellow-500 font-num text-[11px] font-semibold text-white">
          {String(no).padStart(2, '0')}
        </span>
        {title}
      </h2>
      <p className="ml-[34px] mt-[11px] text-[14px] text-gray-600">{description}</p>
      <div className="ml-[34px]">{children}</div>
    </section>
  )
}

/** 운영인력 한 줄 — 구분 / 근무요일 / 근무시간 / 시급 / 삭제 */
function StaffRow({ staff, onChange, onRemove }: { staff: Staff; onChange: (s: Staff) => void; onRemove: () => void }) {
  const hourOptions = HOURS.map((h) => ({ value: String(h), label: hourLabel(h) }))
  return (
    <li className="grid grid-cols-[130px_250px_1fr_150px_24px] items-center gap-4 border-b border-gray-200 py-[11px]">
      <input
        aria-label="구분"
        value={staff.role}
        placeholder={s.staff.rolePlaceholder}
        onChange={(e) => onChange({ ...staff, role: e.target.value })}
        className="h-[38px] w-full rounded-input border border-transparent bg-gray-200 px-3 text-[14px] text-gray-900 outline-none placeholder:text-gray-500 focus:border-yellow-300 focus:bg-white"
      />
      <div className="flex gap-1" role="group" aria-label="근무요일">
        {WEEK_ORDER.map((d) => {
          const on = staff.days.includes(d)
          return (
            <button
              key={d}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...staff, days: on ? staff.days.filter((x) => x !== d) : [...staff.days, d].sort() })}
              className={`h-[30px] w-[30px] rounded-full border text-[13px] transition-colors ${
                on ? 'border-yellow-500 bg-yellow-50 font-semibold text-gray-900' : 'border-gray-300 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {WEEK[d]}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 text-[14px] text-gray-500">
        <Dropdown
          options={hourOptions.filter((o) => Number(o.value) < staff.end)}
          value={String(staff.start)}
          onChange={(v) => onChange({ ...staff, start: Number(v) })}
          ariaLabel="시작 시간"
        />
        ~
        <Dropdown
          options={hourOptions.filter((o) => Number(o.value) > staff.start)}
          value={String(staff.end)}
          onChange={(v) => onChange({ ...staff, end: Number(v) })}
          ariaLabel="끝 시간"
        />
      </div>
      <label className="flex h-[38px] items-center rounded-input border border-transparent bg-gray-200 px-3 focus-within:border-yellow-300 focus-within:bg-white">
        <input
          aria-label="시급"
          inputMode="numeric"
          value={staff.wage ? staff.wage.toLocaleString('ko-KR') : ''}
          placeholder="10,320"
          onChange={(e) => onChange({ ...staff, wage: Number(e.target.value.replace(/\D/g, '').slice(0, 6)) || 0 })}
          className="w-full min-w-0 bg-transparent text-right font-num text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
        />
        <span className="ml-1 text-[13px] text-gray-600">원</span>
      </label>
      <button
        type="button"
        aria-label={`${staff.role || '인력'} 삭제`}
        onClick={onRemove}
        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700"
      >
        <X size={15} />
      </button>
    </li>
  )
}

/** 4단계 — 추가정보 등록. 운영인력은 지출관리 인건비와 같은 공유 상태(ExpenseContext) */
export default function Step4Extra() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, set } = useOnboarding()
  const { settings, setStaff } = useExpense()
  const staff = settings.staff
  const military = form.area === s.area.military.option

  const updateStaff = (i: number, v: Staff) => setStaff(staff.map((x, j) => (j === i ? v : x)))
  const addStaff = () => setStaff([...staff, { ...s.staff.newStaff, id: `staff-${Date.now()}` }])

  return (
    <div className="ml-[163px] w-[784px] pt-[165px]">
      <StepTitle title={s.title} description={s.description} />

      <p className="mt-[25px] flex h-[56px] items-center gap-[9px] rounded-card border border-yellow-line bg-yellow-50 px-[20px] text-[15px] font-medium text-gray-900">
        <Info size={18} strokeWidth={1.75} className="text-yellow-500" />
        {s.notice}
      </p>

      <Question no={1} title={s.area.title} description={s.area.description} className="mt-[69px]">
        <div className="mt-[23px] flex flex-wrap gap-[13px]">
          {s.area.options.map((o) => (
            <Chip key={o} on={form.area === o} onClick={() => set('area', o)}>
              {o}
            </Chip>
          ))}
        </div>
        {form.area === '직접 입력' && (
          <input
            autoFocus
            value={form.customArea}
            placeholder={s.area.customPlaceholder}
            onChange={(e) => set('customArea', e.target.value)}
            className="mt-[14px] h-[47px] w-[384px] rounded-input border border-transparent bg-gray-200 px-5 text-[15px] text-gray-900 outline-none placeholder:text-gray-500 focus:border-yellow-300 focus:bg-white"
          />
        )}
        {/* 군부대를 골랐을 때만 — 부대 일정 프리셋 */}
        {military && (
          <div className="mt-[16px] flex items-center gap-6 rounded-card bg-gray-100 px-5 py-4">
            <div>
              <p className="text-[15px] font-semibold text-gray-900">{s.area.military.label}</p>
              <p className="mt-0.5 text-[13px] text-gray-500">{s.area.military.description}</p>
            </div>
            <div className="ml-auto flex gap-2">
              {s.area.military.presets.map((p) => (
                <Chip
                  key={p}
                  on={form.military.includes(p)}
                  onClick={() => set('military', (prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))}
                >
                  {p}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </Question>

      <Question no={2} title={s.staff.title} description={s.staff.description} className="mt-[68px]">
        <p className="mt-[31px] text-[15px] font-semibold text-gray-900">
          {s.staff.countLabel}
          <span className="ml-[10px] font-num">{staff.length}명</span>
        </p>
        {staff.length > 0 && (
          <>
            <div className="mt-[14px] grid grid-cols-[130px_250px_1fr_150px_24px] gap-4 border-b border-gray-300 pb-2 text-[13px] text-gray-500">
              {s.staff.columns.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <ul>
              {staff.map((m, i) => (
                <StaffRow
                  key={m.id}
                  staff={m}
                  onChange={(v) => updateStaff(i, v)}
                  onRemove={() => setStaff(staff.filter((_, j) => j !== i))}
                />
              ))}
            </ul>
          </>
        )}
        <button
          type="button"
          onClick={addStaff}
          className="mt-[14px] flex h-[47px] w-full items-center justify-center gap-[7px] rounded-input border border-dashed border-gray-300 text-[15px] text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          <Plus size={16} strokeWidth={1.75} />
          {s.staff.addLabel}
        </button>

        <p className="mt-[28px] text-[15px] text-gray-900">{s.staff.managerQuestion}</p>
        <div className="mt-[14px] flex gap-[13px]">
          {s.staff.managerOptions.map((o) => (
            <Chip key={o} on={form.manager === o} onClick={() => set('manager', o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Question>

      <Question no={3} title={s.seat.title} description={s.seat.description} className="mt-[70px]">
        <div className="mt-[24px] flex gap-[13px]">
          {s.seat.options.map((o) => (
            <Chip key={o} on={form.seat === o} onClick={() => set('seat', o)}>
              {o}
            </Chip>
          ))}
        </div>
      </Question>

      <div className="mt-[72px] flex justify-center">
        <PrimaryButton
          onClick={() => {
            toast.show(s.doneToast)
            navigate('/onboarding/5')
          }}
        >
          {s.cta}
        </PrimaryButton>
      </div>
    </div>
  )
}
