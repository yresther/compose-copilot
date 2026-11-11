import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatAxisWon, formatWon, niceStep } from '../../lib/format'
import { ChartTooltipBox, ChartTooltipRow } from './ChartTooltip'

// 매출 추이 — 이번 기간(초록 선 + 면적) vs 지난 기간(회색 선), 누적 매출
const GREEN = '#2EA473'
const GRAY = '#D6D6D6'

export type TrendPoint = { label: string; title: string; current: number; previous: number }

type Props = {
  data: TrendPoint[]
  legend: { current: string; previous: string }
  /** 실시간(오늘) — 선 끝에 KPI 카드와 같은 깜빡이는 점 */
  live?: boolean
}

function TrendTooltip({ active, payload, legend }: { active?: boolean; payload?: { payload: TrendPoint }[]; legend: Props['legend'] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltipBox title={p.title}>
      <ChartTooltipRow label={legend.previous} value={formatWon(p.previous)} dot="#E0E0E0" />
      <ChartTooltipRow label={legend.current} value={formatWon(p.current)} dot={GREEN} strong />
    </ChartTooltipBox>
  )
}

export default function SalesTrendChart({ data, legend, live }: Props) {
  const last = data[data.length - 1]
  // 세로축 눈금 — 최댓값보다 15% 여유를 두고 깔끔한 간격으로 (오늘 기준 50만~300만, 캡처와 동일)
  const max = Math.max(...data.flatMap((d) => [d.current, d.previous]))
  const step = niceStep(max / 5)
  const ticks = Array.from({ length: Math.ceil((max * 1.15) / step) }, (_, i) => step * (i + 1))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 78, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="sales-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCF4EA" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#DCF4EA" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#F0F0F0" />
        <YAxis
          domain={[0, ticks[ticks.length - 1]]}
          ticks={ticks}
          tickFormatter={formatAxisWon}
          axisLine={false}
          tickLine={false}
          width={47}
          tick={{ fontSize: 11, fill: '#9E9E9E', fontFamily: 'SUIT Variable' }}
        />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          interval={0}
          padding={{ left: 92, right: 0 }}
          tickMargin={0}
          tick={{ fontSize: 14, fill: '#9E9E9E' }}
        />
        <Tooltip cursor={false} offset={16} content={<TrendTooltip legend={legend} />} isAnimationActive={false} />
        <Line type="linear" dataKey="previous" stroke={GRAY} strokeWidth={1.5} dot={false} activeDot={false} isAnimationActive={false} />
        <Area
          type="linear"
          dataKey="current"
          stroke={GREEN}
          strokeWidth={2}
          fill="url(#sales-trend-fill)"
          dot={false}
          activeDot={{ r: 5, fill: GREEN, stroke: '#fff', strokeWidth: 2 }}
          isAnimationActive={false}
        />
        {live && last && (
          <ReferenceDot
            x={last.label}
            y={last.current}
            shape={(s: { cx?: number; cy?: number }) => <circle cx={s.cx} cy={s.cy} r={3} fill={GREEN} className="animate-live-dot" />}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
