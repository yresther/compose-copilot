import logo from '../../assets/logo.svg'
import { useDemoClock } from '../../hooks/useDemoClock'
import { useSidebar } from './AppLayout'
import { SidebarToggle } from './Sidebar'
import { Avatar } from './TopBar'

// 대시보드 홈 다크 영역 상단 — 사이드바가 접혀 있을 때만 >> 버튼과 로고 표시 (열리면 서서히 사라짐)
export default function HomeHeader() {
  const { collapsed, toggle } = useSidebar()
  const clock = useDemoClock('-')

  return (
    <header className="relative flex h-[60px] items-center justify-between pr-[67px]">
      {/* 사이드바가 위에 겹쳐 열리면 >> 버튼과 로고는 부드럽게 사라짐 */}
      <div
        className="flex items-center transition-opacity duration-300 ease-out"
        style={{ opacity: collapsed ? 1 : 0, pointerEvents: collapsed ? undefined : 'none' }}
        aria-hidden={!collapsed || undefined}
      >
        <span className="absolute left-[19px] top-[26px]">
          <SidebarToggle collapsed onClick={toggle} />
        </span>
        <img src={logo} alt="COMPOSE COFFEE" className="ml-[73px] mt-[15px] h-auto w-[161px]" />
      </div>
      <div className="flex items-center gap-6">
        <span className="font-num text-[15px] text-white">{clock}</span>
        <Avatar />
      </div>
    </header>
  )
}
