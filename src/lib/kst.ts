// 한국 표준시(KST) 기준 날짜·시각 — 사이트를 여는 날이 서비스 안의 '오늘'
const TZ = 'Asia/Seoul'
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const pad = (n: number) => String(n).padStart(2, '0')

export type KstParts = { y: number; m: number; d: number; h: number; mi: number; s: number; weekday: string }

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hourCycle: 'h23',
})

/** 지금(또는 주어진 시점)의 KST 연·월·일·시·분·초·요일 */
export function kstNow(date = new Date()): KstParts {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, Number(x.value)]))
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()]
  return { y: p.year, m: p.month, d: p.day, h: p.hour % 24, mi: p.minute, s: p.second, weekday }
}

/** KST 오늘에서 n일 뒤(음수면 앞) 날짜 */
export function kstDay(offset = 0): KstParts {
  const t = kstNow()
  const u = new Date(Date.UTC(t.y, t.m - 1, t.d + offset))
  return { ...t, y: u.getUTCFullYear(), m: u.getUTCMonth() + 1, d: u.getUTCDate(), weekday: WEEKDAYS[u.getUTCDay()] }
}

/** 2026.06.19 (금) — sep으로 구분자 변경 */
export const formatDate = (p: KstParts, sep: '.' | '-' = '.') => `${[p.y, pad(p.m), pad(p.d)].join(sep)} (${p.weekday})`

/** 2026.06.19 — 요일 없이 */
export const formatDateShort = (p: KstParts) => [p.y, pad(p.m), pad(p.d)].join('.')

/** 오늘 요일 번호 (0=일 … 6=토) */
export const kstWeekdayIndex = () => WEEKDAYS.indexOf(kstNow().weekday)

export const formatTime = (p: KstParts, withSeconds = true) =>
  (withSeconds ? [p.h, p.mi, p.s] : [p.h, p.mi]).map(pad).join(':')

/** '16:59 기준' — 지금(KST) 시각으로 만든 기준 시각 문구 */
export const basisNow = () => `${formatTime(kstNow(), false)} 기준`

/**
 * 목업 문구 속 날짜 자리표시자를 오늘 기준으로 채운다
 * {{date:+1}} → 6/20 (월/일), {{today}} → 2026.06.19 (금)
 */
export function fillDates(text: string): string {
  return text
    .replace(/\{\{date:([+-]\d+)\}\}/g, (_, n) => {
      const p = kstDay(Number(n))
      return `${p.m}/${p.d}`
    })
    .replace(/\{\{today\}\}/g, () => formatDate(kstDay()))
}
