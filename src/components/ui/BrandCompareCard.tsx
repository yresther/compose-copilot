import coinIcon from '../../assets/icons/coin.svg'
import moneyIcon from '../../assets/icons/money-bag.svg'
import peopleIcon from '../../assets/icons/people.svg'
import { formatNumber } from '../../lib/format'

const ICONS = { money: moneyIcon, people: peopleIcon, coin: coinIcon }

export type BrandItem = {
  key: string
  icon: keyof typeof ICONS
  label: string
  ours: number
  brand: number
  unit: string
  /** 브랜드 내 상위 N% */
  rankTop: number
}

const fmt = (n: number, unit: string) => (unit === '명' ? `${formatNumber(n)}명` : `${formatNumber(n)}${unit}`)

/** 우리 매장 vs 브랜드 평균 카드 — 평균보다 +N, 상위 N%, 하위·평균·상위 막대 */
export default function BrandCompareCard({ item }: { item: BrandItem }) {
  const diff = item.ours - item.brand
  const up = diff >= 0
  const fill = 100 - item.rankTop // 상위 38% → 막대 62%

  return (
    <article className="flex h-[264px] flex-col rounded-card bg-white px-[25px] pb-[26px] pt-[18px]">
      <header className="flex items-center gap-2">
        <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-gray-100">
          <img src={ICONS[item.icon]} alt="" className="h-5 w-5" />
        </span>
        <h3 className="text-[16px] font-semibold text-gray-900">{item.label}</h3>
      </header>

      <div className="mt-[21px] flex justify-between">
        <div>
          <p className="text-[14px] text-gray-700">우리 매장</p>
          <p className="font-num text-[20px] font-semibold leading-[28px] text-gray-900">{fmt(item.ours, item.unit)}</p>
        </div>
        <div className="text-right">
          <p className="text-[14px] text-gray-400">브랜드 평균</p>
          <p className="font-num text-[16px] leading-[28px] text-gray-500">{fmt(item.brand, item.unit)}</p>
        </div>
      </div>

      <p className="mt-[9px] flex items-center gap-1.5 text-[14px] font-medium text-gray-900">
        <span className={`text-[10px] ${up ? 'text-success' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
        평균보다 <span className="font-num">{`${up ? '+' : '-'}${formatNumber(Math.abs(diff))}`}</span>
      </p>

      <p className="mt-auto text-[14px] font-semibold text-yellow-700">상위 {item.rankTop}%</p>
      <div className="mt-[14px] h-2 rounded-full bg-gray-200">
        <div className="h-full rounded-full bg-yellow-300" style={{ width: `${fill}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
        <span>하위</span>
        <span>평균</span>
        <span>상위</span>
      </div>
    </article>
  )
}
