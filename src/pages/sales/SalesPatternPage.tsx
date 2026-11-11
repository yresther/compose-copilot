import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import promotionIcon from '../../assets/icons/promotion.svg'
import sunnyIcon from '../../assets/icons/sunny.svg'
import buildingsImg from '../../assets/illust/buildings.png'
import starImg from '../../assets/icons/star.png'
import characterImg from '../../assets/illust/character.png'
import cupImg from '../../assets/illust/cup.png'
import docEditImg from '../../assets/illust/doc-edit.png'
import docSearchImg from '../../assets/illust/doc-search.png'
import scooterImg from '../../assets/illust/scooter.png'
import DivergingBarChart, { type DivergingRow } from '../../components/charts/DivergingBarChart'
import PageHeader from '../../components/layout/PageHeader'
import type { YMDRange } from '../../components/ui/DatePicker'
import DateRangePill from '../../components/ui/DateRangePill'
import Dropdown from '../../components/ui/Dropdown'
import InsightCard, { type Insight } from '../../components/ui/InsightCard'
import TipBanner from '../../components/ui/TipBanner'
import pattern from '../../data/sales-pattern.json'
import { buildPatternData, type PatternData } from '../../lib/demoPattern'
import { kstNow } from '../../lib/kst'

type WeatherKey = 'all' | 'hot' | 'mild' | 'rain'
type SpecialKey = 'all' | 'promo' | 'fri' | 'holiday'
// Tip마다 내용에 맞는 3D 일러스트 (design/assets, 같은 그림체)
const TIP_IMAGES: Record<string, string> = {
  scooter: scooterImg,
  cup: cupImg,
  star: starImg,
  character: characterImg,
  docEdit: docEditImg,
  docSearch: docSearchImg,
}

type Tip = {
  image?: string
  headline: string
  body: string
  action?: { label: string; to: string }
}

const WEATHERS: { value: WeatherKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'hot', label: '맑음 30° 이상' },
  { value: 'mild', label: '맑음 18°~29°' },
  { value: 'rain', label: '흐림 / 비' },
]
const SPECIALS: { value: SpecialKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'promo', label: '프로모션 당일' },
  { value: 'fri', label: '금요일' },
  { value: 'holiday', label: '공휴일 (월~금)' },
]

/** 기본 기간: 오늘(KST)에서 6개월 전 ~ 오늘 */
function defaultRange(): YMDRange {
  const t = kstNow()
  const s = new Date(Date.UTC(t.y, t.m - 7, t.d))
  return { start: { y: s.getUTCFullYear(), m: s.getUTCMonth() + 1, d: s.getUTCDate() }, end: { y: t.y, m: t.m, d: t.d } }
}

/** Tip 문구의 {키}를 해당 기간 수치(절댓값)로 채운다 */
function fillTip(tip: Tip, range: PatternData): Tip {
  const values: Record<string, number> = {
    ...Object.fromEntries([...range.weather, ...range.special].map((r) => [r.key, Math.abs(r.diff)])),
    nextDay: Math.abs(range.nextDay),
    rainDelivery: range.rainDelivery,
    areaDelivery: range.areaDelivery,
  }
  return {
    ...tip,
    body: tip.body.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? '')),
  }
}

// 매출 패턴 분석 (04_sales-pattern.png) — 유료 기능이지만 데모에서는 잠금 없이 전체 공개
export default function SalesPatternPage() {
  const navigate = useNavigate()
  // 기간은 달력으로 시작일~종료일 선택 → 길이에 맞는 분석 데이터 사용
  const [initialRange] = useState<YMDRange>(defaultRange)
  const [dateRange, setDateRange] = useState<YMDRange>(initialRange)
  const [weather, setWeather] = useState<WeatherKey>('all')
  const [special, setSpecial] = useState<SpecialKey>('all')
  // Tip은 마지막으로 바꾼 필터 기준 (둘 다 '전체'면 캡처의 비 오는 날 Tip)
  const [tipFrom, setTipFrom] = useState<'weather' | 'special'>('weather')
  // X로 닫은 Tip — 필터를 바꿔 다른 Tip이 되면 다시 보인다
  const [closedTip, setClosedTip] = useState<string | null>(null)

  // 기간을 바꾸면 카드·그래프·Tip·상권 비교 수치가 그 기간의 데모 데이터로 바뀐다 (처음 6개월은 캡처 수치)
  const data = useMemo(() => buildPatternData(dateRange, dateRange === initialRange), [dateRange, initialRange])
  const tips = pattern.tips as {
    default: Tip
    weather: Record<string, Tip>
    special: Record<string, Tip>
  }
  const tip: Tip =
    tipFrom === 'weather' && weather !== 'all'
      ? fillTip(tips.weather[weather], data)
      : tipFrom === 'special' && special !== 'all'
        ? fillTip(tips.special[special], data)
        : weather !== 'all'
          ? fillTip(tips.weather[weather], data)
          : special !== 'all'
            ? fillTip(tips.special[special], data)
            : tips.default

  return (
    <div className="pb-28">
      <PageHeader title="매출 패턴 분석" basis basisInitial="자동 업데이트" className="pt-8" />

      <div className="px-page">
        {/* 필터 */}
        <div className="mt-[31px] flex gap-[13px]">
          <DateRangePill value={dateRange} onChange={setDateRange} />
          <Dropdown
            variant="pill"
            options={WEATHERS}
            value={weather}
            onChange={(v) => {
              setWeather(v)
              setTipFrom('weather')
            }}
            icon={<img src={sunnyIcon} alt="" className="h-5 w-5" />}
            ariaLabel="날씨"
          />
          <Dropdown
            variant="pill"
            options={SPECIALS}
            value={special}
            onChange={(v) => {
              setSpecial(v)
              setTipFrom('special')
            }}
            icon={<img src={promotionIcon} alt="" className="h-5 w-5 opacity-50" />}
            ariaLabel="프로모션 · 특수일"
          />
        </div>

        {/* 요약 카드 */}
        <div className="mt-[26px] grid grid-cols-3 gap-[14px]">
          {(data.insights as Insight[]).map((item) => (
            <InsightCard key={item.title} item={item} />
          ))}
        </div>

        {/* 날씨별 · 특수일 매출 패턴 */}
        <div className="mt-[23px] grid grid-cols-2 gap-[23px]">
          {[
            {
              title: '날씨별 매출 패턴',
              rows: data.weather,
              selected: weather,
            },
            {
              title: '특수일 매출 패턴',
              rows: data.special,
              selected: special,
            },
          ].map((c) => (
            <section key={c.title} className="relative h-[339px] rounded-card bg-white">
              <h2 className="pl-[25px] pt-[23px] text-[16px] font-semibold text-gray-900">{c.title}</h2>
              <div className="absolute bottom-[14px] left-[25px] right-[25px] top-[40px]">
                <DivergingBarChart rows={c.rows as DivergingRow[]} selectedKey={c.selected === 'all' ? null : c.selected} />
              </div>
            </section>
          ))}
        </div>

        {/* 코파일럿 Tip — 데이터 → 해석 → 액션 */}
        {closedTip !== tip.headline + tip.body && (
          <TipBanner
            className="mt-[31px] min-h-[118px]"
            headline={tip.headline}
            body={tip.body}
            image={tip.image ? TIP_IMAGES[tip.image] : undefined}
            action={
              tip.action && {
                label: tip.action.label,
                onClick: () => navigate(tip.action!.to),
              }
            }
            onClose={() => setClosedTip(tip.headline + tip.body)}
          />
        )}

        {/* 같은 상권 컴포즈 비교 (매장명 없이 묶은 수치만) */}
        <section className="mt-[18px] h-[265px] rounded-card bg-white px-[30px] pt-6">
          <h2 className="text-[16px] font-semibold text-gray-900">같은 상권 컴포즈 비교</h2>
          <p className="mt-[5px] text-[14px] text-gray-600">같은 날씨/요일 조건에서 우리 매장이 어느 위치인지 확인해요.</p>
          <div className="mt-[41px] flex items-start">
            <img src={buildingsImg} alt="" className="-mt-[7px] ml-4 w-[158px]" />
            <div className="ml-[46px] grid grid-cols-[repeat(4,211px)] gap-4">
              {data.area.map((a) => (
                <div key={a.label} className="h-[122px] rounded-card bg-gray-100 px-[27px] pt-6">
                  <p className="text-[14px] font-medium text-gray-700">{a.label}</p>
                  <p className={`mt-1.5 font-num text-[19px] font-bold ${a.value >= 0 ? 'text-info' : 'text-down'}`}>
                    {a.value > 0 ? '+' : ''}
                    {a.value}%
                  </p>
                  <p className="mt-[9px] text-[14px] text-gray-500">{a.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
