import { useCallback, useEffect, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import bg from '../../assets/illust/login-bg.jpg'
import watermark from '../../assets/illust/watermark.png'
import logoMark from '../../assets/logo-mark.svg'
import logo from '../../assets/logo.svg'
import SkipButton from '../../components/ui/SkipButton'
import data from '../../data/login.json'
import ContactPanel from './ContactPanel'
import FindPanel from './FindPanel'
import LoginForm from './LoginForm'
import SignupPanel from './SignupPanel'

/** 오른쪽 흰 패널에 들어갈 화면 — 왼쪽(매장 사진·문구)은 그대로 두고 패널만 바뀜 */
const PANELS = { '/login': 'login', '/signup': 'signup', '/find': 'find', '/contact': 'contact' } as const
type Panel = (typeof PANELS)[keyof typeof PANELS]

/**
 * 인트로 단계 (시안 login 00 ~ 04)
 * 0 배경·로고만 → 1 첫 줄 올라옴 → 2 COMPOSE · COPILOT 차례로 들어옴 → 3 두 단어가 벌어지고 원형 로고 → 4 왼쪽 패널로 줄어들며 로그인 등장
 */
type Phase = 0 | 1 | 2 | 3 | 4
// 각 단계로 넘어가는 시각(ms, 시작 기준)
const AT: Record<Exclude<Phase, 0>, number> = { 1: 600, 2: 1400, 3: 2150, 4: 3550 }
const OUT_EXPO = 'cubic-bezier(0.22, 1, 0.36, 1)'
// 로그인 상태: 인트로 묶음은 왼쪽 패널(화면의 48.82%) 가운데로 0.654배, 배경은 왼쪽으로 194px
const PANEL_SHIFT = '-25.59vw'
const PANEL_SCALE = 0.654

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
// 이번 페이지 로드에서 인트로를 이미 보여줬는지 — 새로고침하면 다시 처음부터 재생
let introShown = false

/** 앱 첫 화면 — 인트로 애니메이션(첫 진입 1회) + 로그인 */
export default function LoginPage() {
  const navigate = useNavigate()
  const panel: Panel = PANELS[useLocation().pathname as keyof typeof PANELS] ?? 'login'
  // 새로고침 후 첫 진입이면 인트로 재생, 앱 안에서 다시 들어오거나 움직임 줄이기 설정이면 바로 로그인 상태
  const [instant, setInstant] = useState(() => introShown || prefersReducedMotion())
  const [phase, setPhase] = useState<Phase>(() => (instant ? 4 : 0))

  const finish = useCallback(() => {
    introShown = true
  }, [])

  // 자동 재생 — 시작하는 순간 '이번 로드에서 봤음'으로 표시 (앱 안에서 다시 들어오면 바로 로그인 상태)
  useEffect(() => {
    introShown = true
    if (instant) {
      finish()
      return
    }
    const timers = ([1, 2, 3, 4] as const).map((p) => setTimeout(() => setPhase(p), AT[p]))
    const done = setTimeout(finish, AT[4] + 900)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [instant, finish])

  // 재생 중 클릭·키 입력 → 바로 로그인 상태로 건너뛰기
  useEffect(() => {
    if (phase === 4) return
    const skip = () => {
      setInstant(true)
      setPhase(4)
    }
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [phase])

  const tr = (ms: number, ease = OUT_EXPO, delay = 0): CSSProperties =>
    instant ? { transition: 'none' } : { transition: `transform ${ms}ms ${ease} ${delay}ms, opacity ${ms}ms ${ease} ${delay}ms` }
  const login = phase === 4
  const split = phase >= 3

  return (
    <div className="fixed inset-0 overflow-hidden bg-brown-900" aria-label="컴포즈 코파일럿 로그인">
      {/* 배경 — 화면 높이에 맞춘 매장 사진 + 80% 어두운 막 */}
      <img
        src={bg}
        alt=""
        aria-hidden
        className="absolute left-1/2 top-0 h-full w-auto max-w-none will-change-transform"
        style={{ transform: `translateX(calc(-50% + ${login ? -101 : 93}px))`, ...tr(900, 'ease-in-out') }}
      />
      <div className="absolute inset-0 bg-black/80" aria-hidden />

      <img src={logo} alt="COMPOSE COFFEE" className="absolute left-[39px] top-[34px] z-20 w-[161px]" />

      {/* 가운데 문구 묶음 — 로그인 단계에서 왼쪽 패널 가운데로 줄어듦 */}
      <div
        className="absolute left-1/2 top-1/2 z-10 flex flex-col items-center will-change-transform"
        style={{
          transform: login ? `translate(calc(-50% + ${PANEL_SHIFT}), calc(-50% - 3.5px)) scale(${PANEL_SCALE})` : 'translate(-50%, -50%)',
          ...tr(900, 'ease-in-out'),
        }}
      >
        <p
          className="h-[56px] whitespace-nowrap text-[49px] font-bold leading-[56px] tracking-[-0.03em] text-white"
          style={{ transform: `translateY(${phase >= 1 ? 0 : 24}px)`, opacity: phase >= 1 ? 1 : 0, ...tr(800, 'ease-out') }}
        >
          {data.intro.line1}
        </p>
        <div className="mt-[27.5px] flex h-[58px] items-center">
          <span
            className="text-[51px] font-extrabold leading-none tracking-[-0.02em] text-yellow-300"
            style={{
              transform: `translateX(${split ? 0 : phase >= 2 ? 33 : 73}px)`,
              opacity: phase >= 2 ? 1 : 0,
              ...tr(split ? 600 : 500),
            }}
          >
            {data.intro.word1}
          </span>
          <span
            className="mx-[8px] block h-[75px] w-[77px]"
            style={{
              transform: split ? 'scale(1) rotate(0deg)' : 'scale(0.6) rotate(-90deg)',
              opacity: split ? 1 : 0,
              ...tr(600),
            }}
          >
            {/* 로그인 화면이 나온 뒤에는 천천히 계속 회전 */}
            <img src={logoMark} alt="" aria-hidden className={`h-full w-full ${login ? 'animate-logo-spin' : ''}`} />
          </span>
          <span
            className="text-[51px] font-extrabold leading-none tracking-[-0.02em] text-white"
            style={{
              transform: `translateX(${split ? 0 : phase >= 2 ? -33 : 7}px)`,
              opacity: phase >= 2 ? 1 : 0,
              ...tr(split ? 600 : 500, OUT_EXPO, split ? 0 : 180),
            }}
          >
            {data.intro.word2}
          </span>
        </div>
      </div>

      {/* 로그인 패널 — 오른쪽에서 밀려 들어옴 */}
      <section
        className="absolute inset-y-0 right-0 z-10 w-[51.18vw] overflow-hidden bg-white will-change-transform"
        style={{ transform: `translateX(${login ? 0 : 100}%)`, opacity: login ? 1 : 0, ...tr(900, 'ease-in-out') }}
        aria-hidden={!login}
      >
        <img
          src={watermark}
          alt=""
          aria-hidden
          className="pointer-events-none absolute bottom-[652px] right-[-55px] w-[564px] max-w-none"
        />
        {/* 문의하기(패널 아래 고정)를 뺀 묶음을 위아래 여백이 같도록 세로 가운데 정렬, 길면 패널 안에서 스크롤 */}
        <div className="relative h-full overflow-y-auto">
          <div className={`flex min-h-full items-center justify-center ${panel === 'login' ? 'pb-[40px]' : 'pb-[100px] pt-[60px]'}`}>
            <div key={panel} className={panel === 'login' && !instant ? '' : 'animate-auth-in'}>
              {panel === 'login' && (
                <LoginForm
                  itemStyle={(i) => ({
                    transform: `translateY(${login ? 0 : 16}px)`,
                    opacity: login ? 1 : 0,
                    ...tr(500, 'ease-out', 380 + i * 110),
                  })}
                />
              )}
              {panel === 'signup' && <SignupPanel />}
              {panel === 'find' && <FindPanel />}
              {panel === 'contact' && <ContactPanel />}
            </div>
          </div>
        </div>
        {panel === 'login' && (
          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="absolute bottom-[131px] left-1/2 -translate-x-1/2 text-[14px] text-gray-600 underline underline-offset-4 hover:text-gray-900"
          >
            {data.form.contact}
          </button>
        )}
        {(panel === 'login' || panel === 'signup') && <SkipButton label={data.form.skip} to="/onboarding/1" />}
      </section>
    </div>
  )
}
