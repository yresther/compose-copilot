import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AiSparkleIcon from '../../components/icons/AiSparkleIcon'
import data from '../../data/onboarding.json'
import { useOnboarding } from './OnboardingContext'
import { FieldLabel, PreOwnerLink, PrimaryButton, StepTitle, TextInput } from './parts'

const s = data.step2

/** 사업자 등록번호 — 숫자만, 000-00000-000 모양으로 */
const formatBiz = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10)
  return [d.slice(0, 3), d.slice(3, 8), d.slice(8)].filter(Boolean).join('-')
}

/** 2단계 — 매장 정보 확인 (매장은 POS로 자동으로 찾아 둠, 사업자 정보는 아무 값이나 통과) → 3단계 */
export default function Step2Store() {
  const navigate = useNavigate()
  const { form, set } = useOnboarding()
  const ready = form.bizNumber.trim() !== '' && form.owner.trim() !== ''

  return (
    <div className="ml-[160px] w-[692px] pt-[218px]">
      <StepTitle title={s.title} description={s.description} />

      <div className="relative mt-[58px]">
        <FieldLabel>{s.searchLabel}</FieldLabel>
        {/* 매장 칸에 마우스를 올리면 — POS로 자동으로 찾은 매장 말풍선 (꼬리는 아래 왼쪽) */}
        <div className="group relative mt-[7px]">
          <TextInput value={s.store} readOnly className="pr-12" aria-label={s.searchLabel} />
          <Search size={20} strokeWidth={1.5} className="absolute right-[18px] top-1/2 -translate-y-1/2 text-gray-500" />
          <p
            role="tooltip"
            className="pointer-events-none absolute bottom-[calc(100%-1px)] left-[70px] z-10 flex h-[41px] translate-y-1 items-center gap-[10px] whitespace-nowrap rounded-[10px] bg-white px-[17px] text-[14px] font-semibold text-gray-900 opacity-0 shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <AiSparkleIcon size={15} className="text-yellow-700" />
            {s.found}
            <span className="absolute -bottom-[5px] left-[28px] h-[10px] w-[10px] rotate-45 rounded-[2px] bg-white" aria-hidden />
          </p>
        </div>
      </div>

      <div className="mt-[20px] grid grid-cols-2 gap-[22px]">
        <div>
          <FieldLabel>{s.bizLabel}</FieldLabel>
          <TextInput
            className="mt-[11px] font-num"
            inputMode="numeric"
            placeholder={s.bizPlaceholder}
            value={form.bizNumber}
            onChange={(e) => set('bizNumber', formatBiz(e.target.value))}
          />
        </div>
        <div>
          <FieldLabel>{s.ownerLabel}</FieldLabel>
          <TextInput
            className="mt-[11px]"
            placeholder={s.ownerPlaceholder}
            value={form.owner}
            onChange={(e) => set('owner', e.target.value)}
          />
        </div>
      </div>

      <div className="mt-[60px] flex justify-center">
        <PrimaryButton disabled={!ready} onClick={() => navigate('/onboarding/3')}>
          {s.cta}
        </PrimaryButton>
      </div>
      <PreOwnerLink className="mt-[37px] translate-x-[4px]" />
    </div>
  )
}
