import { Check, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/auth.json'
import { TextInput } from '../onboarding/parts'

/**
 * 로그인 화면 오른쪽 패널의 공통 조각 — 회원가입 · 아이디/비밀번호 찾기 · 문의하기
 * 로그인 폼과 같은 398px 폭, 14px 라벨, 48px 회색 입력칸, 갈색 큰 버튼을 그대로 씀
 */

/** 왼쪽 위 뒤로가기 화살표 — 로그인으로 */
export function BackToLogin() {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate('/login')}
      aria-label={data.back}
      className="-ml-[7px] flex h-8 w-8 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      <ChevronLeft size={24} strokeWidth={1.75} />
    </button>
  )
}

export function PanelTitle({ title, subtitle, className = '' }: { title: string; subtitle?: string; className?: string }) {
  return (
    <header className={className}>
      <h1 className="text-[28px] font-bold leading-[40px] text-gray-900">{title}</h1>
      {subtitle && <p className="mt-[7px] whitespace-pre-line text-[16px] leading-[24px] text-gray-600">{subtitle}</p>}
    </header>
  )
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`block ${className}`}>
      <span className="text-[14px] font-semibold text-gray-800">{label}</span>
      <div className="mt-[9px]">{children}</div>
    </div>
  )
}

export function Hint({ tone = 'gray', children }: { tone?: 'gray' | 'danger' | 'success'; children: ReactNode }) {
  const color = tone === 'danger' ? 'text-danger' : tone === 'success' ? 'text-success' : 'text-gray-500'
  return <p className={`mt-1.5 text-[13px] ${color}`}>{children}</p>
}

/** 로그인 폼과 같은 48px 입력칸 */
export function AuthInput({ invalid, className = '', ...rest }: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <TextInput
      {...rest}
      aria-invalid={invalid || undefined}
      className={`h-[48px] text-[14px] ${invalid ? 'border-danger focus:border-danger' : ''} ${className}`}
    />
  )
}

/** 눈 아이콘으로 보기/숨기기 되는 비밀번호 칸 */
export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative block">
      <AuthInput {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <button
        type="button"
        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={show}
        onClick={() => setShow((v) => !v)}
        className="absolute right-[18px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
      >
        {show ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
      </button>
    </span>
  )
}

/** 비밀번호 규칙 — 맞으면 노란 체크로 바뀜 */
export const passwordChecks = (pw: string) => [/[a-zA-Z]/.test(pw), /\d/.test(pw), pw.length >= 8]
export const passwordOk = (pw: string) => passwordChecks(pw).every(Boolean)

export function PasswordRules({ value }: { value: string }) {
  const checks = passwordChecks(value)
  return (
    <p className="mt-2 flex gap-3.5 text-[13px]">
      {data.password.rules.map((r, i) => (
        <span key={r} className={`flex items-center gap-1 transition-colors ${checks[i] ? 'text-yellow-700' : 'text-gray-400'}`}>
          <Check size={13} strokeWidth={2.5} />
          {r}
        </span>
      ))}
    </p>
  )
}

/** 비밀번호 + 비밀번호 확인 묶음 */
export function NewPasswordFields({
  label,
  placeholder,
  pw,
  pw2,
  onPw,
  onPw2,
}: {
  label: string
  placeholder: string
  pw: string
  pw2: string
  onPw: (v: string) => void
  onPw2: (v: string) => void
}) {
  const p = data.password
  const same = pw2 !== '' && pw === pw2
  // 넓은 패널: 비밀번호 · 확인 칸을 나란히, 규칙은 왼쪽 아래 / 일치 여부는 오른쪽 아래
  return (
    <Field label={label} className="mt-[26px]">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <PasswordInput placeholder={placeholder} value={pw} autoComplete="new-password" onChange={(e) => onPw(e.target.value)} />
          <PasswordRules value={pw} />
        </div>
        <div>
          <PasswordInput
            placeholder={p.confirmPlaceholder}
            value={pw2}
            autoComplete="new-password"
            invalid={pw2 !== '' && !same}
            onChange={(e) => onPw2(e.target.value)}
          />
          {pw2 !== '' && <Hint tone={same ? 'success' : 'danger'}>{same ? p.match : p.mismatch}</Hint>}
        </div>
      </div>
    </Field>
  )
}

const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length < 4) return d
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`
}
const LIMIT = 180 // 인증 시간 3분

/**
 * 휴대폰 본인인증 — '인증번호 받기' → 3:00 타이머 → 6자리 숫자면 통과 (데모)
 * 인증이 끝나면 번호·인증번호 칸이 잠기고 초록 안내
 */
export function PhoneVerify({ verified, onVerified }: { verified: boolean; onVerified: (v: boolean) => void }) {
  const v = data.verify
  const toast = useToast()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [left, setLeft] = useState<number | null>(null) // 남은 초, null이면 아직 안 보냄
  const [error, setError] = useState('')
  const phoneOk = /^010-\d{4}-\d{4}$/.test(phone)

  useEffect(() => {
    if (left === null || left <= 0 || verified) return
    const t = setTimeout(() => setLeft((s) => (s === null ? s : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [left, verified])

  const send = () => {
    if (!phoneOk) return setError(v.phoneError)
    setError('')
    setCode('')
    setLeft(LIMIT)
    toast.show(v.sent)
  }
  const confirm = () => {
    if (left === 0) return setError(v.expired)
    if (!/^\d{6}$/.test(code)) return
    setError('')
    onVerified(true)
  }
  const mmss = left === null ? '' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`

  return (
    <Field label={v.phoneLabel} className="mt-[26px]">
      <div className="flex gap-2">
        <AuthInput
          inputMode="numeric"
          placeholder={v.phonePlaceholder}
          value={phone}
          disabled={verified}
          invalid={error === v.phoneError}
          onChange={(e) => {
            setPhone(formatPhone(e.target.value))
            setError('')
          }}
          className="disabled:text-gray-500"
        />
        <OutlineButton onClick={send} disabled={verified || phone === ''} className="w-[120px] shrink-0">
          {left === null ? v.send : v.resend}
        </OutlineButton>
      </div>
      {left !== null && !verified && (
        <div className="mt-[10px] flex gap-2">
          <span className="relative block flex-1">
            <AuthInput
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={v.codePlaceholder}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), confirm())}
              className="pr-16"
            />
            <span className="absolute right-[18px] top-1/2 -translate-y-1/2 font-num text-[13px] text-danger">{mmss}</span>
          </span>
          <OutlineButton onClick={confirm} disabled={code.length !== 6} className="w-[120px] shrink-0">
            {v.confirm}
          </OutlineButton>
        </div>
      )}
      {error && <Hint tone="danger">{error}</Hint>}
      {verified && (
        <p className="mt-1.5 flex items-center gap-1 text-[13px] text-success">
          <Check size={14} strokeWidth={2.5} />
          {v.verified}
        </p>
      )}
    </Field>
  )
}

/** 로그인 버튼과 같은 갈색 큰 버튼 */
export function PrimaryWide({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      {...rest}
      className={`h-[48px] w-full rounded-[10px] bg-brown-900 text-[16px] font-medium text-white transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:bg-gray-300 ${className}`}
    />
  )
}

/** 회원가입 버튼과 같은 테두리 버튼 */
export function OutlineButton({ className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={`h-[48px] rounded-[10px] border border-gray-400 bg-white text-[15px] text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white ${className}`}
    />
  )
}

/** 완료 화면 위의 노란 원 체크 */
export function DoneMark() {
  return (
    <span className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-yellow-500 animate-pop-in">
      <Check size={28} strokeWidth={2.5} className="text-white" />
    </span>
  )
}

/** 회색 요약 상자 (아이디 찾기 결과 · 가입 정보 · 접수번호) */
export function InfoBox({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="rounded-[10px] bg-gray-200 px-5 py-[18px]">
      {rows.map((r, i) => (
        <div key={r.label} className={`flex items-center justify-between text-[14px] ${i > 0 ? 'mt-2.5' : ''}`}>
          <dt className="text-gray-500">{r.label}</dt>
          <dd className="font-medium text-gray-900">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
