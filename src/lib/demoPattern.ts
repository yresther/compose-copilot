// 매출 패턴 분석 — 고른 기간마다 그럴듯한 데모 지표를 만든다
// 가장 가까운 목업(1·3·6개월)을 기준으로, 기간(시작일·종료일)을 씨앗으로 한 난수로 값을 조금씩 흔든다
// 같은 기간은 항상 같은 숫자, 방향(증가/감소)은 기준과 같게 유지 → 카드·그래프·Tip·상권 비교가 서로 맞음

import type { YMDRange } from '../components/ui/DatePicker'
import pattern from '../data/sales-pattern.json'

export type PatternData = (typeof pattern.ranges)['6m']
type RangeKey = keyof typeof pattern.ranges

const BASE_DAYS: Record<RangeKey, number> = { '1m': 30, '3m': 91, '6m': 182 }

const dayNum = (p: { y: number; m: number; d: number }) => Date.UTC(p.y, p.m - 1, p.d) / 86_400_000

export const rangeDays = (r: YMDRange) => dayNum(r.end) - dayNum(r.start) + 1

/** 기간 길이에 가장 가까운 목업 데이터 */
export const nearestKey = (r: YMDRange): RangeKey => {
  const days = rangeDays(r)
  return days <= 45 ? '1m' : days <= 120 ? '3m' : '6m'
}

function seeded(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 소수 첫째 자리까지 — 캡처처럼 항상 소수점이 보이도록 정수로 떨어지면 0.1 보정
const round1 = (v: number) => {
  const x = Math.round(v * 10) / 10
  return Number.isInteger(x) ? x + (x >= 0 ? 0.1 : -0.1) : x
}

/**
 * 기간별 패턴 데이터
 * isDefault면(처음 화면의 최근 6개월) 캡처 수치를 그대로 쓴다
 */
export function buildPatternData(range: YMDRange, isDefault: boolean): PatternData {
  const key = nearestKey(range)
  const base = pattern.ranges[key]
  if (isDefault) return base

  const r = seeded(dayNum(range.start) * 7 + dayNum(range.end) * 13)
  const jitter = (v: number, spread = 0.15) => round1(v * (1 - spread + r() * spread * 2))
  const daysScale = rangeDays(range) / BASE_DAYS[key]
  const baseline = Math.round((base.baseline * (0.96 + r() * 0.08)) / 1000) * 1000

  const row = (x: PatternData['weather'][number]) => {
    const diff = jitter(x.diff)
    return { ...x, diff, avg: Math.round((baseline * (1 + diff / 100)) / 1000) * 1000, days: Math.max(1, Math.round(x.days * daysScale)) }
  }
  const weather = base.weather.map(row)
  const special = base.special.map(row)
  const find = (rows: typeof weather, k: string) => rows.find((x) => x.key === k)!.diff

  const hot = find(weather, 'hot')
  const rain = find(weather, 'rain')
  const promo = find(special, 'promo')
  const nextDay = Math.round(base.nextDay * (0.8 + r() * 0.4))
  const rainDelivery = Math.max(8, base.rainDelivery + Math.round(r() * 4 - 2))

  // 요약 카드는 그래프 수치에서 그대로 가져온다
  const insights = base.insights.map((it) =>
    it.icon === 'thermometer'
      ? { ...it, value: hot }
      : it.icon === 'rain'
        ? { ...it, value: rain }
        : { ...it, label: `당일 매출 +${promo}% 상승, 다음날`, value: nextDay },
  )

  // 상권 비교: 프로모션 반응률 = 프로모션 당일 증감, 나머지는 기준에서 살짝 흔들기
  const areaAvg = Math.round(promo * (0.8 + r() * 0.1))
  const area = base.area.map((a, i) =>
    i === 3 ? { ...a, value: promo, note: `구 내 평균 +${areaAvg}%` } : { ...a, value: jitter(a.value, 0.2) },
  )

  return { ...base, baseline, weather, special, insights, nextDay, rainDelivery, area }
}
