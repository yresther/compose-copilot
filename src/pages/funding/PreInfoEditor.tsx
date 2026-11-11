import { useState, type ReactNode } from 'react'
import Button from '../../components/ui/Button'
import Dropdown from '../../components/ui/Dropdown'
import QuantityStepper from '../../components/ui/QuantityStepper'
import data from '../../data/funding-policy.json'

export type PreInfo = typeof data.infoForm.initial

/** 수집 정보 → 칩 (업종 · 업력 · 지역 · 직원 · 매출) */
export const preInfoChips = (p: PreInfo) => [
  { label: '업종', value: p.industry },
  {
    label: '업력',
    value: p.months >= 12 ? `${Math.floor(p.months / 12)}년 ${p.months % 12 ? `${p.months % 12}개월` : ''}`.trim() : `${p.months}개월`,
  },
  { label: '지역', value: `${p.city} ${p.district}` },
  { label: '직원', value: `${p.staff}명` },
  { label: '매출', value: p.trend },
]

const form = data.infoForm
const REGIONS = form.regions as Record<string, string[]>

/** 알약 선택 버튼 묶음 — 고르면 노란 테두리 */
function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((o) => {
        const on = o === value
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o)}
            className={`h-11 rounded-full border px-5 text-[15px] transition-colors ${
              on ? 'border-yellow-500 bg-yellow-50 font-semibold text-gray-900' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex border-b border-gray-200 py-6 last:border-b-0">
      <div className="w-[200px] shrink-0 pt-2.5">
        <p className="text-[16px] font-semibold text-gray-900">{label}</p>
        {hint && <p className="mt-1 text-[13px] text-gray-500">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

type Props = { value: PreInfo; onSave: (v: PreInfo) => void; onCancel: () => void }

/** 사전 정보(이미 수집된 정보) 수정 화면 — 저장하면 설문·결과의 칩과 매칭에 반영 */
export default function PreInfoEditor({ value, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<PreInfo>(value)
  const set = <K extends keyof PreInfo>(k: K, v: PreInfo[K]) => setDraft((d) => ({ ...d, [k]: v }))
  const changed = JSON.stringify(draft) !== JSON.stringify(value)

  return (
    <section className="mt-[50px] rounded-card bg-white px-10 pb-10 pt-9">
      <h2 className="text-[20px] font-bold text-gray-900">이미 수집된 정보</h2>
      <p className="mt-2 text-[15px] text-gray-600">{form.description}</p>

      <div className="mt-6 border-t border-gray-200">
        <Row label="업종">
          <PillGroup options={form.industries} value={draft.industry} onChange={(v) => set('industry', v)} />
        </Row>
        <Row label="업력" hint="개업 후 지난 기간">
          <div className="flex h-11 items-center gap-2">
            <QuantityStepper value={draft.months} min={0} onChange={(v) => set('months', v)} />
            <span className="text-[15px] text-gray-700">개월</span>
          </div>
        </Row>
        <Row label="지역">
          <div className="flex gap-3">
            <Dropdown
              options={Object.keys(REGIONS).map((c) => ({ value: c, label: c }))}
              value={draft.city}
              onChange={(c) => setDraft((d) => ({ ...d, city: c, district: REGIONS[c][0] }))}
              ariaLabel="시 · 도"
            />
            <Dropdown
              options={REGIONS[draft.city].map((g) => ({ value: g, label: g }))}
              value={draft.district}
              onChange={(g) => set('district', g)}
              ariaLabel="구 · 시"
            />
          </div>
        </Row>
        <Row label="직원 수" hint="대표자 제외">
          <div className="flex h-11 items-center gap-2">
            <QuantityStepper value={draft.staff} min={0} onChange={(v) => set('staff', v)} />
            <span className="text-[15px] text-gray-700">명</span>
          </div>
        </Row>
        <Row label="매출 추이" hint="POS 매출 기준">
          <PillGroup options={form.trends} value={draft.trend} onChange={(v) => set('trend', v)} />
        </Row>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Button variant="outline" size="lg" className="w-[150px]" onClick={onCancel}>
          취소
        </Button>
        <Button size="lg" className="w-[176px]" disabled={!changed} onClick={() => onSave(draft)}>
          저장하기
        </Button>
      </div>
    </section>
  )
}
