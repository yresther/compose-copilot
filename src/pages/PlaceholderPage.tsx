import { useLocation } from 'react-router-dom'
import { findNav } from '../config/nav'

// 아직 구현 전인 페이지 — 레이아웃 확인용
export default function PlaceholderPage({ title }: { title?: string }) {
  const { pathname } = useLocation()
  const label = title ?? findNav(pathname)?.item.label ?? pathname

  return (
    <div className="px-page pt-6">
      <h1 className="text-pagetitle">{label}</h1>
      <p className="mt-3 text-body2 text-gray-500">이 페이지는 아직 구현 전이에요.</p>
    </div>
  )
}
