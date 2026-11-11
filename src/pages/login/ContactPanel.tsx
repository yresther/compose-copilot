import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Checkbox from '../../components/ui/Checkbox'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/auth.json'
import { kstNow } from '../../lib/kst'
import { AuthInput, BackToLogin, DoneMark, Field, InfoBox, PanelTitle, PrimaryWide } from './authParts'

const c = data.contact

/** 오늘 날짜(KST)로 만든 접수번호 — CS-YYYYMMDD-0142 */
const ticketNo = () => {
  const p = kstNow()
  return `${c.ticketPrefix}${p.y}${String(p.m).padStart(2, '0')}${String(p.d).padStart(2, '0')}${c.ticketSuffix}`
}

/** 문의하기 — 유형 칩 · 이름 · 연락처 · 내용 · 동의 → 접수 완료 */
export default function ContactPanel() {
  const navigate = useNavigate()
  const toast = useToast()
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [reply, setReply] = useState('')
  const [body, setBody] = useState('')
  const [agree, setAgree] = useState(false)
  const [done, setDone] = useState(false)
  const ready = type !== '' && name.trim() !== '' && reply.trim() !== '' && body.trim() !== '' && agree

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!ready) return
    setDone(true)
    toast.show(c.doneTitle)
  }

  const help = (
    <dl className="mt-[28px] flex flex-col gap-2 border-t border-gray-200 pt-[20px] text-[13px]">
      {c.help.map((h) => (
        <div key={h.label} className="flex gap-3">
          <dt className="w-[92px] shrink-0 text-gray-500">{h.label}</dt>
          <dd className="text-gray-800">{h.value}</dd>
        </div>
      ))}
    </dl>
  )

  if (done)
    return (
      <div className="w-[520px] animate-auth-in">
        <div className="flex flex-col items-center text-center">
          <DoneMark />
          <h1 className="mt-[24px] text-[26px] font-bold leading-[38px] text-gray-900">{c.doneTitle}</h1>
          <p className="mt-[10px] whitespace-pre-line text-[16px] leading-[25px] text-gray-600">{c.doneSubtitle}</p>
        </div>
        <div className="mt-[36px]">
          <InfoBox
            rows={[
              { label: c.doneTicket, value: ticketNo() },
              { label: c.typeLabel, value: type },
              { label: c.replyLabel, value: reply.trim() },
            ]}
          />
        </div>
        <PrimaryWide type="button" onClick={() => navigate('/login')} className="mt-[40px]">
          {c.toLogin}
        </PrimaryWide>
        {help}
      </div>
    )

  return (
    <form onSubmit={submit} noValidate className="w-[520px]">
      <BackToLogin />
      <PanelTitle title={c.title} subtitle={c.subtitle} className="mt-[26px]" />

      <Field label={c.typeLabel} className="mt-[32px]">
        {/* 정책자금 사전정보와 같은 알약 칩 (조금 낮게) */}
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={c.typeLabel}>
          {c.types.map((t) => {
            const on = t === type
            return (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setType(t)}
                className={`h-[38px] rounded-full border px-4 text-[14px] transition-colors ${
                  on
                    ? 'border-yellow-500 bg-yellow-50 font-semibold text-gray-900'
                    : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="mt-[24px] flex gap-3">
        <Field label={c.nameLabel} className="w-[190px] shrink-0">
          <AuthInput placeholder={c.namePlaceholder} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={c.replyLabel} className="flex-1">
          <AuthInput placeholder={c.replyPlaceholder} value={reply} onChange={(e) => setReply(e.target.value)} />
        </Field>
      </div>

      <Field label={c.bodyLabel} className="mt-[24px]">
        <span className="relative block">
          <textarea
            value={body}
            maxLength={c.maxLength}
            placeholder={c.bodyPlaceholder}
            onChange={(e) => setBody(e.target.value)}
            className="block h-[150px] w-full resize-none rounded-input border border-transparent bg-gray-200 px-5 pb-8 pt-[14px] text-[14px] leading-[22px] text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-yellow-300 focus:bg-white"
          />
          <span className="pointer-events-none absolute bottom-3 right-4 font-num text-[12px] text-gray-400">
            {body.length}/{c.maxLength}
          </span>
        </span>
      </Field>

      <label className="mt-[18px] flex cursor-pointer items-center gap-[13px] text-[14px] text-gray-700">
        <Checkbox size="sm" checked={agree} onChange={setAgree} label={c.agree} />
        <span onClick={() => setAgree((v) => !v)}>
          <span className="text-yellow-700">[{data.signup.terms.requiredTag}]</span> {c.agree}
        </span>
      </label>

      <PrimaryWide disabled={!ready} className="mt-[36px]">
        {c.submit}
      </PrimaryWide>
      {help}
    </form>
  )
}
