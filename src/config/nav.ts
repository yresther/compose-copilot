// 사이드바 IA — 5개 대분류, 9개 하위페이지
export type NavItem = { label: string; path: string }
export type NavGroup = { label: string; items: NavItem[] }

export const NAV_GROUPS: NavGroup[] = [
  {
    label: '대시보드',
    items: [
      { label: '실시간 브리핑', path: '/dashboard' },
      { label: '오늘의 할 일', path: '/dashboard/action' },
    ],
  },
  {
    label: '매출분석',
    items: [
      { label: '매출 리포트', path: '/sales/report' },
      { label: '매출 패턴 분석', path: '/sales/pattern' },
    ],
  },
  {
    label: '발주 / 재고',
    items: [
      { label: '발주 관리', path: '/order' },
      { label: '재고 현황', path: '/inventory' },
    ],
  },
  {
    label: '자금 관리',
    items: [
      { label: '정책 자금', path: '/funding/policy' },
      { label: '지출 관리', path: '/funding/expense' },
    ],
  },
  {
    label: '리뷰',
    items: [{ label: '리뷰 분석', path: '/review' }],
  },
]

/** 현재 경로가 속한 대분류·하위페이지 (가장 길게 일치하는 경로 기준) */
// 사이드바에는 없지만 상단 경로(breadcrumb)를 보여줄 페이지
const HIDDEN_PAGES: { group: string; item: NavItem }[] = [{ group: '대시보드', item: { label: '알림', path: '/dashboard/notifications' } }]

export function findNav(pathname: string): { group: NavGroup; item: NavItem } | undefined {
  const hidden = HIDDEN_PAGES.find((p) => p.item.path === pathname)
  if (hidden) return { group: NAV_GROUPS.find((g) => g.label === hidden.group)!, item: hidden.item }
  let found: { group: NavGroup; item: NavItem } | undefined
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const match = pathname === item.path || pathname.startsWith(item.path + '/')
      if (match && (!found || item.path.length > found.item.path.length)) found = { group, item }
    }
  }
  return found
}
