import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Checkbox from '../../components/ui/Checkbox'
import Dropdown from '../../components/ui/Dropdown'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/onboarding.json'
import { useOnboarding } from './OnboardingContext'
import { FieldLabel, PreOwnerLink, PrimaryButton, StepTitle, TextInput } from './parts'
import PosLoadingModal from './PosLoadingModal'

const s = data.step1

/** 1단계 — POS 자동 연동 (본인인증은 끝난 상태, POS 키는 아무 값이나 통과) → 연동하기 → POS 연결 로딩 → 2단계 */
export default function Step1Pos() {
  const navigate = useNavigate()
  const toast = useToast()
  const { form, set } = useOnboarding()
  const [phoneOpen, setPhoneOpen] = useState(false)
  const [posOpen, setPosOpen] = useState(true)
  // 연동하기 → POS 연결 로딩 (약 3초) → 끝나면 2단계로
  const [loading, setLoading] = useState(false)
  const done = useCallback(() => {
    setLoading(false)
    navigate('/onboarding/2')
  }, [navigate])
  const ready = form.posKey.trim() !== '' && s.consents.every((c) => !c.required || form.consents[c.id])

  return (
    <div className="ml-[158px] w-[694px] pt-[148px]">
      <StepTitle title={s.title} description={s.description} />

      <button type="button" onClick={() => setPhoneOpen((o) => !o)} className="mt-[49px] flex items-center gap-[9px]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
          <Check size={11} strokeWidth={3} className="text-white" />
        </span>
        <span className="text-[17px] font-semibold text-gray-700">{s.phone.label}</span>
        {phoneOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
      </button>
      {phoneOpen && <p className="ml-[25px] mt-2 text-[14px] text-gray-600">{s.phone.done}</p>}

      {/* 접기/펼치기는 화살표 아이콘을 눌렀을 때만 */}
      <div className="mt-[42px] flex items-center gap-[9px]">
        <span className="h-4 w-4 rounded-full border-[1.5px] border-yellow-500" />
        <span className="text-[17px] font-semibold text-gray-900">{s.pos.label}</span>
        <button
          type="button"
          onClick={() => setPosOpen((o) => !o)}
          aria-expanded={posOpen}
          aria-label={posOpen ? `${s.pos.label} 접기` : `${s.pos.label} 펼치기`}
          className="-m-1 flex rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          {posOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {posOpen && (
        <>
          <div className="mt-[30px] grid grid-cols-2 gap-[18px]">
            <div>
              <FieldLabel>{s.pos.vendorLabel}</FieldLabel>
              <div className="mt-[11px] [&>div>button]:h-[47px] [&>div>button]:w-full [&>div>button]:justify-between [&>div>button]:rounded-input [&>div>button]:border-transparent [&>div>button]:bg-gray-200 [&>div>button]:px-5 [&>div>button]:text-[15px] [&>div]:w-full">
                <Dropdown
                  options={s.pos.vendors.map((v) => ({ value: v, label: v }))}
                  value={form.vendor}
                  onChange={(v) => set('vendor', v)}
                  ariaLabel={s.pos.vendorLabel}
                />
              </div>
            </div>
            <div>
              <FieldLabel>{s.pos.keyLabel}</FieldLabel>
              <TextInput
                className="mt-[11px]"
                placeholder={s.pos.keyPlaceholder}
                value={form.posKey}
                onChange={(e) => set('posKey', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-[10px] flex justify-end">
            <button
              type="button"
              onClick={() => toast.show(s.pos.keyHelpToast)}
              className="text-[14px] text-gray-700 underline underline-offset-4 hover:text-gray-900"
            >
              {s.pos.keyHelp}
            </button>
          </div>

          <ul className="mt-[27px] flex flex-col gap-[20px] pl-1">
            {s.consents.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <Checkbox
                  checked={form.consents[c.id]}
                  onChange={(v) => set('consents', (prev) => ({ ...prev, [c.id]: v }))}
                  label={c.label}
                />
                <button
                  type="button"
                  onClick={() => set('consents', (prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                  className="text-[14px] text-gray-800"
                >
                  {c.label}
                </button>
                <span className="text-[14px] text-gray-500">{c.tag}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-[63px] flex justify-center">
        <PrimaryButton disabled={!ready} onClick={() => setLoading(true)}>
          {s.cta}
        </PrimaryButton>
      </div>
      <PreOwnerLink className="mt-[34px]" />
      <PosLoadingModal open={loading} onDone={done} />
    </div>
  )
}
