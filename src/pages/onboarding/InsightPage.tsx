import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import lockIcon from '../../assets/icons/lock.svg'
import cup from '../../assets/illust/cup.png'
import logo from '../../assets/logo.svg'
import { useToast } from '../../components/ui/Toast'
import data from '../../data/onboarding.json'
import { currentMonth, monthExpense, payDayLabel } from '../../lib/expense'
import { useExpense } from '../../state/ExpenseContext'
import { useOnboarding } from './OnboardingContext'

const s = data.insight
const CARD_W = 366
const GAP = 19
const VISIBLE = 3
const manwon = (n: number) => `${Math.round(n / 10000).toLocaleString('ko-KR')}만원`

function Card({ label, title, children, className = '' }: { label: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <article
      className={`relative h-[175px] shrink-0 overflow-hidden rounded-card bg-white px-[19px] pt-[18px] shadow-[0_2px_14px_rgba(0,0,0,0.06)] transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] motion-reduce:transition-none motion-reduce:hover:transform-none ${className}`}
      style={{ width: CARD_W }}
    >
      <p className="text-[13px] font-medium text-gray-900">{label}</p>
      <h3 className="mt-[9px] text-[20px] font-semibold text-gray-900">{title}</h3>
      {children}
    </article>
  )
}

/** 주간 매출 추이 — 4주 선 그래프: 왼쪽은 흐리게 시작해 오른쪽으로 진해지고, 끝은 채운 화살촉 (시안 좌표) */
function TrendCard() {
  const pts = s.trend.line
  const [[x1, y1], [x2, y2]] = pts.slice(-2)
  const a = Math.atan2(y2 - y1, x2 - x1)
  // 화살촉이 선 끝을 덮도록 선은 화살촉 뒤에서 멈춤
  const tip: [number, number] = [x2 + 2 * Math.cos(a), y2 + 2 * Math.sin(a)]
  const at = (len: number, da: number) => `${tip[0] - len * Math.cos(a + da)} ${tip[1] - len * Math.sin(a + da)}`
  const d = `M${pts.map((p) => p.join(' ')).join(' L')}`
  return (
    <Card label={s.trend.label} title={s.trend.title} className="bg-[linear-gradient(160deg,#FFFFFF_50%,#FDF3D6_100%)]">
      <p className="mt-[10px] flex items-center gap-[6px] text-[14px] font-medium text-gray-800">
        <svg width="7" height="6" viewBox="0 0 7 6" aria-hidden>
          <path d="M3.5 0 7 6H0z" fill="#EFB744" />
        </svg>
        {s.trend.badge}
      </p>
      <svg width={CARD_W} height="175" viewBox={`0 0 ${CARD_W} 175`} className="pointer-events-none absolute left-0 top-0" aria-hidden>
        <defs>
          <linearGradient id="trend-line" x1="0" x2={CARD_W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#F2C865" stopOpacity="0.12" />
            <stop offset="0.55" stopColor="#F2C865" stopOpacity="0.6" />
            <stop offset="1" stopColor="#F2C865" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#trend-line)" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
        <path d={`M${tip.join(' ')} L${at(7, 0.5)} L${at(7, -0.5)} Z`} fill="#F2C865" />
      </svg>
    </Card>
  )
}

/** 매장 비중 — 테이크아웃 · 홀 · 배달 도넛 + 가운데 컵 */
function MixCard() {
  const colors = ['#F9B418', '#FFE590', '#E0E0E0']
  const R = 40
  const C = 2 * Math.PI * R
  let acc = 0
  return (
    <Card label={s.mix.label} title={s.mix.title}>
      <ul className="mt-[19px] flex flex-col gap-[5px]">
        {s.mix.items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-[8px] text-[12px] text-gray-700">
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: colors[i] }} />
            {it.name}
            <span className="font-num">{it.pct}%</span>
          </li>
        ))}
      </ul>
      <div className="absolute right-[24px] top-[57px] h-[94px] w-[94px]">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full -rotate-90"
          aria-label={s.mix.items.map((i) => `${i.name} ${i.pct}%`).join(', ')}
        >
          {s.mix.items.map((it, i) => {
            const len = (it.pct / 100) * C
            const el = (
              <circle
                key={it.name}
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke={colors[i]}
                strokeWidth="10"
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-acc}
              />
            )
            acc += len
            return el
          })}
        </svg>
        <img src={cup} alt="" className="absolute left-1/2 top-1/2 h-[38px] -translate-x-1/2 -translate-y-1/2" />
      </div>
    </Card>
  )
}

/** 요일 · 시간대별 피크 — 7일 막대, 가장 한산한 날만 노랑 */
function PeakCard() {
  return (
    <Card label={s.peak.label} title={s.peak.title}>
      <div
        className="mt-[21px] flex h-[44px] items-end gap-[8px]"
        role="img"
        aria-label={`${s.peak.days[s.peak.quietIndex]}요일이 가장 한산해요`}
      >
        {s.peak.heights.map((h, i) => (
          <span
            key={s.peak.days[i]}
            className={`w-[29px] rounded-t-[3px] ${i === s.peak.quietIndex ? 'bg-yellow-300' : 'bg-gray-250'}`}
            style={{ height: h }}
          />
        ))}
      </div>
      <p className="mt-[3px] text-[12px] text-gray-700">{s.peak.note}</p>
    </Card>
  )
}

/** 온보딩 3단계 고정지출로 만든 카드 */
function FixedCard() {
  const { settings } = useExpense()
  const e = monthExpense(currentMonth(), settings)
  const sum = e.fixed.reduce((a, f) => a + f.amount, 0)
  const next = [...e.fixed].filter((f) => f.dueText !== '납부 완료').sort((a, b) => parseInt(a.dueText) - parseInt(b.dueText))[0]
  return (
    <Card label={s.fixed.label} title={`매달 ${manwon(sum)}이 고정으로 나가요`}>
      <ul className="mt-[12px] grid grid-cols-2 gap-x-4 gap-y-[5px]">
        {e.fixed.map((f) => (
          <li key={f.id} className="flex justify-between text-[12px] text-gray-700">
            <span>{f.name}</span>
            <span className="font-num text-gray-900">{manwon(f.amount)}</span>
          </li>
        ))}
      </ul>
      {next && (
        <p className="mt-[12px] text-[12px] text-gray-700">
          다음 납부: <span className="font-semibold text-gray-900">{next.name}</span> · 매월 {payDayLabel(next.payDay)} ({next.dueText})
        </p>
      )}
    </Card>
  )
}

/** 온보딩 4단계 운영인력으로 만든 카드 */
function StaffCard() {
  const { settings } = useExpense()
  const e = monthExpense(currentMonth(), settings)
  const labor = e.variable.find((v) => v.id === 'labor')!
  const [from, to] = e.labor.quiet
  return (
    <Card
      label={s.staff.label}
      title={e.labor.saving > 0 ? `오후 ${from - 12}~${to - 12}시는 1명으로 충분해요` : '지금 인력 배치가 알맞아요'}
    >
      <p className="mt-[12px] text-[13px] text-gray-700">
        이번 달 인건비 <span className="font-num font-semibold text-gray-900">{labor.amount.toLocaleString('ko-KR')}원</span> · 매출의{' '}
        <span className="font-num">{e.labor.rate}%</span>
      </p>
      {e.labor.saving > 0 && (
        <p className="mt-[6px] text-[13px] text-gray-700">
          한산한 시간 1명 운영 시 한 달 약 <span className="font-semibold text-yellow-700">{manwon(e.labor.saving)}</span> 절약
        </p>
      )}
      <p className="absolute bottom-[16px] left-[19px] text-[12px] text-gray-500">
        {s.staff.note} · {settings.staff.length}명
      </p>
    </Card>
  )
}

/** 온보딩 5단계 — 입력한 정보로 만든 첫 인사이트 + 멤버십 안내 */
export default function InsightPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { reach } = useOnboarding()
  const [index, setIndex] = useState(0)
  const cards = [TrendCard, MixCard, PeakCard, FixedCard, StaffCard]
  const maxIndex = cards.length - VISIBLE
  const store = data.step2.store.replace('컴포즈커피 ', '')
  const m = s.membership

  // 여기까지 왔으면 4단계까지 모두 끝낸 것
  useEffect(() => reach(5), [reach])

  const arrow =
    'absolute top-1/2 z-10 flex h-[29px] w-[29px] -translate-y-1/2 items-center justify-center rounded-full bg-gray-400 text-white shadow-float transition hover:bg-gray-500'
  return (
    <div className="pb-24 pl-[103px] pr-[45px] pt-[58px]">
      <img src={logo} alt="COMPOSE COFFEE" className="w-[161px] brightness-0" />

      <h1 className="mt-[44px] text-[26px] font-bold leading-[36px] text-gray-900">
        {s.titleTop}
        <br />
        <span className="text-yellow-700">{store}</span> {s.titleBottom} <span className="font-normal">{s.emoji}</span>
      </h1>
      <p className="mt-[10px] text-[16px] font-medium text-gray-700">{s.description}</p>

      <p className="mt-[36px] flex items-baseline gap-[14px] pl-[5px]">
        <span className="text-[16px] font-semibold text-gray-900">{s.sectionTitle}</span>
        <span className="text-[14px] text-gray-500">{s.sectionBasis}</span>
      </p>
      <div className="relative mt-[16px] w-[1170px]">
        <div className="-mx-4 -my-6 overflow-hidden px-4 py-6" style={{ width: CARD_W * VISIBLE + GAP * (VISIBLE - 1) + 32 }}>
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ gap: GAP, transform: `translateX(-${index * (CARD_W + GAP)}px)` }}
          >
            {cards.map((C, i) => (
              <C key={i} />
            ))}
          </div>
        </div>
        {index > 0 && (
          <button type="button" aria-label="이전 인사이트" onClick={() => setIndex((i) => i - 1)} className={`${arrow} -left-[15px]`}>
            <ChevronLeft size={17} />
          </button>
        )}
        {index < maxIndex && (
          <button type="button" aria-label="다음 인사이트" onClick={() => setIndex((i) => i + 1)} className={`${arrow} left-[1155px]`}>
            <ChevronRight size={17} />
          </button>
        )}
      </div>

      <h2 className="mt-[52px] text-[20px] font-bold text-gray-900">{m.title}</h2>
      <p className="mt-[4px] text-[16px] text-gray-700">{m.description}</p>

      <div className="mt-[26px] grid w-[1172px] grid-cols-2 gap-[26px]">
        <section className="rounded-[16px] border border-gray-300 bg-white px-[33px] pt-[34px]">
          <ul className="flex flex-col gap-[25px]">
            {m.locked.map((f) => (
              <li key={f.title} className="flex items-center gap-[13px]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  {/* 자물쇠 에셋을 진한 회색으로 */}
                  <span
                    className="h-[18px] w-[18px] bg-gray-600"
                    style={{
                      WebkitMask: `url(${JSON.stringify(lockIcon)}) center / contain no-repeat`,
                      mask: `url(${JSON.stringify(lockIcon)}) center / contain no-repeat`,
                    }}
                    aria-hidden
                  />
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-gray-900">{f.title}</p>
                  <p className="mt-[2px] text-[14px] text-gray-600">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col rounded-[16px] border border-gray-300 bg-white px-[31px] pb-[12px] pt-[26px]">
          <p className="text-[14px] text-gray-600">{m.planLabel}</p>
          <p className="mt-[2px] flex items-baseline gap-[7px]">
            <span className="font-num text-[32px] font-extrabold text-gray-900">{m.price.toLocaleString('ko-KR')}원</span>
            <span className="text-[14px] text-gray-500">{m.unit}</span>
          </p>
          <ul className="mt-[16px] grid grid-cols-2 gap-x-[30px] gap-y-[13px]">
            {m.benefits.map((b) => (
              <li key={b} className="flex items-center gap-[14px] text-[15px] font-medium text-gray-800">
                <Check size={17} strokeWidth={2} className="text-yellow-500" />
                {b}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              toast.show(m.ctaToast)
              navigate('/dashboard')
            }}
            className="mt-[26px] h-[47px] rounded-[10px] bg-brown-900 text-[17px] font-medium text-white transition hover:bg-brown-700"
          >
            {m.cta}
          </button>
          <p className="mt-[10px] text-center text-[13px] text-gray-600">{m.cancel}</p>
        </section>
      </div>
    </div>
  )
}
