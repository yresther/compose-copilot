import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import lock from '../../assets/icons/lock.svg'
import people from '../../assets/icons/people.svg'
import data from '../../data/auth.json'
import {
  AuthInput,
  BackToLogin,
  DoneMark,
  Field,
  InfoBox,
  NewPasswordFields,
  OutlineButton,
  PanelTitle,
  PhoneVerify,
  PrimaryWide,
  passwordOk,
} from './authParts'

const f = data.find
type Tab = 'id' | 'pw'

/** 아이디 찾기 — 이름 + 휴대폰 인증 → 일부 가린 아이디 */
function FindId({ onGoPw }: { onGoPw: () => void }) {
  const t = f.id
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [verified, setVerified] = useState(false)
  const [found, setFound] = useState(false)

  if (found)
    return (
      <div className="animate-auth-in">
        <div className="mt-[44px] flex flex-col items-center text-center">
          <DoneMark />
          <h2 className="mt-[22px] text-[22px] font-bold text-gray-900">{t.resultTitle}</h2>
          <p className="mt-[8px] text-[15px] text-gray-600">{t.resultSubtitle}</p>
        </div>
        <div className="mt-[30px]">
          <InfoBox
            rows={[
              { label: f.id.nameLabel, value: name.trim() },
              { label: data.signup.info.idLabel, value: t.resultId },
            ]}
          />
          <p className="mt-2 text-right text-[13px] text-gray-500">{t.resultDate}</p>
        </div>
        <PrimaryWide type="button" onClick={() => navigate('/login')} className="mt-[36px]">
          {t.toLogin}
        </PrimaryWide>
        <OutlineButton onClick={onGoPw} className="mt-[14px] w-full text-[16px]">
          {t.toPw}
        </OutlineButton>
      </div>
    )

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (name.trim() && verified) setFound(true)
  }
  return (
    <form onSubmit={submit} noValidate className="animate-auth-in">
      <Field label={t.nameLabel} className="mt-[30px]">
        <AuthInput placeholder={t.namePlaceholder} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
      </Field>
      <PhoneVerify verified={verified} onVerified={setVerified} />
      <PrimaryWide disabled={!name.trim() || !verified} className="mt-[44px]">
        {t.submit}
      </PrimaryWide>
    </form>
  )
}

/** 비밀번호 찾기 — 아이디 + 휴대폰 인증 → 새 비밀번호 → 완료 */
function FindPw() {
  const t = f.pw
  const navigate = useNavigate()
  const toast = useToast()
  const [stage, setStage] = useState<'verify' | 'reset' | 'done'>('verify')
  const [id, setId] = useState('')
  const [verified, setVerified] = useState(false)
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')

  if (stage === 'done')
    return (
      <div className="animate-auth-in">
        <div className="mt-[56px] flex flex-col items-center text-center">
          <DoneMark />
          <h2 className="mt-[22px] text-[22px] font-bold text-gray-900">{t.doneTitle}</h2>
          <p className="mt-[8px] text-[15px] text-gray-600">{t.doneSubtitle}</p>
        </div>
        <PrimaryWide type="button" onClick={() => navigate('/login')} className="mt-[48px]">
          {t.toLogin}
        </PrimaryWide>
      </div>
    )

  if (stage === 'reset')
    return (
      <form
        noValidate
        className="animate-auth-in"
        onSubmit={(e) => {
          e.preventDefault()
          if (!passwordOk(pw) || pw !== pw2) return
          setStage('done')
          toast.show(t.doneTitle)
        }}
      >
        <h2 className="mt-[28px] text-[20px] font-bold text-gray-900">{t.resetTitle}</h2>
        <p className="mt-[6px] text-[15px] text-gray-600">{t.resetSubtitle}</p>
        <div className="-mt-[4px]">
          <NewPasswordFields label={t.pwLabel} placeholder={t.pwPlaceholder} pw={pw} pw2={pw2} onPw={setPw} onPw2={setPw2} />
        </div>
        <PrimaryWide disabled={!passwordOk(pw) || pw !== pw2} className="mt-[44px]">
          {t.submit}
        </PrimaryWide>
      </form>
    )

  return (
    <form
      noValidate
      className="animate-auth-in"
      onSubmit={(e) => {
        e.preventDefault()
        if (id.trim() && verified) setStage('reset')
      }}
    >
      <Field label={t.idLabel} className="mt-[30px]">
        <AuthInput
          type="email"
          placeholder={t.idPlaceholder}
          value={id}
          autoComplete="username"
          onChange={(e) => setId(e.target.value.trim())}
        />
      </Field>
      <PhoneVerify verified={verified} onVerified={setVerified} />
      <PrimaryWide disabled={!id.trim() || !verified} className="mt-[44px]">
        {t.next}
      </PrimaryWide>
    </form>
  )
}

/** 아이디 · 비밀번호 찾기 — 선택 카드로 전환 (?tab=id|pw) */
export default function FindPanel() {
  const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'pw' ? 'pw' : 'id'
  const go = (t: Tab) => setParams({ tab: t }, { replace: true })

  return (
    <div className="w-[520px]">
      <BackToLogin />
      <PanelTitle title={f.title} className="mt-[26px]" />
      {/* 위쪽 탭 대신 두 개의 선택 카드 — 고른 카드는 노란 테두리 · 연노랑 배경 (정책자금 칩과 같은 선택 스타일) */}
      <div role="radiogroup" aria-label={f.title} className="mt-[28px] grid grid-cols-2 gap-3">
        {(
          [
            ['id', people, f.cardDesc.id],
            ['pw', lock, f.cardDesc.pw],
          ] as const
        ).map(([t, icon, desc]) => {
          const on = tab === t
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => go(t)}
              className={`flex flex-col items-start rounded-[12px] border px-5 pb-[17px] pt-[20px] text-left transition-colors ${
                on ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 bg-white hover:bg-gray-100'
              }`}
            >
              <span className={`flex h-[38px] w-[38px] items-center justify-center rounded-full ${on ? 'bg-white' : 'bg-gray-200'}`}>
                <img src={icon} alt="" aria-hidden className="h-[20px] w-[20px]" />
              </span>
              <span className={`mt-[12px] text-[16px] ${on ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                {f.tabs[t]}
              </span>
              <span className="mt-[3px] whitespace-pre-line text-[13px] leading-[19px] text-gray-500">{desc}</span>
            </button>
          )
        })}
      </div>
      {/* 카드를 바꾸면 입력·인증을 처음부터 */}
      {tab === 'id' ? <FindId key="id" onGoPw={() => go('pw')} /> : <FindPw key="pw" />}
    </div>
  )
}
