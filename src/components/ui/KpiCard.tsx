import { Area, AreaChart, ReferenceDot, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'

export type Trend = 'up' | 'down'
type Tone = Trend | 'neutral'

export type KpiCardData = {
  title: string
  count?: string // 제목 옆 보조 수치 (187건)
  value: string
  delta?: { trend: Trend; text: string } // ▲ 어제보다 +12%
  highlight?: string // 다크 카드의 노란 설명 (주문 집중도 60%)
  variant?: 'light' | 'dark'
  /** 카드 하단 추이 그래프 (values는 0~100 비율) */
  chart?: {
    trend: Trend
    labels: string[]
    values: number[]
    marker?: string // 마지막 점 위 표시 ('지금')
    endLine?: boolean // 마지막 점 점선만 (마감)
  }
  /** 그래프 없이 배경 그라데이션만 (객단가) */
  tint?: Trend
}

// card / soft: 그래프 없는 카드(객단가)의 오른쪽 아래 색 — 대시보드 홈 캡처(card) / 매출 리포트 캡처(soft)에서 추출
const TONE: Record<Tone, { color: string; line: string; tint: string; card: string; soft: string }> = {
  up: { color: '#2EA473', line: '#86CDB0', tint: '#DCF4EA', card: '#BDE2D2', soft: '#DCEFE7' },
  down: { color: '#EB7E7E', line: '#F2A3A3', tint: '#FDE4E6', card: '#F7C9CC', soft: '#FCE3E5' },
  neutral: { color: '#9E9E9E', line: '#CFCFCF', tint: '#E0E0E0', card: '#D6D6D6', soft: '#EBEBEB' }, // 마감 리포트
}
const MARK: Record<Trend, string> = { up: '▲', down: '▼' }

function TrendChart({ chart, tone, live }: { chart: NonNullable<KpiCardData['chart']>; tone: Tone; live?: boolean }) {
  const t = TONE[tone]
  const id = `kpi-fill-${tone}`
  const fadeId = `kpi-fade-${tone}`
  const data = chart.values.map((v, i) => ({ i, v }))
  const lastIndex = data.length - 1
  const showEnd = !!chart.marker || chart.endLine

  return (
    <div className="pointer-events-none absolute bottom-0 left-[80px] right-[18px] h-[130px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.tint} stopOpacity={0.9} />
              <stop offset="100%" stopColor={t.tint} stopOpacity={0.15} />
            </linearGradient>
            {/* 왼쪽 시작 부분이 배경에서 자연스럽게 떠오르도록 가로 방향으로 서서히 나타나게 */}
            <linearGradient id={`${fadeId}-g`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fff" stopOpacity={0} />
              <stop offset="30%" stopColor="#fff" stopOpacity={1} />
            </linearGradient>
            <mask id={fadeId} maskContentUnits="objectBoundingBox">
              <rect width="1" height="1" fill={`url(#${fadeId}-g)`} />
            </mask>
          </defs>
          <YAxis hide domain={[0, 100]} />
          <XAxis
            dataKey="i"
            axisLine={false}
            tickLine={false}
            interval={0}
            height={22}
            tick={(p) => (
              <text x={p.x} y={Number(p.y) + 8} textAnchor="middle" fontSize={11} fill="#BDBDBD">
                {chart.labels[Number(p.payload.value)] ?? ''}
              </text>
            )}
          />
          {showEnd && (
            <ReferenceLine
              x={lastIndex}
              stroke="#E0E0E0"
              strokeDasharray="4 4"
              label={chart.marker ? { value: chart.marker, position: 'top', fill: t.color, fontSize: 11, offset: 4 } : undefined}
            />
          )}
          <Area
            type="monotone"
            dataKey="v"
            stroke={t.line}
            strokeWidth={1.5}
            fill={`url(#${id})`}
            mask={`url(#${fadeId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={false}
          />
          {/* 실시간 표시 — 선 끝에 같은 색 점이 천천히 깜빡임 */}
          {live && (
            <ReferenceDot
              x={lastIndex}
              y={data[lastIndex].v}
              shape={(p: { cx?: number; cy?: number }) => <circle cx={p.cx} cy={p.cy} r={3} fill={t.line} className="animate-live-dot" />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

type Props = KpiCardData & {
  /** 실시간 그래프 — 선 끝 점 깜빡임 (대시보드 홈 영업중 · 오늘) */
  live?: boolean
  /** 누르면 이동 (대시보드 홈의 총 매출·배달 매출 → 매출 리포트) */
  onClick?: () => void
  /** 마감 리포트처럼 그래프·배경을 회색 톤으로 */
  neutral?: boolean
  /** 큰 숫자 굵기 — 대시보드 홈은 SUIT ExtraBold */
  valueWeight?: 'bold' | 'extrabold'
  /** 밝은 페이지(매출 리포트): 피크타임 카드를 흰 바탕 + 노란 그라데이션으로 */
  lightPeak?: boolean
  /** 그래프 없는 카드의 색을 연하게 (매출 리포트) */
  softTint?: boolean
  /** 밝은 배경 위 카드 그림자 — X0 Y2 Blur10 #000 6% (매출 리포트). 마우스를 올리면 모든 카드가 살짝 커지며 떠오름 */
  shadow?: boolean
}

// 피크타임(다크) 카드는 숫자 폭이 넓어 여백·정렬을 별도로 맞춤
export default function KpiCard({
  title,
  count,
  value,
  delta,
  highlight,
  variant = 'light',
  chart,
  tint,
  neutral,
  valueWeight = 'bold',
  lightPeak,
  softTint,
  shadow,
  onClick,
  live,
}: Props) {
  const peak = variant === 'dark'
  const dark = peak && !lightPeak
  const trendTone = chart?.trend ?? tint
  const tone: Tone | undefined = trendTone && (neutral ? 'neutral' : trendTone)

  return (
    <div
      role={onClick ? 'link' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `${title} 자세히 보기` : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}
      className={`relative h-[180px] overflow-hidden rounded-card ${onClick ? 'cursor-pointer' : ''} ${peak ? 'pl-[18px] pr-4 pt-4' : 'px-5 pt-5'} ${dark ? 'bg-brown-700' : 'bg-white'} ${
        shadow
          ? 'shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)]'
          : 'hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)]'
      } transition-[transform,box-shadow] duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:transform-none`}
      style={
        tone && !dark
          ? {
              backgroundImage: chart
                ? `linear-gradient(160deg, #FFFFFF 55%, ${TONE[tone].tint} 130%)`
                : `linear-gradient(160deg, #FFFFFF 62%, ${softTint ? TONE[tone].soft : TONE[tone].card} 100%)`,
            }
          : peak && lightPeak
            ? { backgroundImage: 'linear-gradient(160deg, #FFFFFF 55%, #FFF3C4 130%)' }
            : undefined
      }
    >
      {chart && tone && <TrendChart chart={chart} tone={tone} live={live} />}
      <div className="relative">
        <p className={`flex items-baseline gap-2 text-[16px] font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>
          {title}
          {count && <span className="font-num text-[15px] font-normal text-gray-500">{count}</span>}
        </p>
        <p
          className={`${peak ? '-ml-[3px] mt-[5px] !text-[31px]' : 'mt-1.5'} whitespace-nowrap font-num text-display ${valueWeight === 'extrabold' ? 'font-extrabold' : ''} ${dark ? 'text-white' : 'text-gray-900'}`}
        >
          {value}
        </p>
        {delta && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[15px] font-medium text-gray-900">
            <span className="text-[10px]" style={{ color: TONE[delta.trend].color }}>
              {MARK[delta.trend]}
            </span>
            <span className="font-num">{delta.text}</span>
          </p>
        )}
        {highlight && (
          <p className={`ml-[1.5px] mt-1 text-[15px] font-medium ${dark ? 'text-yellow-300' : 'text-gray-900'}`}>{highlight}</p>
        )}
      </div>
    </div>
  )
}
