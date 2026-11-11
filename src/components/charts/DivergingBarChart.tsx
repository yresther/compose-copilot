import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatWon } from '../../lib/format'
import { ChartTooltipBox, ChartTooltipRow } from './ChartTooltip'

// 가운데 0 기준 좌우 막대 — 평균보다 높으면 노란 막대, 낮으면 회색 막대 (−50% ~ +50%)
const UP = '#FFD21F'
const DOWN = '#E0E0E0'
const TICKS = [-50, -25, 0, 25, 50]

export type DivergingRow = { key: string; label: string; avg: number; diff: number; days: number }

type Props = {
  rows: DivergingRow[]
  /** 필터로 고른 항목 — 나머지 막대는 흐리게 */
  selectedKey?: string | null
}

const pct = (v: number) => `${v > 0 ? '+' : ''}${v}%`

function RowTooltip({ active, payload }: { active?: boolean; payload?: { payload: DivergingRow }[] }) {
  if (!active || !payload?.length) return null
  const r = payload[0].payload
  return (
    <ChartTooltipBox title={r.label}>
      <ChartTooltipRow label="평균 매출" value={formatWon(r.avg)} strong />
      <ChartTooltipRow label="전체 평균 대비" value={pct(r.diff)} />
      <ChartTooltipRow label="해당 일수" value={`${r.days}일`} />
    </ChartTooltipBox>
  )
}

export default function DivergingBarChart({ rows, selectedKey }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }} barCategoryGap={0}>
        <CartesianGrid horizontal={false} stroke="#E0E0E0" strokeDasharray="3 3" />
        <XAxis
          type="number"
          orientation="top"
          domain={[-50, 50]}
          ticks={TICKS}
          tickFormatter={(v: number) => (v === 0 ? '0' : pct(v))}
          axisLine={false}
          tickLine={false}
          height={57}
          tick={{ fontSize: 13, fill: '#9E9E9E', fontFamily: 'SUIT Variable', dy: -15 }}
        />
        <YAxis
          type="category"
          dataKey="key"
          width={127}
          axisLine={false}
          tickLine={false}
          tick={(p) => {
            const row = rows.find((r) => r.key === p.payload.value)
            if (!row) return <g />
            const dim = selectedKey && selectedKey !== row.key
            return (
              <g opacity={dim ? 0.4 : 1}>
                <text x={0} y={Number(p.y) + 1} fontSize={14} fontWeight={600} fill="#212121">
                  {row.label}
                </text>
                <text x={0} y={Number(p.y) + 27} fontSize={13} fill="#9E9E9E">
                  평균 {row.avg.toLocaleString('ko-KR')}원
                </text>
              </g>
            )
          }}
        />
        {/* 애니메이션 없이 마우스 위치에 바로 표시 */}
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} content={<RowTooltip />} isAnimationActive={false} />
        <Bar dataKey="diff" barSize={25} radius={4} isAnimationActive={false}>
          {rows.map((r) => (
            <Cell key={r.key} fill={r.diff >= 0 ? UP : DOWN} fillOpacity={selectedKey && selectedKey !== r.key ? 0.35 : 1} />
          ))}
          <LabelList
            dataKey="diff"
            content={(p) => {
              const v = Number(p.value)
              const x = Number(p.x)
              const w = Number(p.width)
              const y = Number(p.y) + Number(p.height) + 16
              const end = v >= 0 ? x + w : x
              const row = rows[Number(p.index)]
              const dim = selectedKey && row && selectedKey !== row.key
              return (
                <text
                  x={end}
                  y={y}
                  textAnchor={v >= 0 ? 'end' : 'start'}
                  fontSize={12}
                  fontWeight={600}
                  fontFamily="SUIT Variable"
                  fill={v >= 0 ? '#F49F04' : '#9E9E9E'}
                  opacity={dim ? 0.4 : 1}
                >
                  {pct(v)}
                </text>
              )
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
