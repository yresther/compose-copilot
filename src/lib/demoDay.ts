// 날짜 선택에서 목업 데이터가 없는 날(오늘·어제 외)을 고르면, 그날의 매출 리포트를 그럴듯하게 만들어 준다
// 같은 날짜는 항상 같은 숫자가 나오도록 날짜를 씨앗으로 쓰는 난수를 사용한다
// 규칙: 하루 매출 약 70만~90만원(요일·날씨 편차), 객단가 = 매출 ÷ 건수, 채널·시간대·결제수단 합계 = 전체

import type { KpiCardData } from '../components/ui/KpiCard'
import type { YMD } from '../components/ui/DatePicker'
import report from '../data/sales-report.json'
import { formatNumber, formatWon } from './format'

type Row = { name: string; count: number; avg: number; diff: number; revenue?: number }

/** 날짜 → 0~1 난수 생성기 (mulberry32) */
function seeded(date: YMD, salt = 0) {
  let a = date.y * 10000 + date.m * 100 + date.d + salt * 7919
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shift = (date: YMD, days: number): YMD => {
  const u = new Date(Date.UTC(date.y, date.m - 1, date.d + days))
  return { y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate() }
}
const weekday = (date: YMD) => new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()

// 요일별 매출 배율 (일~토) — 금·토가 높고 월·수가 낮음
const WEEKDAY_FACTOR = [1.02, 0.94, 0.96, 0.95, 1.0, 1.08, 1.12]

/** 그날의 기본 수치 — 총매출·건수·배달 */
function dayTotals(date: YMD) {
  const r = seeded(date)
  const total = Math.round((760_000 * WEEKDAY_FACTOR[weekday(date)] * (0.93 + r() * 0.14)) / 100) * 100
  const avg = 4_950 + Math.round(r() * 600) // 객단가 4,950~5,550원
  const count = Math.round(total / avg)
  const deliveryCount = Math.round(count * (0.13 + r() * 0.05))
  const deliveryAvg = 4_220 + Math.round(r() * 120)
  return { total, count, delivery: deliveryCount * deliveryAvg, deliveryCount, rand: r }
}

const rate = (cur: number, prev: number) => Math.round(((cur - prev) / prev) * 100)
const deltaText = (label: string, r: number) => `${label} ${r >= 0 ? '+' : ''}${r}%`

/** 건수 비율·객단가 배율로 구분별 행을 만들고, 합계가 전체와 맞도록 보정 */
function split(scheme: [string, number, number][], count: number, total: number): Row[] {
  const avg = total / count
  let left = count
  const rows = scheme.map(([name, share, mul], i) => {
    const c = i === scheme.length - 1 ? left : Math.round(count * share)
    left -= c
    return { name, count: c, mul }
  })
  const norm = total / rows.reduce((s, r) => s + r.count * avg * r.mul, 0)
  return rows.map((r) => ({ name: r.name, count: r.count, avg: Math.round(avg * r.mul * norm), diff: 0 }))
}

const TIME: [string, number, number][] = [
  ['오전 (7~11시)', 0.3, 0.92],
  ['점심 (11~14시)', 0.38, 1.06],
  ['오후 (14~17시)', 0.18, 1.02],
  ['저녁 (17~22시)', 0.14, 0.98],
]
const PAYMENT: [string, number, number][] = [
  ['카드', 0.68, 1.03],
  ['간편결제', 0.27, 0.95],
  ['현금', 0.05, 0.86],
]

function breakdowns(date: YMD) {
  const t = dayTotals(date)
  // 채널: 배달은 정확한 배달 매출, 홀은 건수 × 객단가, 테이크아웃은 나머지
  const restCount = t.count - t.deliveryCount
  const hallCount = Math.round(restCount * 0.41)
  const takeCount = restCount - hallCount
  const restAvg = (t.total - t.delivery) / restCount
  const hallAvg = Math.round(restAvg * 1.07)
  const hallRevenue = hallCount * hallAvg
  const takeRevenue = t.total - t.delivery - hallRevenue
  const channel: Row[] = [
    { name: '테이크아웃', count: takeCount, avg: Math.round(takeRevenue / takeCount), diff: 0, revenue: takeRevenue },
    { name: '홀', count: hallCount, avg: hallAvg, diff: 0, revenue: hallRevenue },
    { name: '배달', count: t.deliveryCount, avg: Math.round(t.delivery / t.deliveryCount), diff: 0, revenue: t.delivery },
  ]
  return { channel, time: split(TIME, t.count, t.total), payment: split(PAYMENT, t.count, t.total) }
}

// 하루 누적 매출 모양은 목업 '어제' 흐름을 따른다
const SHAPE = report.periods.yesterday.trend
const SHAPE_TOTAL = SHAPE.current[SHAPE.current.length - 1]
const RANK_BASE = report.periods.yesterday.ranking

const PEAKS = ['12:00-13:30', '11:30-13:00', '12:30-14:00']

/** 고른 날짜의 KPI 4개 + 리포트 데이터 (기간 탭 데이터와 같은 모양) */
export function buildDemoDay(date: YMD) {
  const today = dayTotals(date)
  const prevDay = dayTotals(shift(date, -1))
  const lastWeek = dayTotals(shift(date, -7))
  const r = today.rand

  const avg = Math.round(today.total / today.count)
  const prevAvg = Math.round(prevDay.total / prevDay.count)
  const totalRate = rate(today.total, prevDay.total)
  const deliveryRate = rate(today.delivery, prevDay.delivery)
  const avgRate = rate(avg, prevAvg)
  const fractions = SHAPE.current.map((v) => v / SHAPE_TOTAL)
  const spark = [4, 26, 58, 72, 86, 92]

  const kpis: KpiCardData[] = [
    {
      title: '총 매출',
      count: `${formatNumber(today.count)}건`,
      value: formatWon(today.total),
      delta: { trend: totalRate >= 0 ? 'up' : 'down', text: deltaText('전일보다', totalRate) },
      chart: { trend: totalRate >= 0 ? 'up' : 'down', labels: ['', '10시', '13시', '16시', '19시', '22시'], values: spark },
    },
    {
      title: '배달 매출',
      count: `${formatNumber(today.deliveryCount)}건`,
      value: formatWon(today.delivery),
      delta: { trend: deliveryRate >= 0 ? 'up' : 'down', text: deltaText('전일보다', deliveryRate) },
      chart: {
        trend: deliveryRate >= 0 ? 'up' : 'down',
        labels: ['', '10시', '13시', '16시', '19시', '22시'],
        values: [4, 10, 28, 24, 40, 52].map((v) => Math.round(v * (0.85 + r() * 0.3))),
      },
    },
    { title: '객단가', value: formatWon(avg), delta: { trend: avgRate >= 0 ? 'up' : 'down', text: deltaText('전일보다', avgRate) }, tint: avgRate >= 0 ? 'up' : 'down' },
    { title: '피크타임', value: PEAKS[Math.floor(r() * PEAKS.length)], highlight: `주문 집중도 ${52 + Math.floor(r() * 10)}%`, variant: 'dark' },
  ]

  // 구분별 증감은 전날 같은 구분 대비
  const cur = breakdowns(date)
  const prev = breakdowns(shift(date, -1))
  for (const key of ['channel', 'time', 'payment'] as const) cur[key].forEach((row, i) => (row.diff = row.avg - prev[key][i].avg))

  const scale = today.total / SHAPE_TOTAL
  const ranking = RANK_BASE.map((x) => {
    const price = x.revenue / x.qty
    const qty = Math.max(1, Math.round(x.qty * scale * (0.9 + r() * 0.2)))
    return { name: x.name, qty, revenue: qty * price }
  }).sort((a, b) => b.revenue - a.revenue)

  return {
    kpis,
    data: {
      trend: {
        unit: 'hour',
        labels: SHAPE.labels,
        current: fractions.map((f, i) => (i === fractions.length - 1 ? today.total : Math.round((today.total * f) / 100) * 100)),
        previous: fractions.map((f, i) => (i === fractions.length - 1 ? lastWeek.total : Math.round((lastWeek.total * f) / 100) * 100)),
        legend: { current: `${date.m}/${date.d}`, previous: '지난주' },
        compare: '지난주 같은 요일보다',
      },
      ranking,
      breakdowns: cur,
      breakdownDiffLabel: '전일 대비',
    },
  }
}
