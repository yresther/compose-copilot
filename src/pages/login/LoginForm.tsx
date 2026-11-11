import { Eye, EyeOff } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Checkbox from '../../components/ui/Checkbox'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/login.json'
import { TextInput } from '../onboarding/parts'

const f = data.form

/** 로그인 폼 — 실제 인증 없이 아이디·비밀번호가 있으면 온보딩으로 */
export default function LoginForm({ itemStyle }: { itemStyle: (i: number) => CSSProperties }) {
  const navigate = useNavigate()
  const toast = useToast()
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [auto, setAuto] = useState(false)
  const [errors, setErrors] = useState<{ id?: string; pw?: string }>({})
  const ready = id.trim() !== '' && pw.trim() !== ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const next = { id: id.trim() ? undefined : f.idError, pw: pw.trim() ? undefined : f.pwError }
    setErrors(next)
    if (next.id || next.pw) return
    toast.show(f.welcome)
    navigate('/onboarding/1')
  }
  const errorInput = 'border-danger focus:border-danger'

  return (
    <form onSubmit={submit} noValidate className="w-[398px]">
      <div style={itemStyle(0)} className="text-center">
        <h1 className="text-[28px] font-bold leading-[40px] text-gray-900">{f.title}</h1>
        <p className="mt-[7px] text-[18px] leading-[27px] text-gray-600">{f.subtitle}</p>
      </div>

      <div style={itemStyle(1)}>
        <label className="mt-[49px] block">
          <span className="text-[14px] font-semibold text-gray-800">{f.idLabel}</span>
          <TextInput
            className={`mt-[9px] h-[48px] text-[14px] ${errors.id ? errorInput : ''}`}
            placeholder={f.idPlaceholder}
            value={id}
            autoComplete="username"
            aria-invalid={Boolean(errors.id)}
            onChange={(e) => {
              setId(e.target.value)
              setErrors((x) => ({ ...x, id: undefined }))
            }}
          />
          {errors.id && <span className="mt-1.5 block text-[13px] text-danger">{errors.id}</span>}
        </label>

        <label className="mt-[34px] block">
          <span className="text-[14px] font-semibold text-gray-800">{f.pwLabel}</span>
          <span className="relative mt-[9px] block">
            <TextInput
              className={`h-[48px] pr-12 text-[14px] ${errors.pw ? errorInput : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder={f.pwPlaceholder}
              value={pw}
              autoComplete="current-password"
              aria-invalid={Boolean(errors.pw)}
              onChange={(e) => {
                setPw(e.target.value)
                setErrors((x) => ({ ...x, pw: undefined }))
              }}
            />
            <button
              type="button"
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-pressed={showPw}
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-[18px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPw ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
            </button>
          </span>
          {errors.pw && <span className="mt-1.5 block text-[13px] text-danger">{errors.pw}</span>}
        </label>

        <div className="mt-[16px] flex items-center">
          <label className="flex cursor-pointer items-center gap-[13px] text-[14px] text-gray-700">
            <Checkbox size="sm" checked={auto} onChange={setAuto} label={f.autoLogin} />
            <span onClick={() => setAuto((v) => !v)}>{f.autoLogin}</span>
          </label>
          <button type="button" onClick={() => navigate('/find?tab=id')} className="ml-auto text-[14px] text-gray-600 hover:text-gray-900">
            {f.find}
          </button>
        </div>
      </div>

      <div style={itemStyle(2)}>
        <button
          type="submit"
          disabled={!ready}
          className="mt-[58px] h-[48px] w-full rounded-[10px] bg-brown-900 text-[16px] font-medium text-white transition hover:bg-brown-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {f.submit}
        </button>
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="mt-[20px] h-[48px] w-full rounded-[10px] border border-gray-400 bg-white text-[16px] text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        >
          {f.signup}
        </button>
      </div>
    </form>
  )
}
