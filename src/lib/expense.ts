import data from '../data/expense.json'
import { kstNow } from './kst'

// 지출관리 계산 — 화면의 모든 금액·비중은 여기서 만든다 (화면 코드에 숫자를 쓰지 않음)

export type ExpenseId = 'material' | 'labor' | 'rent' | 'royalty' | 'loan' | 'repair' | 'telecom'
export type Month = { y: number; m: number }
export type FixedId = 'loan' | 'rent' | 'royalty' | 'telecom'
export type VariableId = 'material' | 'labor' | 'repair'
/** 사장님이 고친 값 — 고정지출은 매달 공통, 변동지출은 그 달만 (YYYY-M 키) */
export type FixedSource = 'account' | 'manual'
/** 운영인력 한 명 — 구분 · 근무요일(0=일 … 6=토) · 근무시간(시) · 시급 */
export type Staff = { id: string; role: string; days: number[]; start: number; end: number; wage: number }
export type ExpenseSettings = {
  fixed: Record<FixedId, { amount: number; payDay: number; source: FixedSource }>
  /** 운영인력 (온보딩 4단계와 같은 출처) — 인건비 계산에 씀 */
  staff: Staff[]
  overrides: Record<string, Partial<Record<VariableId, number>>>
}
export const DEFAULT_SETTINGS: ExpenseSettings = {
  fixed: Object.fromEntries(
    data.fixed.map((f) => [f.id, { amount: f.amount, payDay: f.payDay, source: f.source as FixedSource }]),
  ) as ExpenseSettings['fixed'],
  staff: data.staff,
  overrides: {},
}
/** 납부일 표시 — 31일은 '말일' (달마다 마지막 날) */
export const payDayLabel = (d: number) => (d >= 31 ? '말일' : `${d}일`)
/** 흔히 쓰는 납부일 — 온보딩 납부일 선택지 */
export const COMMON_PAY_DAYS = [1, 5, 10, 15, 20, 25, 31]

export const monthKey = ({ y, m }: Month) => `${y}-${m}`
export type ExpenseItem = { id: ExpenseId; name: string; amount: number; share: number }
export type FixedRow = ExpenseItem & { payDay: number; source: string; dueText: string }
export type VariableRow = ExpenseItem & { sub: string; warn: boolean }
export type MonthExpense = {
  month: Month
  isCurrent: boolean
  sales: number
  total: number
  /** 지난달보다 더 쓴 금액 (음수면 덜 씀) */
  diff: number
  /** 막대 순서 — 큰 항목부터 */
  bar: ExpenseItem[]
  fixed: FixedRow[]
  variable: VariableRow[]
  labor: { rate: number; saving: number; quiet: [number, number] }
}

const daysIn = ({ y, m }: Month) => new Date(Date.UTC(y, m, 0)).getUTCDate()
const weekday = ({ y, m }: Month, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay()
export const shiftMonth = ({ y, m }: Month, n: number): Month => {
  const t = y * 12 + (m - 1) + n
  return { y: Math.floor(t / 12), m: (t % 12) + 1 }
}
export const sameMonth = (a: Month, b: Month) => a.y === b.y && a.m === b.m
export const currentMonth = (): Month => {
  const t = kstNow()
  return { y: t.y, m: t.m }
}

/** 인건비 = Σ(근무시간 × 시급) + 주휴수당(주 15시간 이상, 주 근무시간/40 × 8시간 × 주 수) → 천원 단위 반올림 */
export function laborCost(month: Month, staff: Staff[] = DEFAULT_SETTINGS.staff) {
  const n = daysIn(month)
  let base = 0
  let weekly = 0
  for (const s of staff) {
    const hours = s.end - s.start
    let days = 0
    for (let d = 1; d <= n; d++) if (s.days.includes(weekday(month, d))) days++
    base += hours * days * s.wage
    const perWeek = hours * s.days.length
    if (perWeek >= 15) weekly += (Math.min(perWeek, 40) / 40) * 8 * (n / 7) * s.wage
  }
  return Math.round((base + weekly) / 1000) * 1000
}

/** 한산한 시간에 1명만 남기면 아낄 수 있는 금액 (그 시간 2명 이상인 날만) */
function quietSaving(month: Month, staff: Staff[]) {
  const [from, to] = data.labor.quietHours as [number, number]
  let saving = 0
  for (let d = 1; d <= daysIn(month); d++) {
    const w = weekday(month, d)
    for (let h = from; h < to; h++) {
      const on = staff.filter((s) => s.days.includes(w) && s.start <= h && h < s.end)
      // 시급이 높은 사람부터 빼고 1명만 남김
      on.sort((a, b) => a.wage - b.wage)
        .slice(1)
        .forEach((s) => (saving += s.wage))
    }
  }
  return saving
}

/** 비중(%) — 소수 첫째 자리까지, 합계가 정확히 100.0이 되도록 나머지가 큰 항목부터 0.1씩 보정 */
function shares(amounts: number[], total: number) {
  const raw = amounts.map((a) => (a / total) * 1000)
  const out = raw.map(Math.floor)
  let rest = 1000 - out.reduce((a, b) => a + b, 0)
  raw
    .map((r, i) => [i, r - out[i]] as const)
    .sort((a, b) => b[1] - a[1])
    .forEach(([i]) => rest-- > 0 && out[i]++)
  return out.map((v) => v / 10)
}

const offsetOf = (month: Month) => {
  const now = currentMonth()
  return (now.y - month.y) * 12 + (now.m - month.m)
}
const salesOf = (month: Month) => {
  const k = offsetOf(month)
  return k <= 0 ? data.monthlySales : Math.round((data.monthlySales * (data.pastSalesFactor[k - 1] ?? 1)) / 10000) * 10000
}

/** 자동으로 계산되는 변동지출 (재료 = 매출 × 비율, 인건비 = 근무표, 수리비 = 목업) */
export function autoVariable(month: Month, staff: Staff[] = DEFAULT_SETTINGS.staff): Record<VariableId, number> {
  const isCurrent = offsetOf(month) === 0
  return {
    material: Math.round(salesOf(month) * data.materialRate),
    labor: laborCost(month, staff),
    repair: (isCurrent ? data.repair.current : data.repair.past).amount,
  }
}

function rawMonth(month: Month, s: ExpenseSettings) {
  const isCurrent = offsetOf(month) === 0
  const sales = salesOf(month)
  const repair = isCurrent ? data.repair.current : data.repair.past
  const variable = { ...autoVariable(month, s.staff), ...s.overrides[monthKey(month)] }
  const amounts: Record<ExpenseId, number> = {
    ...variable,
    loan: s.fixed.loan.amount,
    rent: s.fixed.rent.amount,
    royalty: s.fixed.royalty.amount,
    telecom: s.fixed.telecom.amount,
  }
  return { isCurrent, sales, repair, amounts }
}

const NAMES: Record<ExpenseId, string> = {
  material: '재료 발주비',
  labor: '인건비',
  repair: '매장 관리 · 수리비',
  ...(Object.fromEntries(data.fixed.map((f) => [f.id, f.name])) as Record<'loan' | 'rent' | 'royalty' | 'telecom', string>),
}

/** 다음 결제일까지 남은 날 (이번 달 결제일이 지났으면 다음 달) */
function daysUntil(payDay: number) {
  const t = kstNow()
  const today = Date.UTC(t.y, t.m - 1, t.d)
  // 그 달에 없는 날(31일 등)은 말일에 나감
  const dueIn = (y: number, m: number) => Date.UTC(y, m - 1, Math.min(payDay, daysIn({ y, m })))
  let due = dueIn(t.y, t.m)
  if (due < today) {
    const n = shiftMonth({ y: t.y, m: t.m }, 1)
    due = dueIn(n.y, n.m)
  }
  return Math.round((due - today) / 86400000)
}

export function monthExpense(month: Month, settings: ExpenseSettings = DEFAULT_SETTINGS): MonthExpense {
  const { isCurrent, sales, repair, amounts } = rawMonth(month, settings)
  const ids = Object.keys(amounts) as ExpenseId[]
  const total = ids.reduce((s, id) => s + amounts[id], 0)
  const pct = Object.fromEntries(
    ids.map((id, i) => [
      id,
      shares(
        ids.map((x) => amounts[x]),
        total,
      )[i],
    ]),
  ) as Record<ExpenseId, number>
  const item = (id: ExpenseId): ExpenseItem => ({ id, name: NAMES[id], amount: amounts[id], share: pct[id] })

  const prev = rawMonth(shiftMonth(month, -1), settings)
  const prevTotal = Object.values(prev.amounts).reduce((a, b) => a + b, 0)

  const laborRate = amounts.labor / sales
  const warn = laborRate > data.labor.warnRate
  const materialUp = amounts.material >= prev.amounts.material

  return {
    month,
    isCurrent,
    sales,
    total,
    diff: total - prevTotal,
    bar: [...ids].sort((a, b) => amounts[b] - amounts[a]).map(item),
    fixed: data.fixed.map((f) => {
      const payDay = settings.fixed[f.id as FixedId].payDay
      const d = daysUntil(payDay)
      return {
        ...item(f.id as ExpenseId),
        payDay,
        source: data.sourceLabels[settings.fixed[f.id as FixedId].source],
        dueText: isCurrent ? (d === 0 ? '오늘' : `${d}일 후`) : '납부 완료',
      }
    }),
    variable: [
      { ...item('labor'), sub: warn ? data.labor.warnSub : data.labor.okSub, warn },
      { ...item('material'), sub: `저번달보다 ${materialUp ? '많이' : '적게'} 발주했어요`, warn: false },
      { ...item('repair'), sub: repair.sub, warn: false },
    ],
    labor: {
      rate: Math.round(laborRate * 1000) / 10,
      // 인건비를 직접 고쳤으면 절약액도 같은 비율로 맞춤
      saving: (() => {
        // 인건비를 직접 고쳤으면 절약액도 같은 비율로 맞춤 (인력이 없으면 0)
        const auto = laborCost(month, settings.staff)
        return auto ? Math.round(quietSaving(month, settings.staff) * (amounts.labor / auto)) : 0
      })(),
      quiet: data.labor.quietHours as [number, number],
    },
  }
}

/** 선택 가능한 달 — 이번 달 + 지난 N달 (최근 순) */
export const selectableMonths = () => Array.from({ length: data.pastMonths + 1 }, (_, i) => shiftMonth(currentMonth(), -i))
