import { Info } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import SalesTrendChart, { type TrendPoint } from '../../components/charts/SalesTrendChart'
import PageHeader from '../../components/layout/PageHeader'
import BrandCompareCard, { type BrandItem } from '../../components/ui/BrandCompareCard'
import DataTable from '../../components/ui/DataTable'
import DatePill from '../../components/ui/DatePill'
import type { YMD } from '../../components/ui/DatePicker'
import Dropdown from '../../components/ui/Dropdown'
import KpiCard, { type KpiCardData } from '../../components/ui/KpiCard'
import PeriodTabs from '../../components/ui/PeriodTabs'
import SectionCard, { TextLink } from '../../components/ui/SectionCard'
import dashboard from '../../data/dashboard.json'
import kpiData from '../../data/kpi.json'
import report from '../../data/sales-report.json'
import { buildDemoDay } from '../../lib/demoDay'
import { formatNumber, formatRate, formatWon } from '../../lib/format'
import { basisNow, formatDate, formatDateShort, kstDay, kstWeekdayIndex } from '../../lib/kst'
import SalesDetailModal from './SalesDetailModal'

type PeriodKey = 'today' | 'yesterday' | 'lastWeek' | 'lastMonth'
type PeriodData = (typeof report.periods)[PeriodKey]
const PERIODS = dashboard.periods as { key: PeriodKey; label: string }[]
const PERIOD_KEYS = PERIODS.map((p) => p.key)

// 매출 추이 그래프 보기 대상 (전체 ∨)
type ChannelKey = 'all' | '홀' | '테이크아웃' | '배달'
const CHANNELS: { value: ChannelKey; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: '홀', label: '홀' },
  { value: '테이크아웃', label: '테이크아웃' },
  { value: '배달', label: '배달' },
]

// 객단가 표 보기 기준 (채널별 ∨)
type BreakdownKey = 'channel' | 'time' | 'payment'
const BREAKDOWNS: { value: BreakdownKey; label: string }[] = [
  { value: 'channel', label: '채널별' },
  { value: 'time', label: '시간대별' },
  { value: 'payment', label: '결제수단별' },
]

const toYMD = (p: { y: number; m: number; d: number }): YMD => ({ y: p.y, m: p.m, d: p.d })
const weekdayOf = (p: YMD) => ['일', '월', '화', '수', '목', '금', '토'][new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()]
const sameYMD = (a: YMD, b: YMD) => a.y === b.y && a.m === b.m && a.d === b.d

/** 기간별 날짜 문구 (자세히 보기 팝업) */
function periodDateText(period: PeriodKey) {
  if (period === 'today') return formatDate(kstDay(0))
  if (period === 'yesterday') return formatDate(kstDay(-1))
  if (period === 'lastWeek') {
    const mon = -(((kstWeekdayIndex() + 6) % 7) + 7)
    const a = kstDay(mon)
    const b = kstDay(mon + 6)
    return `${a.m}/${a.d} ~ ${b.m}/${b.d}`
  }
  const t = kstDay(0)
  const d = new Date(Date.UTC(t.y, t.m - 2, 1))
  return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월`
}

/** 툴팁 제목 — 시간대는 해당 날짜, 요일은 지난주 그 날짜, 주차는 'N주차' */
function pointTitle(period: PeriodKey, index: number, label: string) {
  if (period === 'today') return formatDateShort(kstDay(0))
  if (period === 'yesterday') return formatDateShort(kstDay(-1))
  if (period === 'lastWeek') {
    const lastMonday = -(((kstWeekdayIndex() + 6) % 7) + 7)
    return formatDateShort(kstDay(lastMonday + index))
  }
  return `${label}차`
}

function trendPoints(period: PeriodKey, trend: PeriodData['trend'], customDate: YMD | null): TrendPoint[] {
  return trend.labels.map((label, i) => ({
    label,
    title: customDate ? formatDateShort({ ...kstDay(0), ...customDate }) : pointTitle(period, i, label),
    current: trend.current[i],
    previous: trend.previous[i],
  }))
}

// 매출 리포트 (03_sales-report.png)
export default function SalesReportPage() {
  // 대시보드 홈의 총 매출·배달 매출 카드에서 넘어오면 (?focus=total|delivery&period=…) 그 그래프로 이동
  const [params] = useSearchParams()
  const focus = params.get('focus')
  const initialPeriod = PERIOD_KEYS.includes(params.get('period') as PeriodKey) ? (params.get('period') as PeriodKey) : 'today'
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod)
  // 브랜드 비교 안내문도 페이지 기준 시각을 따른다
  const [basis, setBasis] = useState(basisNow)
  // 날짜 알약: 오늘·어제를 고르면 해당 기간 탭으로 전환
  const [pickedDate, setPickedDate] = useState<YMD>(() => toYMD(kstDay(initialPeriod === 'yesterday' ? -1 : 0)))
  const [channel, setChannel] = useState<ChannelKey>(focus === 'delivery' ? '배달' : 'all')
  const trendRef = useRef<HTMLElement>(null)
  const [highlight, setHighlight] = useState(Boolean(focus))
  useEffect(() => {
    if (!focus) return
    const scroll = setTimeout(() => trendRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    // 노란 테두리로 잠깐 표시했다가 사라짐
    const fade = setTimeout(() => setHighlight(false), 2000)
    return () => {
      clearTimeout(scroll)
      clearTimeout(fade)
    }
  }, [focus])
  const [breakdown, setBreakdown] = useState<BreakdownKey>('channel')
  const [detailOpen, setDetailOpen] = useState(false)
  // 오늘·어제 외의 날짜를 고르면 그날의 데모 데이터를 만들어 보여준다 (기간 탭은 선택 해제)
  const [customDate, setCustomDate] = useState<YMD | null>(null)
  const demo = useMemo(() => (customDate ? buildDemoDay(customDate) : null), [customDate])

  const changePeriod = (p: PeriodKey) => {
    setPeriod(p)
    setCustomDate(null)
    setPickedDate(toYMD(kstDay(p === 'yesterday' ? -1 : 0)))
  }

  const pickDate = (d: YMD) => {
    if (sameYMD(d, toYMD(kstDay(0)))) return changePeriod('today')
    if (sameYMD(d, toYMD(kstDay(-1)))) return changePeriod('yesterday')
    setCustomDate(d)
    setPickedDate(d)
  }

  const data = demo ? demo.data : report.periods[period]
  // KPI는 대시보드 홈과 같은 원본 (고른 날짜는 데모 데이터)
  const kpis = demo ? demo.kpis : ((period === 'today' ? kpiData.today : kpiData.past[period]) as KpiCardData[])
  const periodTotal = data.trend.current[data.trend.current.length - 1]
  // 채널을 고르면 그 채널의 매출 비중만큼 그래프를 나눠서 보여준다 (배달 = KPI 배달 매출과 동일)
  const channelRow = data.breakdowns.channel.find((r) => r.name === channel)
  const channelShare = channelRow?.revenue ? channelRow.revenue / periodTotal : 1
  const trend = {
    ...data.trend,
    current: data.trend.current.map((v) => Math.round(v * channelShare)),
    previous: data.trend.previous.map((v) => Math.round(v * channelShare)),
  }
  const total = trend.current[trend.current.length - 1]
  const prevTotal = trend.previous[trend.previous.length - 1]
  const up = total >= prevTotal

  return (
    <div className="pb-28">
      <PageHeader
        title="매출 리포트"
        basis
        onRefresh={setBasis}
        right={<DatePill value={pickedDate} onChange={pickDate} />}
        className="pt-[14px]"
      />

      <div className="px-page">
        <div className="mt-[31px]">
          <PeriodTabs variant="light" items={PERIODS} value={(customDate ? '' : period) as PeriodKey} onChange={changePeriod} />
        </div>

        {/* KPI */}
        {/* 피크타임 카드는 홈과 같은 207px — 숫자 크기·정렬을 홈과 동일하게 */}
        <div className="mt-9 grid grid-cols-[383fr_369fr_187fr_207px] gap-5">
          {kpis.map((k) => (
            <KpiCard key={k.title} {...k} lightPeak softTint shadow valueWeight="extrabold" live={period === 'today' && !customDate} />
          ))}
        </div>

        {/* 매출 추이 */}
        <section
          ref={trendRef}
          className={`relative mt-6 h-[405px] rounded-card border bg-white transition-[border-color,box-shadow] duration-500 ${
            highlight ? 'border-yellow-300 shadow-float' : 'border-transparent'
          }`}
        >
          <div className="pl-[29px] pt-[25px]">
            <h2 className="text-[16px] font-semibold text-gray-900">{channel === 'all' ? '총 매출' : `${channel} 매출`}</h2>
            <p className="mt-3 font-num text-display font-extrabold text-gray-900">{formatWon(total)}</p>
            <p className="mt-[3px] flex items-center gap-1.5 text-[15px] font-medium text-gray-900">
              <span className={`text-[10px] ${up ? 'text-success' : 'text-down'}`}>{up ? '▲' : '▼'}</span>
              {trend.compare} <span className="font-num">{formatRate(total, prevTotal)}</span>
            </p>
          </div>
          <div className="absolute right-7 top-[29px] flex items-center gap-[30px]">
            <div className="flex items-center gap-[26px] text-[13px] text-gray-600">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                {trend.legend.previous}
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success" />
                {trend.legend.current}
              </span>
            </div>
            <Dropdown options={CHANNELS} value={channel} onChange={setChannel} ariaLabel="그래프 채널" />
          </div>
          <div className="absolute bottom-[17px] left-[29px] right-0 top-[141px]">
            <SalesTrendChart data={trendPoints(period, trend, customDate)} legend={trend.legend} live={period === 'today' && !customDate} />
          </div>
        </section>

        {/* Top5 · 채널별 객단가 */}
        <div className="mt-[30px] grid grid-cols-2 gap-4">
          <SectionCard
            title="상위 판매 Top5"
            right={
              <TextLink size="sm" onClick={() => setDetailOpen(true)}>
                자세히 보기
              </TextLink>
            }
            className="min-h-[320px] px-[33px] pb-[25px] pt-[26px]"
          >
            <div className="mt-5">
              <DataTable
                template="148px 149px 148px 1fr"
                rowKey={(r) => r.name}
                rows={data.ranking.slice(0, 5)}
                columns={[
                  { key: 'name', header: '상품명', render: (r) => r.name },
                  { key: 'qty', header: '판매량', render: (r) => <span className="font-num">{formatNumber(r.qty)}잔</span> },
                  { key: 'revenue', header: '매출액', render: (r) => <span className="font-num">{formatWon(r.revenue)}</span> },
                  {
                    key: 'share',
                    header: '비중',
                    render: (r) => <span className="font-num">{((r.revenue / periodTotal) * 100).toFixed(1)}%</span>,
                  },
                ]}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="객단가"
            right={<Dropdown variant="plain" options={BREAKDOWNS} value={breakdown} onChange={setBreakdown} ariaLabel="객단가 보기 기준" />}
            className="min-h-[320px] px-[33px] pb-[25px] pt-[26px]"
          >
            <div className="mt-[29px]">
              <DataTable
                template="147px 149px 148px 1fr"
                rowKey={(r) => r.name}
                rows={data.breakdowns[breakdown]}
                columns={[
                  { key: 'name', header: '구분', render: (r) => r.name },
                  { key: 'count', header: '거래수', render: (r) => <span className="font-num">{formatNumber(r.count)}건</span> },
                  { key: 'avg', header: '객단가', render: (r) => <span className="font-num">{formatWon(r.avg)}</span> },
                  {
                    key: 'diff',
                    header: data.breakdownDiffLabel,
                    render: (r) => (
                      <span className="flex items-center gap-1.5 font-num">
                        <span className={`text-[10px] ${r.diff >= 0 ? 'text-success' : 'text-down'}`}>{r.diff >= 0 ? '▲' : '▼'}</span>
                        {formatWon(Math.abs(r.diff))}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          </SectionCard>
        </div>

        {/* 브랜드 평균 비교 — 기간 탭과 상관없이 오늘 기준 */}
        <section className="mt-[39px]">
          <h2 className="text-pagetitle text-gray-900">{report.brand.title}</h2>
          <div className="mt-1.5 flex items-center justify-between text-[14px]">
            <p className="text-gray-700">{report.brand.description}</p>
            <p className="flex items-center gap-1.5 text-gray-500">
              <Info size={16} className="fill-gray-400 text-white" />
              오늘 {basis}, 브랜드 내 {report.brand.stores}개 가맹점 대비
            </p>
          </div>
          <div className="mt-[29px] grid grid-cols-3 gap-4">
            {(report.brand.items as BrandItem[]).map((item) => (
              <BrandCompareCard key={item.key} item={item} />
            ))}
          </div>
        </section>
      </div>

      <SalesDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        periodLabel={customDate ? `${customDate.m}월 ${customDate.d}일` : PERIODS.find((p) => p.key === period)!.label}
        dateText={customDate ? formatDate({ ...kstDay(0), ...customDate, weekday: weekdayOf(customDate) }) : periodDateText(period)}
        total={periodTotal}
        ranking={data.ranking}
      />
    </div>
  )
}
