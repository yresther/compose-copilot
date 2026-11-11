import { ChevronsLeft, ChevronsRight } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import logoMark from '../../assets/logo-mark.svg'
import { NAV_GROUPS } from '../../config/nav'

type Props = {
  /** expanded: 180px 메뉴 / rail: 60px 접힘 바 / hidden: 완전히 숨김 (대시보드 홈) */
  mode: 'expanded' | 'rail' | 'hidden'
  onToggle: () => void
  /** 대시보드 홈: 흰 바탕 대신 뒤에 깔린 히어로 갈색·흰 바탕이 비쳐 보이고, 히어로와 나뉘도록 그림자 */
  home?: boolean
}

// 열고 닫을 때 같은 곡선 — 처음엔 빠르게, 끝은 천천히 내려앉도록
export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
export const DURATION = 480
// 사이드바 색 — brown-900보다 살짝 어두운 갈색 90% + 뒤 배경 4px 블러
const TINT = 'rgba(28, 26, 23, 0.9)'
const WIDTH = { expanded: 180, rail: 60, hidden: 0 } as const

export function SidebarToggle({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  const Icon = collapsed ? ChevronsRight : ChevronsLeft
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
      className="flex h-6 w-6 items-center justify-center rounded bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
    >
      <Icon size={16} strokeWidth={1.5} />
    </button>
  )
}

export default function Sidebar({ mode, onToggle, home }: Props) {
  const open = mode === 'expanded'

  return (
    <aside
      data-flow=""
      aria-hidden={mode === 'hidden' || undefined}
      inert={mode === 'hidden' || undefined}
      className={`sticky top-0 h-screen shrink-0 overflow-hidden backdrop-blur-[4px] ${home ? 'z-30' : ''} ${home && open ? 'shadow-side' : ''}`}
      // 본문을 밀면서 폭이 부드럽게 변함 (홈 0 ↔ 180px, 나머지 60 ↔ 180px)
      // 홈: 뒤에 깔린 히어로 갈색·흰 바탕(AppLayout)이 비침 / 나머지: 흰 바탕 위에 올려진 색
      style={{
        width: WIDTH[mode],
        backgroundImage: home ? `linear-gradient(${TINT}, ${TINT})` : `linear-gradient(${TINT}, ${TINT}), linear-gradient(#fff, #fff)`,
        transition: `width ${DURATION}ms ${EASE}, box-shadow ${DURATION}ms ${EASE}`,
      }}
    >
      {/* 접기/펼치기 버튼 — 펼침에선 오른쪽 위, 접힘(60px)에선 가운데로 자연스럽게 따라옴 */}
      <span className="absolute top-[26px] z-10" style={{ right: open ? 17 : 18, transition: `right ${DURATION}ms ${EASE}` }}>
        <SidebarToggle collapsed={!open} onClick={onToggle} />
      </span>

      {/* 메뉴는 180px 폭을 유지한 채 접힐 때 먼저 사라지고, 펼칠 때 살짝 늦게 나타남 */}
      <div
        className="flex h-full w-sidebar flex-col overflow-y-auto"
        style={{
          opacity: open ? 1 : 0,
          transform: `translateX(${open ? 0 : -12}px)`,
          transition: open
            ? `opacity 320ms ease-out 140ms, transform ${DURATION}ms ${EASE} 80ms`
            : `opacity 160ms ease-in, transform 240ms ease-in`,
          pointerEvents: open ? undefined : 'none',
        }}
        aria-hidden={!open || undefined}
      >
        <div className="pl-7 pt-[21px]">
          <NavLink to="/dashboard" aria-label="대시보드 홈" tabIndex={open ? undefined : -1} className="inline-block">
            <img src={logoMark} alt="COMPOSE COFFEE" className="h-[34px] w-[35px]" />
          </NavLink>
        </div>

        <nav className="mt-[48px] flex flex-col gap-[34px] pb-10 pl-7">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-6 text-caption font-normal text-gray-500">{group.label}</p>
              <ul className="flex flex-col gap-[17px]">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end
                      tabIndex={open ? undefined : -1}
                      className={({ isActive }) =>
                        `text-body1 transition-colors ${isActive ? 'text-yellow-300' : 'text-white hover:text-yellow-100'}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
