import { ChevronRight, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { findNav } from '../../config/nav'
import { useDemoClock } from '../../hooks/useDemoClock'

export function Avatar() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white">
      <User size={20} fill="currentColor" strokeWidth={0} />
    </span>
  )
}

export default function TopBar() {
  const { pathname } = useLocation()
  const nav = findNav(pathname)
  const clock = useDemoClock('.')

  return (
    <header className="flex h-topbar items-center justify-between px-page">
      {/* 화살표 아이콘 안 여백(약 6px)을 빼고 글자와 화살표 사이가 보이는 거리로 11px */}
      <nav aria-label="breadcrumb" className="flex items-center gap-[5px] text-[16px]">
        {nav && (
          <>
            <span className="font-medium text-gray-400">{nav.group.label}</span>
            <ChevronRight size={18} strokeWidth={1.75} className="text-gray-800" />
            <span className="font-semibold text-gray-900">{nav.item.label}</span>
          </>
        )}
      </nav>
      <div className="flex items-center gap-6">
        <span className="font-num text-[15px] text-gray-800">{clock}</span>
        <Avatar />
      </div>
    </header>
  )
}
