import promotionIcon from '../../assets/icons/promotion.svg'
import temperatureIcon from '../../assets/icons/temperature.svg'
import weatherIcon from '../../assets/icons/weather.svg'

const ICONS = { thermometer: temperatureIcon, rain: weatherIcon, promo: promotionIcon }

export type Insight = {
  icon: keyof typeof ICONS
  title: string
  label: string
  /** 증감률 (%) — 높으면 파랑, 낮으면 빨강 */
  value: number
  note: string
  /** 주의가 필요한 해석이면 빨간 ! 아이콘 */
  warn?: boolean
}

/** 매출 패턴 요약 카드 — 아이콘·제목 / 기준 / 큰 증감률 / 한 줄 해석 */
export default function InsightCard({ item }: { item: Insight }) {
  const up = item.value >= 0

  return (
    <article className="h-[180px] rounded-card bg-white px-[18px] pt-[15px]">
      <header className="flex items-center gap-[9px]">
        <span className="flex h-[35px] w-[35px] items-center justify-center rounded-[10px] bg-gray-100">
          <img src={ICONS[item.icon]} alt="" className="h-5 w-5" />
        </span>
        <h3 className="text-[16px] font-semibold text-gray-900">{item.title}</h3>
      </header>
      <p className="mt-[14px] text-[14px] font-semibold text-gray-900">{item.label}</p>
      <p className={`mt-[3px] font-num text-[25px] font-bold ${up ? 'text-info' : 'text-down'}`}>
        {up ? '+' : ''}
        {item.value}%
      </p>
      <p className="mt-[13px] flex items-center gap-2 text-[16px] text-gray-700">
        {item.warn && (
          <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-down text-[12px] font-bold text-white">!</span>
        )}
        {item.note}
      </p>
    </article>
  )
}
