import { Check, ChevronRight } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Checkbox from '../../components/ui/Checkbox'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/auth.json'
import {
  AuthInput,
  BackToLogin,
  DoneMark,
  Field,
  Hint,
  InfoBox,
  NewPasswordFields,
  PanelTitle,
  PhoneVerify,
  PrimaryWide,
  passwordOk,
} from './authParts'

const s = data.signup
type Step = 0 | 1 | 2

/** 가로 단계 표시 — 온보딩 스테퍼처럼 끝낸 단계·지금 단계는 노란 체크 */
function Steps({ step }: { step: Step }) {
  return (
    <ol className="mt-[22px] flex items-center gap-2.5">
      {s.steps.map((label, i) => {
        const on = i <= step
        return (
          <li key={label} className="flex items-center gap-2.5">
            {i > 0 && <span className={`h-px w-[22px] ${i <= step ? 'bg-yellow-500' : 'bg-gray-300'}`} aria-hidden />}
            <span className="flex items-center gap-[7px]" aria-current={i === step ? 'step' : undefined}>
              {on ? (
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-yellow-500">
                  <Check size={11} strokeWidth={3} className="text-white" />
                </span>
              ) : (
                <span className="w-[18px] text-center font-num text-[11px] font-semibold text-gray-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              <span className={`text-[14px] ${i === step ? 'font-semibold text-gray-900' : on ? 'text-gray-700' : 'text-gray-400'}`}>
                {label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** 1단계 — 전체 동의 + 개별 약관 (필수/선택) */
function Terms({ onNext }: { onNext: () => void }) {
  const t = s.terms
  const toast = useToast()
  const [agreed, setAgreed] = useState<Record<string, boolean>>({})
  const all = t.items.every((i) => agreed[i.id])
  const ready = t.items.filter((i) => i.required).every((i) => agreed[i.id])
  const setAll = (v: boolean) => setAgreed(Object.fromEntries(t.items.map((i) => [i.id, v])))

  return (
    <>
      <PanelTitle title={s.title} subtitle={t.subtitle} className="mt-[26px]" />
      <Steps step={0} />

      <label className="mt-[36px] flex cursor-pointer items-center gap-[13px] rounded-[10px] border border-gray-300 px-5 py-[17px] transition-colors hover:bg-gray-100">
        <Checkbox checked={all} onChange={setAll} label={t.all} />
        <span className="flex flex-col" onClick={() => setAll(!all)}>
          <span className="text-[16px] font-semibold text-gray-900">{t.all}</span>
          <span className="mt-0.5 text-[13px] text-gray-500">{t.allHint}</span>
        </span>
      </label>

      <ul className="mt-[18px] flex flex-col gap-[16px] px-5">
        {t.items.map((item) => (
          <li key={item.id} className="flex items-center gap-[13px]">
            <Checkbox
              size="sm"
              checked={!!agreed[item.id]}
              onChange={(v) => setAgreed((a) => ({ ...a, [item.id]: v }))}
              label={item.label}
            />
            <span
              className="flex-1 cursor-pointer text-[14px] text-gray-700"
              onClick={() => setAgreed((a) => ({ ...a, [item.id]: !a[item.id] }))}
            >
              <span className={item.required ? 'text-yellow-700' : 'text-gray-500'}>[{item.required ? t.requiredTag : t.optionalTag}]</span>{' '}
              {item.label}
            </span>
            <button
              type="button"
              onClick={() => toast.show(data.comingSoon)}
              className="flex items-center text-[13px] text-gray-500 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              {t.view}
              <ChevronRight size={14} />
            </button>
          </li>
        ))}
      </ul>

      <PrimaryWide type="button" disabled={!ready} onClick={onNext} className="mt-[48px]">
        {t.next}
      </PrimaryWide>
    </>
  )
}

type Info = { name: string; store: string; id: string }

/** 2단계 — 이름 · 휴대폰 인증 · 가맹점 코드 · 아이디 · 비밀번호 */
function InfoForm({ onDone }: { onDone: (info: Info) => void }) {
  const f = s.info
  const [name, setName] = useState('')
  const [verified, setVerified] = useState(false)
  const [store, setStore] = useState('')
  const [id, setId] = useState('')
  const [idTouched, setIdTouched] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const idOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)
  const ready = name.trim() !== '' && verified && store.trim() !== '' && idOk && passwordOk(pw) && pw === pw2

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (ready) onDone({ name: name.trim(), store: store.trim().toUpperCase(), id })
  }

  return (
    <form onSubmit={submit} noValidate>
      <PanelTitle title={s.title} subtitle={f.subtitle} className="mt-[26px]" />
      <Steps step={1} />

      {/* 넓은 패널: 이름 · 가맹점 코드를 한 줄에 */}
      <div className="mt-[32px] flex gap-3">
        <Field label={f.nameLabel} className="w-[190px] shrink-0">
          <AuthInput placeholder={f.namePlaceholder} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={f.storeLabel} className="flex-1">
          <AuthInput placeholder={f.storePlaceholder} value={store} onChange={(e) => setStore(e.target.value)} />
          <Hint>{f.storeHint}</Hint>
        </Field>
      </div>
      <PhoneVerify verified={verified} onVerified={setVerified} />
      <Field label={f.idLabel} className="mt-[26px]">
        <AuthInput
          type="email"
          placeholder={f.idPlaceholder}
          value={id}
          autoComplete="username"
          invalid={idTouched && id !== '' && !idOk}
          onChange={(e) => setId(e.target.value.trim())}
          onBlur={() => setIdTouched(true)}
        />
        {idTouched && id !== '' && !idOk && <Hint tone="danger">{f.idError}</Hint>}
      </Field>
      <NewPasswordFields label={f.pwLabel} placeholder={f.pwPlaceholder} pw={pw} pw2={pw2} onPw={setPw} onPw2={setPw2} />

      <PrimaryWide disabled={!ready} className="mt-[40px]">
        {f.submit}
      </PrimaryWide>
    </form>
  )
}

/** 3단계 — 가입 완료 → 온보딩 1단계 */
function Done({ info }: { info: Info }) {
  const d = s.done
  const navigate = useNavigate()
  return (
    <>
      <Steps step={2} />
      <div className="mt-[56px] flex flex-col items-center text-center">
        <DoneMark />
        <h1 className="mt-[24px] text-[26px] font-bold leading-[38px] text-gray-900">{d.title.replace('{{name}}', info.name)}</h1>
        <p className="mt-[10px] whitespace-pre-line text-[16px] leading-[25px] text-gray-600">{d.subtitle}</p>
      </div>
      <div className="mt-[36px]">
        <InfoBox rows={d.summary.map((r) => ({ label: r.label, value: info[r.key as keyof Info] }))} />
      </div>
      <PrimaryWide type="button" onClick={() => navigate('/onboarding/1')} className="mt-[40px]">
        {d.cta}
      </PrimaryWide>
    </>
  )
}

/** 회원가입 — 약관 동의 → 정보 입력 → 가입 완료 */
export default function SignupPanel() {
  const toast = useToast()
  const [step, setStep] = useState<Step>(0)
  const [info, setInfo] = useState<Info | null>(null)

  return (
    <div className="w-[520px]">
      {step < 2 && <BackToLogin />}
      <div key={step} className="animate-auth-in">
        {step === 0 && <Terms onNext={() => setStep(1)} />}
        {step === 1 && (
          <InfoForm
            onDone={(i) => {
              setInfo(i)
              setStep(2)
              toast.show(s.done.toast)
            }}
          />
        )}
        {step === 2 && info && <Done info={info} />}
      </div>
    </div>
  )
}
