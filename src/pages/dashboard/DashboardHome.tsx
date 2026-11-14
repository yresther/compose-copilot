import { Bell, ChevronRight, RotateCw } from 'lucide-react'
import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import logo from '../../assets/logo.svg'
import HomeHeader from '../../components/layout/HomeHeader'
import { basisNow } from '../../lib/kst'
import ActionCard, { type ActionCardData } from '../../components/ui/ActionCard'
import Button from '../../components/ui/Button'
import EmptyActions from '../../components/ui/EmptyActions'
import KpiCard, { type KpiCardData } from '../../components/ui/KpiCard'
import PeriodTabs from '../../components/ui/PeriodTabs'
import { useToast } from '../../components/ui/Toast'
import dashboard from '../../data/dashboard.json'
import kpiData from '../../data/kpi.json'
import ClosingReportBanner from './ClosingReportBanner'
import NotificationPopover from './NotificationPopover'
import DemoModeToggle, { type DashboardMode } from './DemoModeToggle'
import DeleteActionsModal from './DeleteActionsModal'
import ReportSendModal from './ReportSendModal'
import { ACTIONS, doneToast, useActions } from '../../state/ActionsContext'
import { useNotifications } from '../../state/NotificationsContext'
import { useSidebar } from '../../components/layout/AppLayout'
import { useLiveActionList } from '../../state/useLiveActions'

type PeriodKey = 'today' | 'yesterday' | 'lastWeek' | 'lastMonth'
const PERIODS = dashboard.periods as { key: PeriodKey; label: string }[]
// 누르면 매출 리포트의 해당 그래프로 (총 매출 → 전체, 배달 매출 → 배달)
const REPORT_FOCUS: Record<string, 'total' | 'delivery'> = { '총 매출': 'total', '배달 매출': 'delivery' }

/** ?mode=closing 이면 영업종료(마감 리포트) 화면 */
export function useDashboardMode(): [DashboardMode, (m: DashboardMode) => void] {
  const [params, setParams] = useSearchParams()
  const mode: DashboardMode = params.get('mode') === 'closing' ? 'closing' : 'live'
  const setMode = (m: DashboardMode) => setParams(m === 'closing' ? { mode: 'closing' } : {}, { replace: true })
  return [mode, setMode]
}

export default function DashboardHome() {
  const navigate = useNavigate()
  const toast = useToast()
  const { unreadCount } = useNotifications()
  // 미확인 알림 버튼 → 알림 창 (전체보기로 알림 페이지)
  const alertRef = useRef<HTMLButtonElement>(null)
  const [alertOpen, setAlertOpen] = useState(false)
  const [mode, setMode] = useDashboardMode()
  const { collapsed } = useSidebar()
  const [period, setPeriod] = useState<PeriodKey>('today')
  const [spin, setSpin] = useState(0)
  // 실시간 브리핑 기준 시각 — 처음 열 때와 새로고침할 때의 현재 시각(KST)
  const [liveBasis, setLiveBasis] = useState(basisNow)
  const [sendOpen, setSendOpen] = useState(false)
  // 체크·완료 상태는 액션 제안 페이지와 공유
  const { checked, setChecked, completed, complete, remove } = useActions()
  // 완료하지 않은 할 일 삭제 — 확인 모달 후 홈·오늘의 할 일 페이지에서 함께 사라짐
  const [deleteOpen, setDeleteOpen] = useState(false)
  const liveActions = useLiveActionList()

  const data = dashboard.modes[mode]
  const closing = mode === 'closing'
  // KPI 수치는 매출 리포트와 같은 원본(kpi.json)을 쓴다
  const kpis = (period === 'today' ? (closing ? kpiData.closing : kpiData.today) : kpiData.past[period]) as KpiCardData[]
  // 영업중: 공유 액션 + 완료 상태 / 영업종료: 마감 캡처 기준으로 고정된 처리 현황
  const actions: ActionCardData[] = closing
    ? dashboard.modes.closing.actionOverrides.map((o) => ({ ...ACTIONS.find((a) => a.id === o.id)!, ...o }) as ActionCardData)
    : liveActions.filter((a) => !a.done)
  // 완료한 할 일은 홈에서 빠지고 오늘의 할 일 페이지의 '완료한 항목' 탭으로
  const doneCount = liveActions.filter((a) => a.done).length
  const selected = [...checked].filter((id) => !completed[id])

  const changeMode = (m: DashboardMode) => {
    setMode(m)
    setPeriod('today')
  }

  const completeChecked = () => {
    complete(selected)
    toast.show(doneToast(selected.length))
  }

  const deleteChecked = () => {
    remove(selected)
    setDeleteOpen(false)
    toast.show(`할 일 ${selected.length}개를 삭제했어요.`)
  }

  // 액션 제안 페이지와 같은 목적지로 이동
  const onAction = (a: ActionCardData) => a.link && navigate(a.link)

  return (
    <div className={closing ? 'pb-[58px]' : 'pb-20'}>
      {/* 상단 다크 영역 */}
      {/* 사이드바가 열리면 사이드바와 맞닿는 왼쪽 아래 모서리는 각지게 */}
      <section
        data-home-hero
        className={`relative overflow-hidden rounded-br-[10px] bg-brown-900 pb-[38px] ${collapsed ? 'rounded-bl-[10px]' : ''}`}
      >
        <img
          src={logo}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-[-80px] top-[248px] w-[850px] opacity-[0.025] grayscale brightness-200"
        />
        <HomeHeader />

        <button
          ref={alertRef}
          type="button"
          aria-expanded={alertOpen}
          onClick={() => setAlertOpen((o) => !o)}
          className="absolute right-[68px] top-[89px] z-10 flex h-[38px] items-center gap-2.5 rounded-full bg-yellow-300 px-[17px] text-[15px] font-semibold text-gray-900 transition hover:brightness-105"
        >
          <Bell size={18} fill="currentColor" strokeWidth={1.5} />
          미확인 알림 <span className="font-num">{closing ? data.alerts : unreadCount}건</span>
        </button>
        <NotificationPopover anchor={alertRef} open={alertOpen} onClose={() => setAlertOpen(false)} />

        <div className="relative px-[72px]">
          <p className="mt-[27px] flex items-center text-[14px]">
            <span className={`mr-2.5 h-1.5 w-1.5 rounded-full ${closing ? 'bg-gray-400' : 'bg-success'}`} />
            <span className="font-semibold text-white">{data.status.label}</span>
            <span className="ml-3.5 font-medium text-gray-400">{data.status.meta}</span>
          </p>
          <h1 className="mt-4 text-headline text-white">
            {data.greeting.text} <span className="font-normal">{data.greeting.emoji}</span>
          </h1>

          <div className="mt-[30px] flex items-center">
            <h2 className="text-pagetitle text-white">{data.section.title}</h2>
            <span className="ml-[15px] font-num text-[14px] text-gray-500">{'basis' in data.section ? data.section.basis : liveBasis}</span>
            {data.section.refresh && (
              <button
                type="button"
                aria-label="새로고침"
                onClick={() => {
                  setSpin((s) => s + 360)
                  setLiveBasis(basisNow())
                }}
                className="ml-2 text-gray-500 hover:text-gray-300"
              >
                <RotateCw size={15} style={{ transform: `rotate(${spin}deg)`, transition: 'transform 600ms ease' }} />
              </button>
            )}
          </div>

          <div className="mt-[29px]">
            <PeriodTabs items={PERIODS} value={period} onChange={setPeriod} />
          </div>

          {/* 칸 너비를 정수 px로 맞춰 카드 사이 간격이 화면에서도 똑같이 16px로 보이게 */}
          <div className="mt-7 grid grid-cols-[minmax(0,1fr)_round(down,31.7%,1px)_207px_207px] gap-4">
            {kpis.map((k) => (
              <KpiCard
                key={k.title}
                {...k}
                neutral={closing}
                live={!closing && period === 'today'}
                valueWeight="extrabold"
                onClick={
                  REPORT_FOCUS[k.title] ? () => navigate(`/sales/report?focus=${REPORT_FOCUS[k.title]}&period=${period}`) : undefined
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* 액션 제안 / 처리 현황 */}
      <section className="px-[72px]">
        <div className={`${closing ? 'mt-[35px]' : 'mt-[26px]'} flex items-baseline gap-3.5`}>
          <h2 className="text-pagetitle text-gray-900">{data.actionsTitle}</h2>
          <span className="font-num text-[14px] text-gray-500">{data.actionsSub}</span>
          {!closing && doneCount > 0 && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/action?tab=done')}
              className="ml-auto flex items-center gap-0.5 text-[14px] text-gray-600 hover:text-gray-900"
            >
              {dashboard.doneLink} <span className="font-num font-semibold text-gray-900">{doneCount}</span>개
              <ChevronRight size={16} />
            </button>
          )}
        </div>
        {actions.length === 0 && <EmptyActions variant={doneCount > 0 ? 'allDone' : 'none'} className="mt-[15px]" />}
        <div
          className={`${closing ? 'mt-[26px]' : 'mt-[15px]'} grid grid-cols-3 items-start gap-4 ${actions.length === 0 ? 'hidden' : ''}`}
        >
          {actions.map((a) => (
            <ActionCard
              key={`${mode}-${a.id}`}
              data={a}
              onAction={onAction}
              checked={closing ? undefined : checked.has(a.id)}
              onCheckedChange={closing ? undefined : (on) => setChecked(a.id, on)}
            />
          ))}
        </div>
        {!closing && actions.length > 0 && (
          <div className="mt-[34px] flex justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              className="w-[160px] disabled:text-gray-400 disabled:hover:bg-white"
              disabled={selected.length === 0}
              onClick={() => setDeleteOpen(true)}
            >
              삭제하기
            </Button>
            <Button size="lg" className="w-[234px]" disabled={selected.length === 0} onClick={completeChecked}>
              완료하기
            </Button>
          </div>
        )}
      </section>

      {closing && <ClosingReportBanner onPreview={() => toast.show('리포트 미리보기는 준비중이에요')} onSend={() => setSendOpen(true)} />}
      <ReportSendModal open={sendOpen} onClose={() => setSendOpen(false)} />
      <DeleteActionsModal
        open={deleteOpen}
        items={actions.filter((a) => selected.includes(a.id))}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteChecked}
      />
      <DemoModeToggle mode={mode} onChange={changeMode} />
    </div>
  )
}
