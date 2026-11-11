import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation, useSearchParams } from 'react-router-dom'
import FloatingAskAI from '../ui/FloatingAskAI'
import Sidebar, { DURATION, EASE } from './Sidebar'
import TopBar from './TopBar'

// 대시보드 홈은 자체 다크 헤더를 쓰고, 사이드바가 기본으로 접혀 있다
const HOME_PATH = '/dashboard'
// 온보딩 5단계(첫 인사이트) — 사이드바는 좁은 막대로 접고, 상단 바·AI 버튼 없이 (캡처 00_onboarding_05)
const INSIGHT_PATH = '/onboarding/5'

type SidebarState = { collapsed: boolean; toggle: () => void }
const SidebarContext = createContext<SidebarState>({ collapsed: false, toggle: () => {} })
export const useSidebar = () => useContext(SidebarContext)

export default function AppLayout() {
  const { pathname } = useLocation()
  const isHome = pathname === HOME_PATH
  const isInsight = pathname === INSIGHT_PATH
  // 마감(영업종료) 화면에는 AI 버튼 대신 리포트 배너가 뜬다
  const [params] = useSearchParams()
  const showAskAI = !(isHome && params.get('mode') === 'closing') && !isInsight
  const [collapsed, setCollapsed] = useState(isHome || isInsight)

  // 페이지 이동 시 캡처 기준 기본값으로: 홈은 접힘, 나머지는 펼침
  useEffect(() => {
    setCollapsed(pathname === HOME_PATH || pathname === INSIGHT_PATH)
  }, [pathname])

  // 홈 히어로(갈색 영역) 높이 — 사이드바 뒤 배경을 같은 높이로 맞춤
  const [heroHeight, setHeroHeight] = useState(0)
  useEffect(() => {
    if (!isHome) return
    const hero = document.querySelector<HTMLElement>('[data-home-hero]')
    if (!hero) return
    const measure = () => setHeroHeight(hero.getBoundingClientRect().bottom + window.scrollY)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(hero)
    return () => ro.disconnect()
  }, [isHome, params])

  const toggle = () => setCollapsed((c) => !c)
  const mode = !collapsed ? 'expanded' : isHome ? 'hidden' : 'rail'

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      <div className="relative flex min-h-screen">
        {/* 홈: 반투명 사이드바 뒤에 히어로 갈색(위) · 흰 바탕(아래)을 깔아, 히어로 위에 얹힌 것처럼 비쳐 보이게 */}
        {isHome && (
          // 사이드바와 같은 폭·같은 움직임으로 늘고 줄어, 본문(카드)을 가리지 않음
          <div
            className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden bg-white"
            style={{ width: collapsed ? 0 : 180, transition: `width ${DURATION}ms ${EASE}` }}
            aria-hidden
          >
            <div className="bg-brown-900" style={{ height: heroHeight }} />
          </div>
        )}
        <Sidebar mode={mode} onToggle={toggle} home={isHome} />
        <main className="min-w-0 flex-1">
          {!isHome && !isInsight && <TopBar />}
          <Outlet />
        </main>
      </div>
      {showAskAI && <FloatingAskAI />}
    </SidebarContext.Provider>
  )
}
